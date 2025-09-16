&lt;script setup lang="ts"&gt;
import { ref, onMounted, watch } from 'vue'
import { Chart, ArcElement, DoughnutController, Legend, Tooltip } from 'chart.js'

Chart.register(ArcElement, DoughnutController, Legend, Tooltip)

interface Props {
  correct: number
  incorrect: number
  title?: string
}

const props = withDefaults(defineProps&lt;Props&gt;(), {
  title: 'Ergebnisse'
})

const chartCanvas = ref&lt;HTMLCanvasElement | null&gt;(null)
let chart: Chart | null = null

function createChart() {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chart) {
    chart.destroy()
  }

  const total = props.correct + props.incorrect
  const correctPercentage = total &gt; 0 ? ((props.correct / total) * 100).toFixed(1) : '0'
  const incorrectPercentage = total &gt; 0 ? ((props.incorrect / total) * 100).toFixed(1) : '0'

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Richtig', 'Falsch'],
      datasets: [{
        data: [props.correct, props.incorrect],
        backgroundColor: [
          '#059669', // green-600 (correct)
          '#DC2626'  // red-600 (incorrect)
        ],
        borderWidth: 0,
        hoverBackgroundColor: [
          '#047857', // green-700
          '#B91C1C'  // red-700
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 14,
              family: 'Inter'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const percentage = total &gt; 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

onMounted(() =&gt; {
  createChart()
})

watch([() =&gt; props.correct, () =&gt; props.incorrect], () =&gt; {
  createChart()
})
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="bg-white rounded-lg p-6 shadow-lg"&gt;
    &lt;h3 class="text-lg font-semibold text-gray-900 mb-4 text-center"&gt;{{ title }}&lt;/h3&gt;

    &lt;div class="relative h-64"&gt;
      &lt;canvas ref="chartCanvas"&gt;&lt;/canvas&gt;

      &lt;!-- Center Text --&gt;
      &lt;div class="absolute inset-0 flex items-center justify-center pointer-events-none"&gt;
        &lt;div class="text-center"&gt;
          &lt;div class="text-2xl font-bold text-gray-900"&gt;
            {{ correct + incorrect }}
          &lt;/div&gt;
          &lt;div class="text-sm text-gray-500"&gt;Fragen&lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Summary --&gt;
    &lt;div class="mt-4 grid grid-cols-2 gap-4"&gt;
      &lt;div class="text-center"&gt;
        &lt;div class="text-lg font-semibold text-correct"&gt;{{ correct }}&lt;/div&gt;
        &lt;div class="text-sm text-gray-600"&gt;Richtig&lt;/div&gt;
      &lt;/div&gt;
      &lt;div class="text-center"&gt;
        &lt;div class="text-lg font-semibold text-incorrect"&gt;{{ incorrect }}&lt;/div&gt;
        &lt;div class="text-sm text-gray-600"&gt;Falsch&lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;