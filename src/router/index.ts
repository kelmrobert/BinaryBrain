import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () =&gt; import('../views/QuizView.vue')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () =&gt; import('../views/StatisticsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () =&gt; import('../views/SettingsView.vue')
    }
  ]
})

export default router