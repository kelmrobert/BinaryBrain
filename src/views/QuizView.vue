<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useSettingsStore } from '@/stores/settings'
import QuestionCard from '@/components/quiz/QuestionCard.vue'

const router = useRouter()
const quizStore = useQuizStore()
const settingsStore = useSettingsStore()

const currentAnswer = ref<boolean | null>(null)
const showFeedback = ref(false)
const questionCardRef = ref<InstanceType<typeof QuestionCard>>()

const currentQuestion = computed(() => quizStore.currentQuestion)
const questionNumber = computed(() => quizStore.currentQuestionIndex + 1)
const totalQuestions = computed(() => quizStore.totalQuestions)
const canGoBack = computed(() => quizStore.hasPreviousQuestion)
const canGoForward = computed(() => currentAnswer.value !== null)
const isLastQuestion = computed(() => !quizStore.hasNextQuestion)

const currentUserAnswer = computed(() => {
  if (!currentQuestion.value) return null
  const answer = quizStore.getAnswerForQuestion(currentQuestion.value.id)
  return answer?.userAnswer ?? null
})

const isCurrentAnswerCorrect = computed(() => {
  if (!currentQuestion.value || currentAnswer.value === null) return null
  return currentAnswer.value === currentQuestion.value.correctAnswer
})

onMounted(() => {
  // Redirect if no quiz is active
  if (!quizStore.isQuizActive || quizStore.totalQuestions === 0) {
    router.push('/')
    return
  }

  // Load existing answer if available
  loadCurrentAnswer()

  // Set up keyboard navigation
  if (settingsStore.keyboardNavigation) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (settingsStore.keyboardNavigation) {
    document.removeEventListener('keydown', handleKeydown)
  }
})

function loadCurrentAnswer() {
  const existingAnswer = currentUserAnswer.value
  if (existingAnswer !== null) {
    currentAnswer.value = existingAnswer
    showFeedback.value = true
  } else {
    currentAnswer.value = null
    showFeedback.value = false
  }
}

function handleAnswer(answer: boolean) {
  if (showFeedback.value) return // Prevent multiple answers

  currentAnswer.value = answer
  showFeedback.value = true

  const isCorrect = quizStore.answerQuestion(answer)

  // Auto-request explanation for wrong answers after a short delay
  if (!isCorrect && settingsStore.hasValidApiKey) {
    setTimeout(() => {
      questionCardRef.value?.autoRequestExplanation()
    }, 800) // Small delay to let the user see the result first
  }
}

function goToPrevious() {
  if (quizStore.previousQuestion()) {
    loadCurrentAnswer()
  }
}

function goToNext() {
  if (quizStore.nextQuestion()) {
    loadCurrentAnswer()
  } else {
    // Quiz completed, redirect to statistics
    router.push('/statistics')
  }
}

function finishQuiz() {
  quizStore.completeQuiz()
  router.push('/statistics')
}

function resetQuiz() {
  if (confirm('Sind Sie sicher, dass Sie das Quiz zurücksetzen möchten? Alle Antworten gehen verloren.')) {
    quizStore.resetQuiz()
    router.push('/')
  }
}


function handleKeydown(event: KeyboardEvent) {
  // Let the QuestionCard handle its own keyboard events
  // This is mainly for global quiz navigation if needed
}
</script>

<template>
  <main class="py-8">
    <div v-if="!currentQuestion" class="text-center py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Kein Quiz aktiv</h2>
      <p class="text-gray-600 mb-6">Bitte laden Sie zuerst Fragen hoch, um ein Quiz zu starten.</p>
      <button
        @click="router.push('/')"
        class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Zur Startseite
      </button>
    </div>

    <div v-else class="container mx-auto px-4">
      <!-- Question Card -->
      <QuestionCard
        ref="questionCardRef"
        :question="currentQuestion"
        :question-number="questionNumber"
        :total-questions="totalQuestions"
        :show-feedback="showFeedback"
        :user-answer="currentAnswer"
        :is-correct="isCurrentAnswerCorrect"
        :can-go-next="canGoForward"
        :is-last-question="isLastQuestion"
        @answer="handleAnswer"
        @next="goToNext"
        @finish="finishQuiz"
      />

      <!-- Optional: Previous question button if needed -->
      <div v-if="canGoBack" class="max-w-4xl mx-auto mt-6 text-center">
        <button
          @click="goToPrevious"
          class="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Vorherige Frage
        </button>
      </div>
    </div>
  </main>
</template>