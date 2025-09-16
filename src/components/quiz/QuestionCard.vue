<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { Question } from '@/types'
import { useSettingsStore } from '@/stores/settings'
import { getExplanation } from '@/utils/openai'

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  showFeedback?: boolean
  userAnswer?: boolean | null
  isCorrect?: boolean | null
  canGoNext?: boolean
  isLastQuestion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: false,
  userAnswer: null,
  isCorrect: null,
  canGoNext: false,
  isLastQuestion: false
})

const emit = defineEmits<{
  answer: [answer: boolean]
  next: []
  finish: []
  autoExplain: []
}>()

const selectedAnswer = ref<boolean | null>(props.userAnswer)
const cardContainer = ref<HTMLElement>()
const settingsStore = useSettingsStore()

// Explanation state
const showExplanation = ref(false)
const explanationText = ref<string>('')
const isLoadingExplanation = ref(false)
const explanationError = ref<string | null>(null)

const progressPercentage = computed(() =>
  (props.questionNumber / props.totalQuestions) * 100
)

// Watch for prop changes (when navigating between questions)
watch(() => props.userAnswer, (newAnswer) => {
  selectedAnswer.value = newAnswer
})

// Watch for question changes to refocus and reset explanation
watch(() => props.question.id, async () => {
  await nextTick()
  if (cardContainer.value) {
    cardContainer.value.focus()
  }
  // Reset explanation state when question changes
  showExplanation.value = false
  explanationText.value = ''
  explanationError.value = null
})

// Focus management and keyboard setup
onMounted(async () => {
  await nextTick()
  if (cardContainer.value) {
    cardContainer.value.focus()
  }
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function selectAnswer(answer: boolean) {
  if (props.showFeedback) return // Prevent changing answer after feedback
  selectedAnswer.value = answer
  emit('answer', answer)
}

async function requestExplanation() {
  if (!settingsStore.hasValidApiKey) {
    explanationError.value = 'Kein gültiger OpenAI API-Schlüssel konfiguriert. Bitte gehen Sie zu den Einstellungen.'
    showExplanation.value = true
    return
  }

  if (showExplanation.value) {
    // Toggle off if already showing
    showExplanation.value = false
    return
  }

  isLoadingExplanation.value = true
  explanationError.value = null
  showExplanation.value = true

  try {
    const result = await getExplanation(
      props.question.text,
      props.question.correctAnswer,
      settingsStore.openaiApiKey
    )

    if (result.success && result.data) {
      explanationText.value = result.data
    } else {
      explanationError.value = result.error || 'Fehler beim Laden der Erklärung'
    }
  } catch (error) {
    explanationError.value = 'Fehler beim Laden der Erklärung'
  } finally {
    isLoadingExplanation.value = false
  }
}

// Function to automatically request explanation (called from parent)
function autoRequestExplanation() {
  if (settingsStore.hasValidApiKey && !showExplanation.value) {
    requestExplanation()
  }
}

// Expose function to parent component
defineExpose({
  autoRequestExplanation
})

function handleNext() {
  if (props.isLastQuestion) {
    emit('finish')
  } else {
    emit('next')
  }
}

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  if (props.showFeedback) {
    // After answering, space/enter goes to next question
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (props.canGoNext) {
        handleNext()
      }
    }
  } else {
    // Before answering, left/right arrows select answers
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectAnswer(false)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectAnswer(true)
    }
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto" @keydown="handleKeydown" tabindex="0" ref="cardContainer">
    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">
          Frage {{ questionNumber }} von {{ totalQuestions }}
        </span>
        <span class="text-sm text-gray-500">
          {{ Math.round(progressPercentage) }}% abgeschlossen
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Question Card -->
    <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed mb-6">
          {{ question.text }}
        </h2>
        <p v-if="!showFeedback" class="text-gray-600 text-lg">
          Wählen Sie die richtige Antwort:
        </p>
      </div>

      <!-- Answer Buttons -->
      <div class="flex flex-col sm:flex-row gap-6 justify-center mb-8">
        <button
          @click="selectAnswer(false)"
          :disabled="showFeedback"
          class="group relative flex-1 max-w-sm mx-auto sm:mx-0 py-6 px-8 rounded-xl font-bold text-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
          :class="{
            // Not answered yet
            'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95': selectedAnswer !== false && !showFeedback,
            // Selected but no feedback yet
            'bg-red-600 text-white shadow-xl scale-105 ring-4 ring-red-300': selectedAnswer === false && !showFeedback,
            // Answered correctly
            'bg-green-500 text-white shadow-lg': showFeedback && selectedAnswer === false && isCorrect,
            // Answered incorrectly
            'bg-red-600 text-white shadow-lg': showFeedback && selectedAnswer === false && !isCorrect,
            // Not selected, showing feedback
            'bg-gray-200 text-gray-500 cursor-not-allowed': showFeedback && selectedAnswer !== false
          }"
        >
          <span class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Nein / Falsch
          </span>
          <span v-if="!showFeedback" class="absolute top-2 right-2 text-sm opacity-75">←</span>
        </button>

        <button
          @click="selectAnswer(true)"
          :disabled="showFeedback"
          class="group relative flex-1 max-w-sm mx-auto sm:mx-0 py-6 px-8 rounded-xl font-bold text-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
          :class="{
            // Not answered yet
            'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:scale-105 active:scale-95': selectedAnswer !== true && !showFeedback,
            // Selected but no feedback yet
            'bg-green-600 text-white shadow-xl scale-105 ring-4 ring-green-300': selectedAnswer === true && !showFeedback,
            // Answered correctly
            'bg-green-500 text-white shadow-lg': showFeedback && selectedAnswer === true && isCorrect,
            // Answered incorrectly
            'bg-red-600 text-white shadow-lg': showFeedback && selectedAnswer === true && !isCorrect,
            // Not selected, showing feedback
            'bg-gray-200 text-gray-500 cursor-not-allowed': showFeedback && selectedAnswer !== true
          }"
        >
          <span class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            Ja / Richtig
          </span>
          <span v-if="!showFeedback" class="absolute top-2 right-2 text-sm opacity-75">→</span>
        </button>
      </div>

      <!-- Immediate Feedback -->
      <div v-if="showFeedback && selectedAnswer !== null" class="text-center">
        <div class="mb-6">
          <div
            class="inline-flex items-center px-6 py-4 rounded-xl font-bold text-xl shadow-lg"
            :class="{
              'bg-green-100 text-green-800 border-2 border-green-300': isCorrect,
              'bg-red-100 text-red-800 border-2 border-red-300': !isCorrect
            }"
          >
            <svg
              v-if="isCorrect"
              class="w-8 h-8 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-8 h-8 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            {{ isCorrect ? '🎉 Richtig!' : '❌ Falsch!' }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <!-- Next Question Button -->
          <button
            v-if="canGoNext"
            @click="handleNext"
            class="group px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <span class="flex items-center">
              {{ isLastQuestion ? 'Quiz beenden' : 'Nächste Frage' }}
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div class="text-sm opacity-75 mt-1">Leertaste oder Enter</div>
          </button>

          <!-- Explanation Button -->
          <button
            @click="requestExplanation"
            :disabled="isLoadingExplanation"
            class="px-6 py-3 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'text-primary border-2 border-primary hover:bg-primary hover:text-white': !showExplanation,
              'text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white': showExplanation
            }"
          >
            <span v-if="isLoadingExplanation" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Lädt...
            </span>
            <span v-else-if="showExplanation">
              ❌ Erklärung ausblenden
            </span>
            <span v-else>
              💡 KI-Erklärung anfordern
            </span>
          </button>
        </div>

        <!-- Inline AI Explanation -->
        <div v-if="showExplanation" class="mt-8 animate-fadeIn">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-blue-900">KI-Erklärung</h4>
            </div>

            <div v-if="explanationError" class="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ explanationError }}
              </div>
            </div>

            <div v-else-if="explanationText" class="text-gray-800 leading-relaxed whitespace-pre-line">
              {{ explanationText }}
            </div>

            <div v-else-if="isLoadingExplanation" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span class="text-blue-700 font-medium">KI-Erklärung wird generiert...</span>
            </div>
          </div>
        </div>

        <!-- Keyboard Instructions -->
        <div class="mt-6 text-center">
          <div class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drücken Sie Leertaste oder Enter für die nächste Frage
          </div>
        </div>
      </div>

      <!-- Pre-answer Instructions -->
      <div v-else-if="!showFeedback" class="text-center mt-6">
        <div class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verwenden Sie die Pfeiltasten ← → oder klicken Sie auf eine Antwort
        </div>
      </div>
    </div>
  </div>
</template>