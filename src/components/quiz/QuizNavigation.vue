<script setup lang="ts">
interface Props {
  canGoBack: boolean
  canGoForward: boolean
  showNextButton: boolean
  showFinishButton: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  previous: []
  next: []
  finish: []
  reset: []
}>()
</script>

<template>
  <div class="flex justify-between items-center">
    <!-- Previous Button -->
    <button
      @click="emit('previous')"
      :disabled="!canGoBack"
      class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
    >
      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Zurück
    </button>

    <!-- Center Actions -->
    <div class="flex gap-2">
      <button
        @click="emit('reset')"
        class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        Quiz zurücksetzen
      </button>
    </div>

    <!-- Next/Finish Button -->
    <div>
      <button
        v-if="showNextButton"
        @click="emit('next')"
        :disabled="!canGoForward"
        class="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Weiter
        <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        v-if="showFinishButton"
        @click="emit('finish')"
        class="px-6 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
      >
        Quiz beenden
      </button>
    </div>
  </div>
</template>