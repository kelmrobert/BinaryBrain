import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const openaiApiKey = ref('')
  const soundEnabled = ref(true)
  const theme = ref<'light' | 'dark'>('light')
  const keyboardNavigation = ref(true)

  // Getters
  const hasValidApiKey = computed(() => {
    return openaiApiKey.value.trim().length > 0 && openaiApiKey.value.startsWith('sk-')
  })

  const isDarkMode = computed(() => theme.value === 'dark')

  // Actions
  function setOpenaiApiKey(key: string) {
    openaiApiKey.value = key.trim()
    saveToLocalStorage()
  }

  function setSoundEnabled(enabled: boolean) {
    soundEnabled.value = enabled
    saveToLocalStorage()
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    saveToLocalStorage()
    applyTheme()
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function setKeyboardNavigation(enabled: boolean) {
    keyboardNavigation.value = enabled
    saveToLocalStorage()
  }

  function applyTheme() {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function saveToLocalStorage() {
    const settings = {
      openaiApiKey: openaiApiKey.value,
      soundEnabled: soundEnabled.value,
      theme: theme.value,
      keyboardNavigation: keyboardNavigation.value
    }
    localStorage.setItem('binary-brain-settings', JSON.stringify(settings))
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('binary-brain-settings')
      if (stored) {
        const settings = JSON.parse(stored)
        openaiApiKey.value = settings.openaiApiKey || ''
        soundEnabled.value = settings.soundEnabled !== undefined ? settings.soundEnabled : true
        theme.value = settings.theme || 'light'
        keyboardNavigation.value = settings.keyboardNavigation !== undefined ? settings.keyboardNavigation : true
        applyTheme()
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }

  function resetSettings() {
    openaiApiKey.value = ''
    soundEnabled.value = true
    theme.value = 'light'
    keyboardNavigation.value = true
    localStorage.removeItem('binary-brain-settings')
    applyTheme()
  }

  function getApiKeyFromEnv() {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envKey && !openaiApiKey.value) {
      setOpenaiApiKey(envKey)
    }
    return envKey
  }

  // Load settings on store initialization
  loadFromLocalStorage()
  getApiKeyFromEnv()

  return {
    // State
    openaiApiKey,
    soundEnabled,
    theme,
    keyboardNavigation,

    // Getters
    hasValidApiKey,
    isDarkMode,

    // Actions
    setOpenaiApiKey,
    setSoundEnabled,
    setTheme,
    toggleTheme,
    setKeyboardNavigation,
    applyTheme,
    saveToLocalStorage,
    loadFromLocalStorage,
    resetSettings,
    getApiKeyFromEnv
  }
})