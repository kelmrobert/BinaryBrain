&lt;script setup lang="ts"&gt;
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import StatsCard from '@/components/statistics/StatsCard.vue'
import DonutChart from '@/components/statistics/DonutChart.vue'
import QuestionResults from '@/components/statistics/QuestionResults.vue'

const router = useRouter()
const quizStore = useQuizStore()

const statistics = computed(() =&gt; quizStore.statistics)
const isQuizCompleted = computed(() =&gt; quizStore.isQuizCompleted)

const accuracyColor = computed(() =&gt; {
  const accuracy = statistics.value.accuracy
  if (accuracy &gt;= 80) return 'green'
  if (accuracy &gt;= 60) return 'yellow'
  return 'red'
})

const timeFormatted = computed(() =&gt; {
  const seconds = statistics.value.timeSpent
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes &gt; 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
})

onMounted(() =&gt; {
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
&lt;/script&gt;

&lt;template&gt;
  &lt;main class="py-8"&gt;
    &lt;div class="container mx-auto px-4 max-w-6xl"&gt;
      &lt;!-- Header --&gt;
      &lt;div class="text-center mb-8"&gt;
        &lt;h1 class="text-3xl font-bold text-gray-900 mb-2"&gt;Quiz Ergebnisse&lt;/h1&gt;
        &lt;p v-if="isQuizCompleted" class="text-gray-600"&gt;
          Herzlichen Glückwunsch! Sie haben das Quiz erfolgreich abgeschlossen.
        &lt;/p&gt;
        &lt;p v-else class="text-gray-600"&gt;
          Hier ist Ihr aktueller Fortschritt im Quiz.
        &lt;/p&gt;
      &lt;/div&gt;

      &lt;!-- No Data State --&gt;
      &lt;div v-if="statistics.totalQuestions === 0" class="text-center py-16"&gt;
        &lt;h2 class="text-2xl font-bold text-gray-900 mb-4"&gt;Keine Daten verfügbar&lt;/h2&gt;
        &lt;p class="text-gray-600 mb-6"&gt;Es sind keine Quiz-Ergebnisse vorhanden.&lt;/p&gt;
        &lt;button
          @click="goHome"
          class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        &gt;
          Neues Quiz starten
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;!-- Statistics Dashboard --&gt;
      &lt;div v-else&gt;
        &lt;!-- Overview Cards --&gt;
        &lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"&gt;
          &lt;StatsCard
            title="Gesamtfragen"
            :value="statistics.totalQuestions"
            icon="question"
            color="blue"
          /&gt;

          &lt;StatsCard
            title="Richtige Antworten"
            :value="statistics.correctAnswers"
            icon="check"
            color="green"
          /&gt;

          &lt;StatsCard
            title="Falsche Antworten"
            :value="statistics.wrongAnswers"
            icon="x"
            color="red"
          /&gt;

          &lt;StatsCard
            title="Genauigkeit"
            :value="`${Math.round(statistics.accuracy)}%`"
            :subtitle="isQuizCompleted ? 'Endpunktzahl' : 'Aktueller Stand'"
            icon="chart"
            :color="accuracyColor"
          /&gt;
        &lt;/div&gt;

        &lt;!-- Time and Performance --&gt;
        &lt;div v-if="isQuizCompleted" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"&gt;
          &lt;StatsCard
            title="Benötigte Zeit"
            :value="timeFormatted"
            icon="clock"
            color="gray"
            subtitle="Gesamtzeit für das Quiz"
          /&gt;

          &lt;StatsCard
            title="Ø Zeit pro Frage"
            :value="`${Math.round(statistics.timeSpent / statistics.totalQuestions)}s`"
            icon="clock"
            color="gray"
            subtitle="Durchschnittliche Bearbeitungszeit"
          /&gt;

          &lt;StatsCard
            title="Performance"
            :value="statistics.accuracy &gt;= 80 ? 'Ausgezeichnet' : statistics.accuracy &gt;= 60 ? 'Gut' : 'Verbesserungsfähig'"
            :color="accuracyColor"
            :subtitle="`${statistics.correctAnswers} von ${statistics.totalQuestions} richtig`"
          /&gt;
        &lt;/div&gt;

        &lt;!-- Charts and Details --&gt;
        &lt;div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"&gt;
          &lt;!-- Donut Chart --&gt;
          &lt;DonutChart
            :correct="statistics.correctAnswers"
            :incorrect="statistics.wrongAnswers"
            title="Ergebnisverteilung"
          /&gt;

          &lt;!-- Detailed Results --&gt;
          &lt;QuestionResults
            :questions="quizStore.questions"
            :answers="quizStore.answers"
          /&gt;
        &lt;/div&gt;

        &lt;!-- Actions --&gt;
        &lt;div class="flex flex-col sm:flex-row gap-4 justify-center"&gt;
          &lt;button
            v-if="!isQuizCompleted"
            @click="continueLearning"
            class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          &gt;
            Quiz fortsetzen
          &lt;/button&gt;

          &lt;button
            v-if="isQuizCompleted"
            @click="continueLearning"
            class="bg-success text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
          &gt;
            Fragen wiederholen
          &lt;/button&gt;

          &lt;button
            @click="restartQuiz"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          &gt;
            Neues Quiz starten
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;!-- Performance Tips --&gt;
        &lt;div v-if="isQuizCompleted" class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"&gt;
          &lt;h3 class="text-lg font-semibold text-blue-900 mb-4"&gt;💡 Lerntipps&lt;/h3&gt;

          &lt;div v-if="statistics.accuracy &gt;= 80" class="text-blue-800"&gt;
            &lt;p class="mb-2"&gt;&lt;strong&gt;Ausgezeichnet!&lt;/strong&gt; Sie haben sehr gut abgeschnitten.&lt;/p&gt;
            &lt;ul class="list-disc list-inside space-y-1 text-sm"&gt;
              &lt;li&gt;Vertiefen Sie Ihr Wissen in den Bereichen, die Sie unsicher gemacht haben&lt;/li&gt;
              &lt;li&gt;Probieren Sie schwierigere Fragen oder verwandte Themen&lt;/li&gt;
              &lt;li&gt;Teilen Sie Ihr Wissen mit anderen Lernenden&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;

          &lt;div v-else-if="statistics.accuracy &gt;= 60" class="text-blue-800"&gt;
            &lt;p class="mb-2"&gt;&lt;strong&gt;Gute Leistung!&lt;/strong&gt; Sie sind auf dem richtigen Weg.&lt;/p&gt;
            &lt;ul class="list-disc list-inside space-y-1 text-sm"&gt;
              &lt;li&gt;Wiederholen Sie die falsch beantworteten Fragen&lt;/li&gt;
              &lt;li&gt;Nutzen Sie die KI-Erklärungen für besseres Verständnis&lt;/li&gt;
              &lt;li&gt;Üben Sie regelmäßig, um Ihr Wissen zu festigen&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;

          &lt;div v-else class="text-blue-800"&gt;
            &lt;p class="mb-2"&gt;&lt;strong&gt;Übung macht den Meister!&lt;/strong&gt; Lassen Sie sich nicht entmutigen.&lt;/p&gt;
            &lt;ul class="list-disc list-inside space-y-1 text-sm"&gt;
              &lt;li&gt;Gehen Sie die Fragen nochmals durch und nutzen Sie die Erklärungen&lt;/li&gt;
              &lt;li&gt;Wiederholen Sie das Quiz mehrmals&lt;/li&gt;
              &lt;li&gt;Konzentrieren Sie sich auf die Grundlagen&lt;/li&gt;
              &lt;li&gt;Nehmen Sie sich mehr Zeit für jede Frage&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/main&gt;
&lt;/template&gt;