&lt;script setup lang="ts"&gt;
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { testApiKey } from '@/utils/openai'

const router = useRouter()
const settingsStore = useSettingsStore()

const apiKeyInput = ref(settingsStore.openaiApiKey)
const isTestingApiKey = ref(false)
const apiKeyTestResult = ref&lt;string | null&gt;(null)
const showApiKey = ref(false)

const maskedApiKey = computed(() =&gt; {
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
&lt;/script&gt;

&lt;template&gt;
  &lt;main class="py-8"&gt;
    &lt;div class="container mx-auto px-4 max-w-2xl"&gt;
      &lt;!-- Header --&gt;
      &lt;div class="flex items-center mb-8"&gt;
        &lt;button
          @click="goBack"
          class="mr-4 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        &gt;
          &lt;svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
            &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /&gt;
          &lt;/svg&gt;
        &lt;/button&gt;
        &lt;h1 class="text-3xl font-bold text-gray-900"&gt;Einstellungen&lt;/h1&gt;
      &lt;/div&gt;

      &lt;div class="space-y-8"&gt;
        &lt;!-- OpenAI API Configuration --&gt;
        &lt;div class="bg-white rounded-lg p-6 shadow-lg"&gt;
          &lt;h2 class="text-xl font-semibold text-gray-900 mb-4"&gt;OpenAI Konfiguration&lt;/h2&gt;

          &lt;div class="space-y-4"&gt;
            &lt;div&gt;
              &lt;label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2"&gt;
                API-Schlüssel
              &lt;/label&gt;
              &lt;div class="relative"&gt;
                &lt;input
                  id="apiKey"
                  v-model="apiKeyInput"
                  :type="showApiKey ? 'text' : 'password'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="sk-..."
                  @input="apiKeyTestResult = null"
                &gt;
                &lt;button
                  @click="showApiKey = !showApiKey"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                &gt;
                  &lt;svg v-if="showApiKey" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
                    &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /&gt;
                    &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /&gt;
                  &lt;/svg&gt;
                  &lt;svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
                    &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /&gt;
                  &lt;/svg&gt;
                &lt;/button&gt;
              &lt;/div&gt;
              &lt;p class="text-xs text-gray-500 mt-1"&gt;
                Ihr OpenAI API-Schlüssel für KI-Erklärungen. Erhalten Sie einen unter &lt;a href="https://platform.openai.com/api-keys" target="_blank" class="text-primary hover:underline"&gt;platform.openai.com&lt;/a&gt;
              &lt;/p&gt;
            &lt;/div&gt;

            &lt;!-- API Key Status --&gt;
            &lt;div v-if="settingsStore.hasValidApiKey" class="flex items-center text-sm text-green-600"&gt;
              &lt;svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"&gt;
                &lt;path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /&gt;
              &lt;/svg&gt;
              API-Schlüssel konfiguriert
            &lt;/div&gt;

            &lt;!-- Test Result --&gt;
            &lt;div v-if="apiKeyTestResult"
              class="p-3 rounded-lg text-sm"
              :class="apiKeyTestResult.includes('gültig') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'"
            &gt;
              {{ apiKeyTestResult }}
            &lt;/div&gt;

            &lt;!-- Buttons --&gt;
            &lt;div class="flex gap-3"&gt;
              &lt;button
                @click="saveApiKey"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              &gt;
                Speichern
              &lt;/button&gt;

              &lt;button
                @click="testApiKeyConnection"
                :disabled="isTestingApiKey || !apiKeyInput.trim()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              &gt;
                &lt;span v-if="isTestingApiKey" class="flex items-center"&gt;
                  &lt;div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"&gt;&lt;/div&gt;
                  Teste...
                &lt;/span&gt;
                &lt;span v-else&gt;Verbindung testen&lt;/span&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;!-- App Preferences --&gt;
        &lt;div class="bg-white rounded-lg p-6 shadow-lg"&gt;
          &lt;h2 class="text-xl font-semibold text-gray-900 mb-4"&gt;App-Einstellungen&lt;/h2&gt;

          &lt;div class="space-y-4"&gt;
            &lt;!-- Theme Toggle --&gt;
            &lt;div class="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;h3 class="text-sm font-medium text-gray-900"&gt;Dunkles Design&lt;/h3&gt;
                &lt;p class="text-sm text-gray-500"&gt;Zwischen hellem und dunklem Design wechseln&lt;/p&gt;
              &lt;/div&gt;
              &lt;button
                @click="toggleTheme"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.isDarkMode ? 'bg-primary' : 'bg-gray-200'"
              &gt;
                &lt;span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                &gt;&lt;/span&gt;
              &lt;/button&gt;
            &lt;/div&gt;

            &lt;!-- Sound Toggle --&gt;
            &lt;div class="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;h3 class="text-sm font-medium text-gray-900"&gt;Soundeffekte&lt;/h3&gt;
                &lt;p class="text-sm text-gray-500"&gt;Sounds für richtige und falsche Antworten&lt;/p&gt;
              &lt;/div&gt;
              &lt;button
                @click="toggleSoundEnabled"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.soundEnabled ? 'bg-primary' : 'bg-gray-200'"
              &gt;
                &lt;span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.soundEnabled ? 'translate-x-6' : 'translate-x-1'"
                &gt;&lt;/span&gt;
              &lt;/button&gt;
            &lt;/div&gt;

            &lt;!-- Keyboard Navigation Toggle --&gt;
            &lt;div class="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;h3 class="text-sm font-medium text-gray-900"&gt;Tastatur-Navigation&lt;/h3&gt;
                &lt;p class="text-sm text-gray-500"&gt;Quiz mit Pfeiltasten, Enter und Leertaste bedienen&lt;/p&gt;
              &lt;/div&gt;
              &lt;button
                @click="toggleKeyboardNavigation"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                :class="settingsStore.keyboardNavigation ? 'bg-primary' : 'bg-gray-200'"
              &gt;
                &lt;span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'"
                &gt;&lt;/span&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;!-- Keyboard Shortcuts Info --&gt;
        &lt;div v-if="settingsStore.keyboardNavigation" class="bg-blue-50 border border-blue-200 rounded-lg p-6"&gt;
          &lt;h3 class="text-lg font-semibold text-blue-900 mb-4"&gt;⌨️ Tastatur-Shortcuts&lt;/h3&gt;
          &lt;div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"&gt;
            &lt;div class="space-y-2"&gt;
              &lt;div class="flex justify-between"&gt;
                &lt;span class="text-blue-700"&gt;← Pfeil links&lt;/span&gt;
                &lt;span class="text-blue-600"&gt;Nein/Falsch antworten&lt;/span&gt;
              &lt;/div&gt;
              &lt;div class="flex justify-between"&gt;
                &lt;span class="text-blue-700"&gt;→ Pfeil rechts&lt;/span&gt;
                &lt;span class="text-blue-600"&gt;Ja/Richtig antworten&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div class="space-y-2"&gt;
              &lt;div class="flex justify-between"&gt;
                &lt;span class="text-blue-700"&gt;↑↓ Pfeile hoch/runter&lt;/span&gt;
                &lt;span class="text-blue-600"&gt;Navigation&lt;/span&gt;
              &lt;/div&gt;
              &lt;div class="flex justify-between"&gt;
                &lt;span class="text-blue-700"&gt;Enter / Leertaste&lt;/span&gt;
                &lt;span class="text-blue-600"&gt;Nächste Frage&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;!-- Reset Section --&gt;
        &lt;div class="bg-white rounded-lg p-6 shadow-lg border-l-4 border-red-400"&gt;
          &lt;h2 class="text-xl font-semibold text-gray-900 mb-4"&gt;Einstellungen zurücksetzen&lt;/h2&gt;
          &lt;p class="text-gray-600 mb-4"&gt;
            Alle Einstellungen auf die Standardwerte zurücksetzen. Dies kann nicht rückgängig gemacht werden.
          &lt;/p&gt;
          &lt;button
            @click="resetAllSettings"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          &gt;
            Alle Einstellungen zurücksetzen
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/main&gt;
&lt;/template&gt;