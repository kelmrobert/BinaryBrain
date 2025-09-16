<script setup lang="ts">
import { ref, watch } from 'vue'
import { getExplanation } from '@/utils/openai'
import { useSettingsStore } from '@/stores/settings'
import type { Question } from '@/types'

interface Props {
  isOpen: boolean
  question: Question | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()

const isLoading = ref(false)
const explanation = ref('')
const error = ref('')

watch(() => props.isOpen, async (isOpen) => {
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        @click="handleBackdropClick"
      >
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
        >
          <div class="sm:flex sm:items-start">
            <!-- Icon -->
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <!-- Title -->
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                KI-Erklärung
              </h3>

              <!-- Question -->
              <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-gray-700 mb-1">Frage:</p>
                <p class="text-gray-900">{{ question?.text }}</p>
                <p class="text-xs text-gray-600 mt-2">
                  Korrekte Antwort:
                  <span :class="question?.correctAnswer ? 'text-green-600' : 'text-red-600'">
                    {{ question?.correctAnswer ? 'Richtig' : 'Falsch' }}
                  </span>
                </p>
              </div>

              <!-- Content -->
              <div class="mt-4">
                <!-- Loading -->
                <div v-if="isLoading" class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span class="ml-3 text-gray-600">Erklärung wird geladen...</span>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Fehler</h3>
                      <p class="text-sm text-red-700 mt-1">{{ error }}</p>
                    </div>
                  </div>
                </div>

                <!-- Explanation -->
                <div v-else-if="explanation" class="prose prose-sm max-w-none">
                  <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">{{ explanation }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              @click="closeModal"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>