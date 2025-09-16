&lt;script setup lang="ts"&gt;
import { ref, computed } from 'vue'
import { parseQuestionFile } from '@/utils/fileParser'
import { useQuizStore } from '@/stores/quiz'
import { useRouter } from 'vue-router'
import type { FileUploadResult } from '@/types'

const router = useRouter()
const quizStore = useQuizStore()

const isDragOver = ref(false)
const isProcessing = ref(false)
const fileInput = ref&lt;HTMLInputElement | null&gt;(null)
const uploadResult = ref&lt;FileUploadResult | null&gt;(null)

const hasErrors = computed(() =&gt; uploadResult.value?.errors && uploadResult.value.errors.length &gt; 0)
const hasQuestions = computed(() =&gt; uploadResult.value?.questions && uploadResult.value.questions.length &gt; 0)

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
  if (files && files.length &gt; 0) {
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
    const result = await parseQuestionFile(file)
    uploadResult.value = result

    if (result.success && result.questions.length &gt; 0) {
      quizStore.loadQuestions(result.questions)
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

function clearFile() {
  uploadResult.value = null
  quizStore.clearQuestions()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="max-w-2xl mx-auto p-6"&gt;
    &lt;div class="text-center mb-8"&gt;
      &lt;h1 class="text-3xl font-bold text-gray-900 mb-2"&gt;Binary Brain&lt;/h1&gt;
      &lt;p class="text-gray-600"&gt;Laden Sie Ihre Fragen-Datei hoch und starten Sie das Quiz&lt;/p&gt;
    &lt;/div&gt;

    &lt;!-- Upload Area --&gt;
    &lt;div
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
    &gt;
      &lt;div v-if="isProcessing" class="space-y-4"&gt;
        &lt;div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"&gt;&lt;/div&gt;
        &lt;p class="text-gray-600"&gt;Datei wird verarbeitet...&lt;/p&gt;
      &lt;/div&gt;

      &lt;div v-else class="space-y-4"&gt;
        &lt;svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"&gt;
          &lt;path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /&gt;
        &lt;/svg&gt;

        &lt;div&gt;
          &lt;p class="text-lg font-medium text-gray-900"&gt;Datei hierhin ziehen oder klicken&lt;/p&gt;
          &lt;p class="text-sm text-gray-500 mt-1"&gt;CSV, XLS oder XLSX (max. 10MB)&lt;/p&gt;
        &lt;/div&gt;

        &lt;div class="text-xs text-gray-400 space-y-1"&gt;
          &lt;p&gt;&lt;strong&gt;Format:&lt;/strong&gt; Zwei Spalten (Frage, Antwort)&lt;/p&gt;
          &lt;p&gt;&lt;strong&gt;Antworten:&lt;/strong&gt; true/false, 1/0, ja/nein, richtig/falsch&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Results --&gt;
    &lt;div v-if="uploadResult" class="space-y-6"&gt;
      &lt;!-- Success Message --&gt;
      &lt;div v-if="uploadResult.success" class="bg-green-50 border border-green-200 rounded-lg p-4"&gt;
        &lt;div class="flex items-center"&gt;
          &lt;svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20"&gt;
            &lt;path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /&gt;
          &lt;/svg&gt;
          &lt;p class="text-green-800 font-medium"&gt;
            {{ uploadResult.questions.length }} Fragen erfolgreich geladen
          &lt;/p&gt;
        &lt;/div&gt;
        &lt;p v-if="uploadResult.format" class="text-green-700 text-sm mt-1"&gt;
          Erkanntes Format: {{ uploadResult.format }}
        &lt;/p&gt;
      &lt;/div&gt;

      &lt;!-- Error Messages --&gt;
      &lt;div v-if="hasErrors" class="bg-red-50 border border-red-200 rounded-lg p-4"&gt;
        &lt;div class="flex items-start"&gt;
          &lt;svg class="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20"&gt;
            &lt;path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /&gt;
          &lt;/svg&gt;
          &lt;div&gt;
            &lt;p class="text-red-800 font-medium mb-1"&gt;Probleme beim Verarbeiten:&lt;/p&gt;
            &lt;ul class="text-red-700 text-sm space-y-1"&gt;
              &lt;li v-for="error in uploadResult.errors" :key="error"&gt;• {{ error }}&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;!-- Questions Preview --&gt;
      &lt;div v-if="hasQuestions" class="bg-gray-50 border border-gray-200 rounded-lg p-4"&gt;
        &lt;h3 class="font-medium text-gray-900 mb-3"&gt;Vorschau der ersten Fragen:&lt;/h3&gt;
        &lt;div class="space-y-2 max-h-40 overflow-y-auto"&gt;
          &lt;div
            v-for="(question, index) in uploadResult.questions.slice(0, 5)"
            :key="question.id"
            class="text-sm"
          &gt;
            &lt;span class="font-medium text-gray-700"&gt;{{ index + 1 }}.&lt;/span&gt;
            &lt;span class="text-gray-600 ml-2"&gt;{{ question.text }}&lt;/span&gt;
            &lt;span
              class="ml-2 px-2 py-0.5 rounded text-xs"
              :class="question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            &gt;
              {{ question.correctAnswer ? 'Richtig' : 'Falsch' }}
            &lt;/span&gt;
          &lt;/div&gt;
          &lt;div v-if="uploadResult.questions.length &gt; 5" class="text-xs text-gray-500 italic"&gt;
            ... und {{ uploadResult.questions.length - 5 }} weitere Fragen
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;!-- Actions --&gt;
      &lt;div class="flex gap-4"&gt;
        &lt;button
          v-if="uploadResult.success && hasQuestions"
          @click="startQuiz"
          class="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
        &gt;
          Quiz starten
        &lt;/button&gt;

        &lt;button
          @click="clearFile"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        &gt;
          Neue Datei
        &lt;/button&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Hidden File Input --&gt;
    &lt;input
      ref="fileInput"
      type="file"
      accept=".csv,.xls,.xlsx"
      class="hidden"
      @change="onFileSelect"
    &gt;
  &lt;/div&gt;
&lt;/template&gt;