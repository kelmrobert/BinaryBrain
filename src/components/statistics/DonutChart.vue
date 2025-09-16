<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, ArcElement, DoughnutController, Legend, Tooltip } from 'chart.js'

Chart.register(ArcElement, DoughnutController, Legend, Tooltip)

interface Props {
  correct: number
  incorrect: number
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ergebnisse'
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
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
  const correctPercentage = total > 0 ? ((props.correct / total) * 100).toFixed(1) : '0'
  const incorrectPercentage = total > 0 ? ((props.incorrect / total) * 100).toFixed(1) : '0'

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
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch([() => props.correct, () => props.incorrect], () => {
  createChart()
})
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-lg">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">{{ title }}</h3>

    <div class="relative h-64">
      <canvas ref="chartCanvas"></canvas>

      <!-- Center Text -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            {{ correct + incorrect }}
          </div>
          <div class="text-sm text-gray-500">Fragen</div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-lg font-semibold text-correct">{{ correct }}</div>
        <div class="text-sm text-gray-600">Richtig</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold text-incorrect">{{ incorrect }}</div>
        <div class="text-sm text-gray-600">Falsch</div>
      </div>
    </div>
  </div>
</template>