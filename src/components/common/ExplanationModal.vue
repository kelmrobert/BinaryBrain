&lt;script setup lang="ts"&gt;
import { ref, watch } from 'vue'
import { getExplanation } from '@/utils/openai'
import { useSettingsStore } from '@/stores/settings'
import type { Question } from '@/types'

interface Props {
  isOpen: boolean
  question: Question | null
}

const props = defineProps&lt;Props&gt;()
const emit = defineEmits&lt;{
  close: []
}&gt;()

const settingsStore = useSettingsStore()

const isLoading = ref(false)
const explanation = ref('')
const error = ref('')

watch(() =&gt; props.isOpen, async (isOpen) =&gt; {
  if (isOpen && props.question) {
    await loadExplanation()
  } else {
    explanation.value = ''
    error.value = ''
  }
})

async function loadExplanation() {
  if (!props.question) return

  isLoading.value = true
  error.value = ''
  explanation.value = ''

  try {
    if (!settingsStore.hasValidApiKey) {
      error.value = 'Kein gültiger OpenAI API-Schlüssel konfiguriert. Bitte prüfen Sie die Einstellungen.'
      return
    }

    const result = await getExplanation(
      props.question.text,
      props.question.correctAnswer,
      settingsStore.openaiApiKey
    )

    if (result.success && result.data) {
      explanation.value = result.data
    } else {
      error.value = result.error || 'Erklärung konnte nicht geladen werden'
    }
  } catch (err) {
    error.value = 'Unerwarteter Fehler beim Laden der Erklärung'
    console.error('Explanation error:', err)
  } finally {
    isLoading.value = false
  }
}

function closeModal() {
  emit('close')
}

// Close modal when clicking outside
function handleBackdropClick(event: Event) {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
&lt;/script&gt;

&lt;template&gt;
  &lt;Teleport to="body"&gt;
    &lt;div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    &gt;
      &lt;div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        @click="handleBackdropClick"
      &gt;
        &lt;!-- Background overlay --&gt;
        &lt;div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"&gt;&lt;/div&gt;

        &lt;!-- Modal panel --&gt;
        &lt;div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
        &gt;
          &lt;div class="sm:flex sm:items-start"&gt;
            &lt;!-- Icon --&gt;
            &lt;div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"&gt;
              &lt;svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
                &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /&gt;
              &lt;/svg&gt;
            &lt;/div&gt;

            &lt;div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1"&gt;
              &lt;!-- Title --&gt;
              &lt;h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title"&gt;
                KI-Erklärung
              &lt;/h3&gt;

              &lt;!-- Question --&gt;
              &lt;div class="mt-3 p-3 bg-gray-50 rounded-lg"&gt;
                &lt;p class="text-sm font-medium text-gray-700 mb-1"&gt;Frage:&lt;/p&gt;
                &lt;p class="text-gray-900"&gt;{{ question?.text }}&lt;/p&gt;
                &lt;p class="text-xs text-gray-600 mt-2"&gt;
                  Korrekte Antwort:
                  &lt;span :class="question?.correctAnswer ? 'text-green-600' : 'text-red-600'"&gt;
                    {{ question?.correctAnswer ? 'Richtig' : 'Falsch' }}
                  &lt;/span&gt;
                &lt;/p&gt;
              &lt;/div&gt;

              &lt;!-- Content --&gt;
              &lt;div class="mt-4"&gt;
                &lt;!-- Loading --&gt;
                &lt;div v-if="isLoading" class="flex items-center justify-center py-8"&gt;
                  &lt;div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"&gt;&lt;/div&gt;
                  &lt;span class="ml-3 text-gray-600"&gt;Erklärung wird geladen...&lt;/span&gt;
                &lt;/div&gt;

                &lt;!-- Error --&gt;
                &lt;div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4"&gt;
                  &lt;div class="flex"&gt;
                    &lt;svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"&gt;
                      &lt;path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /&gt;
                    &lt;/svg&gt;
                    &lt;div class="ml-3"&gt;
                      &lt;h3 class="text-sm font-medium text-red-800"&gt;Fehler&lt;/h3&gt;
                      &lt;p class="text-sm text-red-700 mt-1"&gt;{{ error }}&lt;/p&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/div&gt;

                &lt;!-- Explanation --&gt;
                &lt;div v-else-if="explanation" class="prose prose-sm max-w-none"&gt;
                  &lt;div class="whitespace-pre-wrap text-gray-700 leading-relaxed"&gt;{{ explanation }}&lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;!-- Actions --&gt;
          &lt;div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"&gt;
            &lt;button
              @click="closeModal"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            &gt;
              Schließen
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/Teleport&gt;
&lt;/template&gt;