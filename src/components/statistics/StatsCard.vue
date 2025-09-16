<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    accent: 'text-blue-600',
    icon: 'text-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    accent: 'text-green-600',
    icon: 'text-green-500'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    accent: 'text-red-600',
    icon: 'text-red-500'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    accent: 'text-yellow-600',
    icon: 'text-yellow-500'
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    accent: 'text-gray-600',
    icon: 'text-gray-500'
  }
}

const colors = colorClasses[props.color]
</script>

<template>
  <div :class="[colors.bg, 'rounded-lg p-6 border border-opacity-20']">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p :class="[colors.text, 'text-sm font-medium']">{{ title }}</p>
        <p :class="[colors.accent, 'text-2xl font-bold mt-1']">{{ value }}</p>
        <p v-if="subtitle" :class="[colors.text, 'text-xs opacity-75 mt-1']">{{ subtitle }}</p>
      </div>

      <div v-if="icon" :class="[colors.icon, 'ml-4']">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="icon === 'check'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
          <path
            v-else-if="icon === 'x'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
          <path
            v-else-if="icon === 'clock'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            v-else-if="icon === 'chart'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
          <path
            v-else-if="icon === 'question'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>