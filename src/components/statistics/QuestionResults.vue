&lt;script setup lang="ts"&gt;
import { computed } from 'vue'
import type { Question, UserAnswer } from '@/types'

interface Props {
  questions: Question[]
  answers: UserAnswer[]
}

const props = defineProps&lt;Props&gt;()

const questionResults = computed(() =&gt; {
  return props.questions.map(question =&gt; {
    const answer = props.answers.find(a =&gt; a.questionId === question.id)
    return {
      question,
      answer,
      isAnswered: !!answer,
      isCorrect: answer?.isCorrect ?? false
    }
  })
})

const answeredCount = computed(() =&gt; questionResults.value.filter(r =&gt; r.isAnswered).length)
const correctCount = computed(() =&gt; questionResults.value.filter(r =&gt; r.isCorrect).length)
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="bg-white rounded-lg p-6 shadow-lg"&gt;
    &lt;div class="flex justify-between items-center mb-4"&gt;
      &lt;h3 class="text-lg font-semibold text-gray-900"&gt;Detaillierte Ergebnisse&lt;/h3&gt;
      &lt;div class="text-sm text-gray-600"&gt;
        {{ answeredCount }} von {{ questions.length }} beantwortet
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;div class="space-y-3 max-h-96 overflow-y-auto"&gt;
      &lt;div
        v-for="(result, index) in questionResults"
        :key="result.question.id"
        class="flex items-start space-x-3 p-3 rounded-lg border"
        :class="{
          'bg-green-50 border-green-200': result.isCorrect,
          'bg-red-50 border-red-200': result.isAnswered && !result.isCorrect,
          'bg-gray-50 border-gray-200': !result.isAnswered
        }"
      &gt;
        &lt;!-- Question Number --&gt;
        &lt;div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
          :class="{
            'bg-green-600 text-white': result.isCorrect,
            'bg-red-600 text-white': result.isAnswered && !result.isCorrect,
            'bg-gray-400 text-white': !result.isAnswered
          }"
        &gt;
          {{ index + 1 }}
        &lt;/div&gt;

        &lt;!-- Question Content --&gt;
        &lt;div class="flex-1 min-w-0"&gt;
          &lt;p class="text-sm text-gray-900 font-medium"&gt;{{ result.question.text }}&lt;/p&gt;

          &lt;div class="mt-2 flex items-center space-x-4 text-xs"&gt;
            &lt;!-- Correct Answer --&gt;
            &lt;div class="flex items-center space-x-1"&gt;
              &lt;span class="text-gray-600"&gt;Korrekt:&lt;/span&gt;
              &lt;span
                class="px-2 py-0.5 rounded font-medium"
                :class="result.question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              &gt;
                {{ result.question.correctAnswer ? 'Richtig' : 'Falsch' }}
              &lt;/span&gt;
            &lt;/div&gt;

            &lt;!-- User Answer --&gt;
            &lt;div v-if="result.answer" class="flex items-center space-x-1"&gt;
              &lt;span class="text-gray-600"&gt;Ihre Antwort:&lt;/span&gt;
              &lt;span
                class="px-2 py-0.5 rounded font-medium"
                :class="result.answer.userAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              &gt;
                {{ result.answer.userAnswer ? 'Richtig' : 'Falsch' }}
              &lt;/span&gt;
            &lt;/div&gt;

            &lt;div v-else class="text-gray-500"&gt;
              Nicht beantwortet
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;!-- Status Icon --&gt;
        &lt;div class="flex-shrink-0"&gt;
          &lt;svg
            v-if="result.isCorrect"
            class="w-5 h-5 text-green-600"
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
            v-else-if="result.isAnswered"
            class="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          &gt;
            &lt;path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            /&gt;
          &lt;/svg&gt;

          &lt;svg
            v-else
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          &gt;
            &lt;path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            /&gt;
          &lt;/svg&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;