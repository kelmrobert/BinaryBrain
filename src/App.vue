&lt;script setup lang="ts"&gt;
import { RouterView } from 'vue-router'
import AppNavigation from '@/components/common/AppNavigation.vue'
&lt;/script&gt;

&lt;template&gt;
  &lt;div id="app" class="min-h-screen bg-gray-50"&gt;
    &lt;AppNavigation /&gt;
    &lt;RouterView /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style scoped&gt;
#app {
  min-height: 100vh;
}
&lt;/style&gt;