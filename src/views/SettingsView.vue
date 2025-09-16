<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { testApiKey } from '@/utils/openai'

const router = useRouter()
const settingsStore = useSettingsStore()

const apiKeyInput = ref(settingsStore.openaiApiKey)
const isTestingApiKey = ref(false)
const apiKeyTestResult = ref<string | null>(null)
const showApiKey = ref(false)

const maskedApiKey = computed(() => {
  if (!apiKeyInput.value || showApiKey.value) return apiKeyInput.value
  return apiKeyInput.value.substring(0, 7) + '•'.repeat(Math.max(0, apiKeyInput.value.length - 7))
})

function saveApiKey() {
  settingsStore.setOpenaiApiKey(apiKeyInput.value)
  apiKeyTestResult.value = null
}

async function testApiKeyConnection() {
  if (!apiKeyInput.value.trim()) {
    apiKeyTestResult.value = 'Bitte geben Sie einen API-Schlüssel ein.'
    return
  }

  isTestingApiKey.value = true
  apiKeyTestResult.value = null

  try {
    const result = await testApiKey(apiKeyInput.value.trim())

    if (result.success) {
      apiKeyTestResult.value = 'API-Schlüssel ist gültig und funktioniert!'
      saveApiKey()
    } else {
      apiKeyTestResult.value = result.error || 'API-Schlüssel Test fehlgeschlagen'
    }
  } catch (error) {
    apiKeyTestResult.value = 'Fehler beim Testen des API-Schlüssels'
  } finally {
    isTestingApiKey.value = false
  }
}

function toggleSoundEnabled() {
  settingsStore.setSoundEnabled(!settingsStore.soundEnabled)
}

function toggleKeyboardNavigation() {
  settingsStore.setKeyboardNavigation(!settingsStore.keyboardNavigation)
}

function toggleTheme() {
  settingsStore.toggleTheme()
}

function resetAllSettings() {
  if (confirm('Sind Sie sicher, dass Sie alle Einstellungen zurücksetzen möchten?')) {
    settingsStore.resetSettings()
    apiKeyInput.value = ''
    apiKeyTestResult.value = null
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <main class="py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center mb-8">
        <button
          @click="goBack"
          class="mr-4 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Einstellungen</h1>
      </div>

      <div class="space-y-8">
        <!-- OpenAI API Configuration -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">OpenAI Konfiguration</h2>

          <div class="space-y-4">
            <div>
              <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">
                API-Schlüssel
              </label>
              <div class="relative">
                <input
                  id="apiKey"
                  v-model="apiKeyInput"
                  :type="showApiKey ? 'text' : 'password'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="sk-..."
                  @input="apiKeyTestResult = null"
                >
                <button
                  @click="showApiKey = !showApiKey"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showApiKey" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Ihr OpenAI API-Schlüssel für KI-Erklärungen. Erhalten Sie einen unter <a href="https://platform.openai.com/api-keys" target="_blank" class="text-primary hover:underline">platform.openai.com</a>
              </p>
            </div>

            <!-- API Key Status -->
            <div v-if="settingsStore.hasValidApiKey" class="flex items-center text-sm text-green-600">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              API-Schlüssel konfiguriert
            </div>

            <!-- Test Result -->
            <div v-if="apiKeyTestResult"
              class="p-3 rounded-lg text-sm"
              :class="apiKeyTestResult.includes('gültig') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'"
            >
              {{ apiKeyTestResult }}
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                @click="saveApiKey"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Speichern
              </button>

              <button
                @click="testApiKeyConnection"
                :disabled="isTestingApiKey || !apiKeyInput.trim()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span v-if="isTestingApiKey" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Teste...
                </span>
                <span v-else>Verbindung testen</span>
              </button>
            </div>
          </div>
        </div>

        <!-- App Preferences -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">App-Einstellungen</h2>

          <div class="space-y-4">
            <!-- Theme Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Dunkles Design</h3>
                <p class="text-sm text-gray-500">Zwischen hellem und dunklem Design wechseln</p>
              </div>
              <button
                @click="toggleTheme"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.isDarkMode ? 'bg-primary' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <!-- Sound Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Soundeffekte</h3>
                <p class="text-sm text-gray-500">Sounds für richtige und falsche Antworten</p>
              </div>
              <button
                @click="toggleSoundEnabled"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.soundEnabled ? 'bg-primary' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.soundEnabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <!-- Keyboard Navigation Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Tastatur-Navigation</h3>
                <p class="text-sm text-gray-500">Quiz mit Pfeiltasten, Enter und Leertaste bedienen</p>
              </div>
              <button
                @click="toggleKeyboardNavigation"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.keyboardNavigation ? 'bg-primary' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Keyboard Shortcuts Info -->
        <div v-if="settingsStore.keyboardNavigation" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-900 mb-4">⌨️ Tastatur-Shortcuts</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-blue-700">← Pfeil links</span>
                <span class="text-blue-600">Nein/Falsch antworten</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">→ Pfeil rechts</span>
                <span class="text-blue-600">Ja/Richtig antworten</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-blue-700">↑↓ Pfeile hoch/runter</span>
                <span class="text-blue-600">Navigation</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Enter / Leertaste</span>
                <span class="text-blue-600">Nächste Frage</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset Section -->
        <div class="bg-white rounded-lg p-6 shadow-lg border-l-4 border-red-400">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Einstellungen zurücksetzen</h2>
          <p class="text-gray-600 mb-4">
            Alle Einstellungen auf die Standardwerte zurücksetzen. Dies kann nicht rückgängig gemacht werden.
          </p>
          <button
            @click="resetAllSettings"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Alle Einstellungen zurücksetzen
          </button>
        </div>
      </div>
    </div>
  </main>
</template>