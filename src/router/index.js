import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProblemView from '../views/ProblemView.vue'
import CheckView from '../views/CheckView.vue'
import { isLoggedIn } from '../services/auth'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/problem', name: 'problem', component: ProblemView, meta: { requiresAuth: true } },
  { path: '/check', name: 'check', component: CheckView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !isLoggedIn()) {
    sessionStorage.setItem('login-message', '로그인이 필요합니다.')
    return {
      path: '/login',
    }
  }

  return true
})

export default router
