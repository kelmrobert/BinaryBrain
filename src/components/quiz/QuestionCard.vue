<script setup lang="ts">


import { ref, computed } from 'vue'
import type { Question } from '@/types'

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  showFeedback?: boolean
  userAnswer?: boolean | null
  isCorrect?: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: false,
  userAnswer: null,
  isCorrect: null
})

const emit = defineEmits<{
  answer: [answer: boolean]
  requestExplanation: []
}>()

const selectedAnswer = ref<boolean | null>(props.userAnswer)

const progressPercentage = computed(() =>
  (props.questionNumber / props.totalQuestions) * 100
)

function selectAnswer(answer: boolean) {
  selectedAnswer.value = answer
  emit('answer', answer)
}

function requestExplanation() {
  emit('requestExplanation')
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
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
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Question Card -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-6">
      <div class="text-center mb-8">
        <h2 class="text-question font-semibold text-gray-900 leading-relaxed">
          {{ question.text }}
        </h2>
      </div>

      <!-- Answer Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="selectAnswer(true)"
          :disabled="showFeedback"
          class="flex-1 max-w-xs mx-auto sm:mx-0 py-4 px-8 rounded-lg font-medium text-lg transition-all duration-200 focus:outline-none focus:ring-4"
          :class="{
            'bg-green-600 text-white shadow-lg transform -translate-y-1': selectedAnswer === true && !showFeedback,
            'bg-correct text-white': showFeedback && selectedAnswer === true && isCorrect,
            'bg-incorrect text-white': showFeedback && selectedAnswer === true && !isCorrect,
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300': selectedAnswer !== true && !showFeedback,
            'bg-gray-100 text-gray-500 cursor-not-allowed': showFeedback && selectedAnswer !== true
          }"
        >
          Ja / Richtig
        </button>

        <button
          @click="selectAnswer(false)"
          :disabled="showFeedback"
          class="flex-1 max-w-xs mx-auto sm:mx-0 py-4 px-8 rounded-lg font-medium text-lg transition-all duration-200 focus:outline-none focus:ring-4"
          :class="{
            'bg-red-600 text-white shadow-lg transform -translate-y-1': selectedAnswer === false && !showFeedback,
            'bg-correct text-white': showFeedback && selectedAnswer === false && isCorrect,
            'bg-incorrect text-white': showFeedback && selectedAnswer === false && !isCorrect,
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300': selectedAnswer !== false && !showFeedback,
            'bg-gray-100 text-gray-500 cursor-not-allowed': showFeedback && selectedAnswer !== false
          }"
        >
          Nein / Falsch
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="showFeedback && selectedAnswer !== null" class="mt-6 text-center">
        <div
          class="inline-flex items-center px-4 py-2 rounded-lg font-medium"
          :class="{
            'bg-green-100 text-green-800': isCorrect,
            'bg-red-100 text-red-800': !isCorrect
          }"
        >
          <svg
            v-if="isCorrect"
            class="w-5 h-5 mr-2"
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
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ isCorrect ? 'Richtig!' : 'Falsch!' }}
        </div>

        <!-- Explanation Button -->
        <div class="mt-4">
          <button
            @click="requestExplanation"
            class="text-primary hover:text-blue-600 font-medium underline focus:outline-none"
          >
            Erklärung anfordern
          </button>
        </div>
      </div>
    </div>
  </div>
</template>