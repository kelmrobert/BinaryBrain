<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseQuestionFile } from '@/utils/fileParser'
import { useQuizStore } from '@/stores/quiz'
import { useRouter } from 'vue-router'
import { filePersistenceManager } from '@/utils/filePersistence'
import type { FileUploadResult } from '@/types'

const router = useRouter()
const quizStore = useQuizStore()

const isDragOver = ref(false)
const isProcessing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadResult = ref<FileUploadResult | null>(null)

const hasErrors = computed(() => uploadResult.value?.errors && uploadResult.value.errors.length > 0)
const hasQuestions = computed(() => uploadResult.value?.questions && uploadResult.value.questions.length > 0)
const hasPersistedData = computed(() => quizStore.hasPersistedData())

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    processFile(file)
  }
}

function openFileDialog() {
  fileInput.value?.click()
}

async function processFile(file: File) {
  isProcessing.value = true
  uploadResult.value = null

  try {
    // First, save the file for persistence
    const persistedFile = await filePersistenceManager.saveFile(file)

    // Parse the file content
    const result = await parseQuestionFile(file)
    uploadResult.value = result

    if (result.success && result.questions.length > 0) {
      // Load questions into store and set persisted file reference
      quizStore.loadQuestions(result.questions)
      quizStore.setPersistedFile(persistedFile)

      // Save the initial quiz state with file and questions
      await quizStore.saveQuizState()
    }
  } catch (error) {
    uploadResult.value = {
      success: false,
      questions: [],
      errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
    }
  } finally {
    isProcessing.value = false
  }
}

function startQuiz() {
  if (quizStore.startQuiz()) {
    router.push('/quiz')
  }
}

async function clearFile() {
  uploadResult.value = null
  await quizStore.clearPersistedData()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function restorePersistedData() {
  isProcessing.value = true
  try {
    const restored = quizStore.loadPersistedQuizData()
    if (restored && quizStore.questions.length > 0) {
      // Create a fake upload result to show the restored state
      uploadResult.value = {
        success: true,
        questions: quizStore.questions,
        format: 'restored' as any
      }
    }
  } catch (error) {
    console.error('Failed to restore data:', error)
  } finally {
    isProcessing.value = false
  }
}

// Auto-restore on component mount if data exists
if (hasPersistedData.value) {
  restorePersistedData()
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Binary Brain</h1>
      <p class="text-gray-600">Laden Sie Ihre Fragen-Datei hoch und starten Sie das Quiz</p>

      <!-- Restoration Notice -->
      <div v-if="hasPersistedData && !uploadResult" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-center">
          <svg class="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <p class="text-blue-800 text-sm">
            Gespeicherte Daten gefunden. Diese werden automatisch wiederhergestellt.
          </p>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      v-if="!uploadResult"
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors duration-300"
      :class="{
        'border-primary bg-blue-50': isDragOver,
        'cursor-pointer': !isProcessing
      }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="!isProcessing && openFileDialog()"
    >
      <div v-if="isProcessing" class="space-y-4">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-gray-600">Datei wird verarbeitet...</p>
      </div>

      <div v-else class="space-y-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <div>
          <p class="text-lg font-medium text-gray-900">Datei hierhin ziehen oder klicken</p>
          <p class="text-sm text-gray-500 mt-1">CSV, XLS oder XLSX (max. 10MB)</p>
        </div>

        <div class="text-xs text-gray-400 space-y-1">
          <p><strong>Format:</strong> Zwei Spalten (Frage, Antwort)</p>
          <p><strong>Antworten:</strong> true/false, 1/0, ja/nein, richtig/falsch</p>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="uploadResult" class="space-y-6">
      <!-- Success Message -->
      <div v-if="uploadResult.success" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p class="text-green-800 font-medium">
            {{ uploadResult.questions.length }} Fragen erfolgreich geladen
          </p>
        </div>
        <p v-if="uploadResult.format && uploadResult.format !== 'restored'" class="text-green-700 text-sm mt-1">
          Erkanntes Format: {{ uploadResult.format }}
        </p>
        <p v-if="uploadResult.format === 'restored'" class="text-green-700 text-sm mt-1">
          Daten aus vorherigem Besuch wiederhergestellt
        </p>
      </div>

      <!-- Error Messages -->
      <div v-if="hasErrors" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-red-800 font-medium mb-1">Probleme beim Verarbeiten:</p>
            <ul class="text-red-700 text-sm space-y-1">
              <li v-for="error in uploadResult.errors" :key="error">• {{ error }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Questions Preview -->
      <div v-if="hasQuestions" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-medium text-gray-900 mb-3">Vorschau der ersten Fragen:</h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(question, index) in uploadResult.questions.slice(0, 5)"
            :key="question.id"
            class="text-sm"
          >
            <span class="font-medium text-gray-700">{{ index + 1 }}.</span>
            <span class="text-gray-600 ml-2">{{ question.text }}</span>
            <span
              class="ml-2 px-2 py-0.5 rounded text-xs"
              :class="question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ question.correctAnswer ? 'Richtig' : 'Falsch' }}
            </span>
          </div>
          <div v-if="uploadResult.questions.length > 5" class="text-xs text-gray-500 italic">
            ... und {{ uploadResult.questions.length - 5 }} weitere Fragen
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          v-if="uploadResult.success && hasQuestions"
          @click="startQuiz"
          class="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
        >
          Quiz starten
        </button>

        <button
          @click="clearFile"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Neue Datei
        </button>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.xls,.xlsx"
      class="hidden"
      @change="onFileSelect"
    >
  </div>
</template>