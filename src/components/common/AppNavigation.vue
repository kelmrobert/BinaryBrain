&lt;script setup lang="ts"&gt;
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()
const settingsStore = useSettingsStore()

const isQuizActive = computed(() =&gt; quizStore.isQuizActive)
const hasQuestions = computed(() =&gt; quizStore.totalQuestions &gt; 0)

const navItems = computed(() =&gt; [
  {
    name: 'Upload',
    path: '/',
    icon: 'upload',
    active: route.name === 'home'
  },
  {
    name: 'Quiz',
    path: '/quiz',
    icon: 'quiz',
    active: route.name === 'quiz',
    disabled: !hasQuestions.value
  },
  {
    name: 'Statistiken',
    path: '/statistics',
    icon: 'stats',
    active: route.name === 'statistics',
    disabled: quizStore.answers.length === 0
  },
  {
    name: 'Einstellungen',
    path: '/settings',
    icon: 'settings',
    active: route.name === 'settings'
  }
])

function navigateTo(path: string, disabled?: boolean) {
  if (disabled) return
  router.push(path)
}
&lt;/script&gt;

&lt;template&gt;
  &lt;nav class="bg-white shadow-sm border-b border-gray-200"&gt;
    &lt;div class="container mx-auto px-4"&gt;
      &lt;div class="flex items-center justify-between h-16"&gt;
        &lt;!-- Logo/Brand --&gt;
        &lt;div class="flex items-center"&gt;
          &lt;router-link to="/" class="flex items-center space-x-2"&gt;
            &lt;div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"&gt;
              &lt;span class="text-white font-bold text-sm"&gt;BB&lt;/span&gt;
            &lt;/div&gt;
            &lt;span class="text-xl font-bold text-gray-900"&gt;Binary Brain&lt;/span&gt;
          &lt;/router-link&gt;
        &lt;/div&gt;

        &lt;!-- Navigation Items --&gt;
        &lt;div class="hidden md:flex items-center space-x-8"&gt;
          &lt;button
            v-for="item in navItems"
            :key="item.name"
            @click="navigateTo(item.path, item.disabled)"
            :disabled="item.disabled"
            class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="{
              'text-primary bg-blue-50': item.active,
              'text-gray-700 hover:text-primary hover:bg-gray-50': !item.active && !item.disabled,
              'text-gray-400 cursor-not-allowed': item.disabled
            }"
          &gt;
            &lt;!-- Icons --&gt;
            &lt;svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path
                v-if="item.icon === 'upload'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'quiz'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'stats'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'settings'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              /&gt;
              &lt;path
                v-if="item.icon === 'settings'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              /&gt;
            &lt;/svg&gt;
            &lt;span&gt;{{ item.name }}&lt;/span&gt;
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;!-- Theme Toggle --&gt;
        &lt;div class="flex items-center space-x-4"&gt;
          &lt;button
            @click="settingsStore.toggleTheme"
            class="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Theme wechseln"
          &gt;
            &lt;svg v-if="settingsStore.isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /&gt;
            &lt;/svg&gt;
            &lt;svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /&gt;
            &lt;/svg&gt;
          &lt;/button&gt;

          &lt;!-- Mobile Menu Button --&gt;
          &lt;button class="md:hidden p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors duration-200"&gt;
            &lt;svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /&gt;
            &lt;/svg&gt;
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;!-- Mobile Navigation --&gt;
      &lt;div class="md:hidden border-t border-gray-200 py-4"&gt;
        &lt;div class="flex flex-col space-y-2"&gt;
          &lt;button
            v-for="item in navItems"
            :key="item.name"
            @click="navigateTo(item.path, item.disabled)"
            :disabled="item.disabled"
            class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="{
              'text-primary bg-blue-50': item.active,
              'text-gray-700 hover:text-primary hover:bg-gray-50': !item.active && !item.disabled,
              'text-gray-400 cursor-not-allowed': item.disabled
            }"
          &gt;
            &lt;svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path
                v-if="item.icon === 'upload'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'quiz'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'stats'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              /&gt;
              &lt;path
                v-else-if="item.icon === 'settings'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              /&gt;
              &lt;path
                v-if="item.icon === 'settings'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              /&gt;
            &lt;/svg&gt;
            &lt;span&gt;{{ item.name }}&lt;/span&gt;
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/nav&gt;
&lt;/template&gt;