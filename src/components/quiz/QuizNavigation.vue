&lt;script setup lang="ts"&gt;
interface Props {
  canGoBack: boolean
  canGoForward: boolean
  showNextButton: boolean
  showFinishButton: boolean
}

const props = defineProps&lt;Props&gt;()

const emit = defineEmits&lt;{
  previous: []
  next: []
  finish: []
  reset: []
}&gt;()
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="flex justify-between items-center"&gt;
    &lt;!-- Previous Button --&gt;
    &lt;button
      @click="emit('previous')"
      :disabled="!canGoBack"
      class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
    &gt;
      &lt;svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
        &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /&gt;
      &lt;/svg&gt;
      Zurück
    &lt;/button&gt;

    &lt;!-- Center Actions --&gt;
    &lt;div class="flex gap-2"&gt;
      &lt;button
        @click="emit('reset')"
        class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      &gt;
        Quiz zurücksetzen
      &lt;/button&gt;
    &lt;/div&gt;

    &lt;!-- Next/Finish Button --&gt;
    &lt;div&gt;
      &lt;button
        v-if="showNextButton"
        @click="emit('next')"
        :disabled="!canGoForward"
        class="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      &gt;
        Weiter
        &lt;svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
          &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /&gt;
        &lt;/svg&gt;
      &lt;/button&gt;

      &lt;button
        v-if="showFinishButton"
        @click="emit('finish')"
        class="px-6 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
      &gt;
        Quiz beenden
      &lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;