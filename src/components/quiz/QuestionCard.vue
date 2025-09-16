&lt;script setup lang="ts"&gt;
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

const props = withDefaults(defineProps&lt;Props&gt;(), {
  showFeedback: false,
  userAnswer: null,
  isCorrect: null
})

const emit = defineEmits&lt;{
  answer: [answer: boolean]
  requestExplanation: []
}&gt;()

const selectedAnswer = ref&lt;boolean | null&gt;(props.userAnswer)

const progressPercentage = computed(() =&gt;
  (props.questionNumber / props.totalQuestions) * 100
)

function selectAnswer(answer: boolean) {
  selectedAnswer.value = answer
  emit('answer', answer)
}

function requestExplanation() {
  emit('requestExplanation')
}
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="max-w-3xl mx-auto"&gt;
    &lt;!-- Progress Bar --&gt;
    &lt;div class="mb-8"&gt;
      &lt;div class="flex justify-between items-center mb-2"&gt;
        &lt;span class="text-sm font-medium text-gray-700"&gt;
          Frage {{ questionNumber }} von {{ totalQuestions }}
        &lt;/span&gt;
        &lt;span class="text-sm text-gray-500"&gt;
          {{ Math.round(progressPercentage) }}% abgeschlossen
        &lt;/span&gt;
      &lt;/div&gt;
      &lt;div class="w-full bg-gray-200 rounded-full h-2"&gt;
        &lt;div
          class="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progressPercentage}%` }"
        &gt;&lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Question Card --&gt;
    &lt;div class="bg-white rounded-xl shadow-lg p-8 mb-6"&gt;
      &lt;div class="text-center mb-8"&gt;
        &lt;h2 class="text-question font-semibold text-gray-900 leading-relaxed"&gt;
          {{ question.text }}
        &lt;/h2&gt;
      &lt;/div&gt;

      &lt;!-- Answer Buttons --&gt;
      &lt;div class="flex flex-col sm:flex-row gap-4 justify-center"&gt;
        &lt;button
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
        &gt;
          Ja / Richtig
        &lt;/button&gt;

        &lt;button
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
        &gt;
          Nein / Falsch
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;!-- Feedback --&gt;
      &lt;div v-if="showFeedback && selectedAnswer !== null" class="mt-6 text-center"&gt;
        &lt;div
          class="inline-flex items-center px-4 py-2 rounded-lg font-medium"
          :class="{
            'bg-green-100 text-green-800': isCorrect,
            'bg-red-100 text-red-800': !isCorrect
          }"
        &gt;
          &lt;svg
            v-if="isCorrect"
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          &gt;
            &lt;path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            /&gt;
          &lt;/svg&gt;
          &lt;svg
            v-else
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          &gt;
            &lt;path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            /&gt;
          &lt;/svg&gt;
          {{ isCorrect ? 'Richtig!' : 'Falsch!' }}
        &lt;/div&gt;

        &lt;!-- Explanation Button --&gt;
        &lt;div class="mt-4"&gt;
          &lt;button
            @click="requestExplanation"
            class="text-primary hover:text-blue-600 font-medium underline focus:outline-none"
          &gt;
            Erklärung anfordern
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;