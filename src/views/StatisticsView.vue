<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import StatsCard from '@/components/statistics/StatsCard.vue'
import DonutChart from '@/components/statistics/DonutChart.vue'
import QuestionResults from '@/components/statistics/QuestionResults.vue'

const router = useRouter()
const quizStore = useQuizStore()

const statistics = computed(() => quizStore.statistics)
const isQuizCompleted = computed(() => quizStore.isQuizCompleted)

const accuracyColor = computed(() => {
  const accuracy = statistics.value.accuracy
  if (accuracy >= 80) return 'green'
  if (accuracy >= 60) return 'yellow'
  return 'red'
})

const timeFormatted = computed(() => {
  const seconds = statistics.value.timeSpent
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
})

onMounted(() => {
  // Redirect if no quiz data available
  if (!isQuizCompleted.value && statistics.value.totalQuestions === 0) {
    router.push('/')
  }
})

function restartQuiz() {
  quizStore.resetQuiz()
  router.push('/')
}

function continueLearning() {
  // Reset and go back to first question for review
  quizStore.currentQuestionIndex = 0
  quizStore.isQuizActive = true
  quizStore.isQuizCompleted = false
  router.push('/quiz')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz Ergebnisse</h1>
        <p v-if="isQuizCompleted" class="text-gray-600">
          Herzlichen Glückwunsch! Sie haben das Quiz erfolgreich abgeschlossen.
        </p>
        <p v-else class="text-gray-600">
          Hier ist Ihr aktueller Fortschritt im Quiz.
        </p>
      </div>

      <!-- No Data State -->
      <div v-if="statistics.totalQuestions === 0" class="text-center py-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Keine Daten verfügbar</h2>
        <p class="text-gray-600 mb-6">Es sind keine Quiz-Ergebnisse vorhanden.</p>
        <button
          @click="goHome"
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Neues Quiz starten
        </button>
      </div>

      <!-- Statistics Dashboard -->
      <div v-else>
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Gesamtfragen"
            :value="statistics.totalQuestions"
            icon="question"
            color="blue"
          />

          <StatsCard
            title="Richtige Antworten"
            :value="statistics.correctAnswers"
            icon="check"
            color="green"
          />

          <StatsCard
            title="Falsche Antworten"
            :value="statistics.wrongAnswers"
            icon="x"
            color="red"
          />

          <StatsCard
            title="Genauigkeit"
            :value="`${Math.round(statistics.accuracy)}%`"
            :subtitle="isQuizCompleted ? 'Endpunktzahl' : 'Aktueller Stand'"
            icon="chart"
            :color="accuracyColor"
          />
        </div>

        <!-- Time and Performance -->
        <div v-if="isQuizCompleted" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Benötigte Zeit"
            :value="timeFormatted"
            icon="clock"
            color="gray"
            subtitle="Gesamtzeit für das Quiz"
          />

          <StatsCard
            title="Ø Zeit pro Frage"
            :value="`${Math.round(statistics.timeSpent / statistics.totalQuestions)}s`"
            icon="clock"
            color="gray"
            subtitle="Durchschnittliche Bearbeitungszeit"
          />

          <StatsCard
            title="Performance"
            :value="statistics.accuracy >= 80 ? 'Ausgezeichnet' : statistics.accuracy >= 60 ? 'Gut' : 'Verbesserungsfähig'"
            :color="accuracyColor"
            :subtitle="`${statistics.correctAnswers} von ${statistics.totalQuestions} richtig`"
          />
        </div>

        <!-- Charts and Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Donut Chart -->
          <DonutChart
            :correct="statistics.correctAnswers"
            :incorrect="statistics.wrongAnswers"
            title="Ergebnisverteilung"
          />

          <!-- Detailed Results -->
          <QuestionResults
            :questions="quizStore.questions"
            :answers="quizStore.answers"
          />
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            v-if="!isQuizCompleted"
            @click="continueLearning"
            class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Quiz fortsetzen
          </button>

          <button
            v-if="isQuizCompleted"
            @click="continueLearning"
            class="bg-success text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Fragen wiederholen
          </button>

          <button
            @click="restartQuiz"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Neues Quiz starten
          </button>
        </div>

        <!-- Performance Tips -->
        <div v-if="isQuizCompleted" class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-900 mb-4">💡 Lerntipps</h3>

          <div v-if="statistics.accuracy >= 80" class="text-blue-800">
            <p class="mb-2"><strong>Ausgezeichnet!</strong> Sie haben sehr gut abgeschnitten.</p>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>Vertiefen Sie Ihr Wissen in den Bereichen, die Sie unsicher gemacht haben</li>
              <li>Probieren Sie schwierigere Fragen oder verwandte Themen</li>
              <li>Teilen Sie Ihr Wissen mit anderen Lernenden</li>
            </ul>
          </div>

          <div v-else-if="statistics.accuracy >= 60" class="text-blue-800">
            <p class="mb-2"><strong>Gute Leistung!</strong> Sie sind auf dem richtigen Weg.</p>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>Wiederholen Sie die falsch beantworteten Fragen</li>
              <li>Nutzen Sie die KI-Erklärungen für besseres Verständnis</li>
              <li>Üben Sie regelmäßig, um Ihr Wissen zu festigen</li>
            </ul>
          </div>

          <div v-else class="text-blue-800">
            <p class="mb-2"><strong>Übung macht den Meister!</strong> Lassen Sie sich nicht entmutigen.</p>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>Gehen Sie die Fragen nochmals durch und nutzen Sie die Erklärungen</li>
              <li>Wiederholen Sie das Quiz mehrmals</li>
              <li>Konzentrieren Sie sich auf die Grundlagen</li>
              <li>Nehmen Sie sich mehr Zeit für jede Frage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>