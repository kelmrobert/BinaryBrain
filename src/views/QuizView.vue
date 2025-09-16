&lt;script setup lang="ts"&gt;
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useSettingsStore } from '@/stores/settings'
import QuestionCard from '@/components/quiz/QuestionCard.vue'
import QuizNavigation from '@/components/quiz/QuizNavigation.vue'
import ExplanationModal from '@/components/common/ExplanationModal.vue'

const router = useRouter()
const quizStore = useQuizStore()
const settingsStore = useSettingsStore()

const showExplanationModal = ref(false)
const currentAnswer = ref&lt;boolean | null&gt;(null)
const showFeedback = ref(false)

const currentQuestion = computed(() =&gt; quizStore.currentQuestion)
const questionNumber = computed(() =&gt; quizStore.currentQuestionIndex + 1)
const totalQuestions = computed(() =&gt; quizStore.totalQuestions)
const canGoBack = computed(() =&gt; quizStore.hasPreviousQuestion)
const canGoForward = computed(() =&gt; currentAnswer.value !== null)
const isLastQuestion = computed(() =&gt; !quizStore.hasNextQuestion)

const currentUserAnswer = computed(() =&gt; {
  if (!currentQuestion.value) return null
  const answer = quizStore.getAnswerForQuestion(currentQuestion.value.id)
  return answer?.userAnswer ?? null
})

const isCurrentAnswerCorrect = computed(() =&gt; {
  if (!currentQuestion.value || currentAnswer.value === null) return null
  return currentAnswer.value === currentQuestion.value.correctAnswer
})

onMounted(() =&gt; {
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

onUnmounted(() =&gt; {
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
  currentAnswer.value = answer
  showFeedback.value = true

  const isCorrect = quizStore.answerQuestion(answer)

  // Add some delay for better UX
  setTimeout(() =&gt; {
    // Auto-advance to next question after a short delay if enabled
    // This could be made configurable in settings
  }, 1000)
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

function showExplanation() {
  showExplanationModal.value = true
}

function closeExplanation() {
  showExplanationModal.value = false
}

function handleKeydown(event: KeyboardEvent) {
  // Prevent default browser behavior for quiz navigation keys
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
  }

  switch (event.key) {
    case 'ArrowLeft':
      if (!showFeedback.value) {
        handleAnswer(false)
      }
      break
    case 'ArrowRight':
      if (!showFeedback.value) {
        handleAnswer(true)
      }
      break
    case 'ArrowUp':
      goToPrevious()
      break
    case 'ArrowDown':
    case 'Enter':
      if (canGoForward.value) {
        goToNext()
      }
      break
    case ' ':
      if (canGoForward.value) {
        goToNext()
      }
      break
  }
}
&lt;/script&gt;

&lt;template&gt;
  &lt;main class="min-h-screen bg-gray-50 py-8"&gt;
    &lt;div v-if="!currentQuestion" class="text-center py-16"&gt;
      &lt;h2 class="text-2xl font-bold text-gray-900 mb-4"&gt;Kein Quiz aktiv&lt;/h2&gt;
      &lt;p class="text-gray-600 mb-6"&gt;Bitte laden Sie zuerst Fragen hoch, um ein Quiz zu starten.&lt;/p&gt;
      &lt;button
        @click="router.push('/')"
        class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
      &gt;
        Zur Startseite
      &lt;/button&gt;
    &lt;/div&gt;

    &lt;div v-else class="container mx-auto px-4"&gt;
      &lt;!-- Question Card --&gt;
      &lt;QuestionCard
        :question="currentQuestion"
        :question-number="questionNumber"
        :total-questions="totalQuestions"
        :show-feedback="showFeedback"
        :user-answer="currentAnswer"
        :is-correct="isCurrentAnswerCorrect"
        @answer="handleAnswer"
        @request-explanation="showExplanation"
      /&gt;

      &lt;!-- Navigation --&gt;
      &lt;div class="max-w-3xl mx-auto"&gt;
        &lt;QuizNavigation
          :can-go-back="canGoBack"
          :can-go-forward="canGoForward"
          :show-next-button="!isLastQuestion"
          :show-finish-button="isLastQuestion && currentAnswer !== null"
          @previous="goToPrevious"
          @next="goToNext"
          @finish="finishQuiz"
          @reset="resetQuiz"
        /&gt;
      &lt;/div&gt;

      &lt;!-- Keyboard Navigation Hint --&gt;
      &lt;div v-if="settingsStore.keyboardNavigation" class="max-w-3xl mx-auto mt-8"&gt;
        &lt;div class="bg-blue-50 border border-blue-200 rounded-lg p-4"&gt;
          &lt;h4 class="font-medium text-blue-900 mb-2"&gt;Tastatur-Navigation:&lt;/h4&gt;
          &lt;div class="text-sm text-blue-800 space-y-1"&gt;
            &lt;p&gt;&lt;strong&gt;←/→:&lt;/strong&gt; Nein/Ja antworten&lt;/p&gt;
            &lt;p&gt;&lt;strong&gt;↑/↓:&lt;/strong&gt; Vorherige/Nächste Frage&lt;/p&gt;
            &lt;p&gt;&lt;strong&gt;Enter/Space:&lt;/strong&gt; Nächste Frage&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Explanation Modal --&gt;
    &lt;ExplanationModal
      :is-open="showExplanationModal"
      :question="currentQuestion"
      @close="closeExplanation"
    /&gt;
  &lt;/main&gt;
&lt;/template&gt;