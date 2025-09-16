<script setup lang="ts">
import { computed } from 'vue'
import type { Question, UserAnswer } from '@/types'

interface Props {
  questions: Question[]
  answers: UserAnswer[]
}

const props = defineProps<Props>()

const questionResults = computed(() => {
  return props.questions.map(question => {
    const answer = props.answers.find(a => a.questionId === question.id)
    return {
      question,
      answer,
      isAnswered: !!answer,
      isCorrect: answer?.isCorrect ?? false
    }
  })
})

const answeredCount = computed(() => questionResults.value.filter(r => r.isAnswered).length)
const correctCount = computed(() => questionResults.value.filter(r => r.isCorrect).length)
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-lg">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Detaillierte Ergebnisse</h3>
      <div class="text-sm text-gray-600">
        {{ answeredCount }} von {{ questions.length }} beantwortet
      </div>
    </div>

    <div class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="(result, index) in questionResults"
        :key="result.question.id"
        class="flex items-start space-x-3 p-3 rounded-lg border"
        :class="{
          'bg-green-50 border-green-200': result.isCorrect,
          'bg-red-50 border-red-200': result.isAnswered && !result.isCorrect,
          'bg-gray-50 border-gray-200': !result.isAnswered
        }"
      >
        <!-- Question Number -->
        <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
          :class="{
            'bg-green-600 text-white': result.isCorrect,
            'bg-red-600 text-white': result.isAnswered && !result.isCorrect,
            'bg-gray-400 text-white': !result.isAnswered
          }"
        >
          {{ index + 1 }}
        </div>

        <!-- Question Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 font-medium">{{ result.question.text }}</p>

          <div class="mt-2 flex items-center space-x-4 text-xs">
            <!-- Correct Answer -->
            <div class="flex items-center space-x-1">
              <span class="text-gray-600">Korrekt:</span>
              <span
                class="px-2 py-0.5 rounded font-medium"
                :class="result.question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ result.question.correctAnswer ? 'Richtig' : 'Falsch' }}
              </span>
            </div>

            <!-- User Answer -->
            <div v-if="result.answer" class="flex items-center space-x-1">
              <span class="text-gray-600">Ihre Antwort:</span>
              <span
                class="px-2 py-0.5 rounded font-medium"
                :class="result.answer.userAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ result.answer.userAnswer ? 'Richtig' : 'Falsch' }}
              </span>
            </div>

            <div v-else class="text-gray-500">
              Nicht beantwortet
            </div>
          </div>
        </div>

        <!-- Status Icon -->
        <div class="flex-shrink-0">
          <svg
            v-if="result.isCorrect"
            class="w-5 h-5 text-green-600"
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
            v-else-if="result.isAnswered"
            class="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>

          <svg
            v-else
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>