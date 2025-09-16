import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../settings'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useSettingsStore()

      expect(store.openaiApiKey).toBe('')
      expect(store.soundEnabled).toBe(true)
      expect(store.theme).toBe('light')
      expect(store.keyboardNavigation).toBe(true)
    })
  })

  describe('API key management', () => {
    it('should set and validate API key', () => {
      const store = useSettingsStore()
      const validKey = 'sk-1234567890abcdef'

      store.setOpenaiApiKey(validKey)

      expect(store.openaiApiKey).toBe(validKey)
      expect(store.hasValidApiKey).toBe(true)
    })

    it('should validate API key format', () => {
      const store = useSettingsStore()

      store.setOpenaiApiKey('invalid-key')
      expect(store.hasValidApiKey).toBe(false)

      store.setOpenaiApiKey('')
      expect(store.hasValidApiKey).toBe(false)

      store.setOpenaiApiKey('sk-valid-key')
      expect(store.hasValidApiKey).toBe(true)
    })

    it('should trim API key when setting', () => {
      const store = useSettingsStore()
      const keyWithSpaces = '  sk-1234567890abcdef  '

      store.setOpenaiApiKey(keyWithSpaces)

      expect(store.openaiApiKey).toBe('sk-1234567890abcdef')
    })
  })

  describe('theme management', () => {
    it('should toggle theme', () => {
      const store = useSettingsStore()

      expect(store.theme).toBe('light')
      expect(store.isDarkMode).toBe(false)

      store.toggleTheme()

      expect(store.theme).toBe('dark')
      expect(store.isDarkMode).toBe(true)

      store.toggleTheme()

      expect(store.theme).toBe('light')
      expect(store.isDarkMode).toBe(false)
    })

    it('should set specific theme', () => {
      const store = useSettingsStore()

      store.setTheme('dark')
      expect(store.theme).toBe('dark')

      store.setTheme('light')
      expect(store.theme).toBe('light')
    })
  })

  describe('settings persistence', () => {
    it('should save settings to localStorage', () => {
      const store = useSettingsStore()

      store.setOpenaiApiKey('sk-test')
      store.setSoundEnabled(false)
      store.setTheme('dark')
      store.setKeyboardNavigation(false)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'binary-brain-settings',
        JSON.stringify({
          openaiApiKey: 'sk-test',
          soundEnabled: false,
          theme: 'dark',
          keyboardNavigation: false
        })
      )
    })

    it('should load settings from localStorage', () => {
      const savedSettings = {
        openaiApiKey: 'sk-saved',
        soundEnabled: false,
        theme: 'dark',
        keyboardNavigation: false
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings))

      const store = useSettingsStore()
      store.loadFromLocalStorage()

      expect(store.openaiApiKey).toBe('sk-saved')
      expect(store.soundEnabled).toBe(false)
      expect(store.theme).toBe('dark')
      expect(store.keyboardNavigation).toBe(false)
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const store = useSettingsStore()
      store.loadFromLocalStorage()

      // Should not crash and keep default values
      expect(store.openaiApiKey).toBe('')
      expect(store.soundEnabled).toBe(true)
    })

    it('should handle missing localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const store = useSettingsStore()
      store.loadFromLocalStorage()

      // Should keep default values
      expect(store.openaiApiKey).toBe('')
      expect(store.soundEnabled).toBe(true)
    })
  })

  describe('reset settings', () => {
    it('should reset all settings to defaults', () => {
      const store = useSettingsStore()

      // Change all settings
      store.setOpenaiApiKey('sk-test')
      store.setSoundEnabled(false)
      store.setTheme('dark')
      store.setKeyboardNavigation(false)

      store.resetSettings()

      expect(store.openaiApiKey).toBe('')
      expect(store.soundEnabled).toBe(true)
      expect(store.theme).toBe('light')
      expect(store.keyboardNavigation).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('binary-brain-settings')
    })
  })

  describe('individual setting toggles', () => {
    it('should toggle sound enabled', () => {
      const store = useSettingsStore()

      expect(store.soundEnabled).toBe(true)
      store.setSoundEnabled(false)
      expect(store.soundEnabled).toBe(false)
    })

    it('should toggle keyboard navigation', () => {
      const store = useSettingsStore()

      expect(store.keyboardNavigation).toBe(true)
      store.setKeyboardNavigation(false)
      expect(store.keyboardNavigation).toBe(false)
    })
  })
})