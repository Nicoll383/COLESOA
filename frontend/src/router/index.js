import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/secretaria',
    name: 'SecretariaDashboard',
    component: () => import('@/views/secretaria/SecretariaDashboard.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/finanzas',
    name: 'FinanzasDashboard',
    component: () => import('@/views/finanzas/FinanzasDashboard.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'finanzas'] }
  },
  {
    path: '/docente',
    name: 'DocenteDashboard',
    component: () => import('@/views/docente/DocenteDashboard.vue'),
    meta: { requiresAuth: true, roles: ['docente'] }
  },
  {
    path: '/padre',
    name: 'PadreDashboard',
    component: () => import('@/views/padre/PadreDashboard.vue'),
    meta: { requiresAuth: true, roles: ['padre'] }
  },
  {
    path: '/students',
    name: 'StudentsList',
    component: () => import('@/views/students/StudentsList.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria', 'docente', 'finanzas'] }
  },
  {
    path: '/students/create',
    name: 'StudentCreate',
    component: () => import('@/views/students/StudentForm.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: () => import('@/views/students/StudentDetail.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria', 'docente', 'finanzas', 'padre'] }
  },
  {
    path: '/students/:id/edit',
    name: 'StudentEdit',
    component: () => import('@/views/students/StudentForm.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/enrollments',
    name: 'EnrollmentsList',
    component: () => import('@/views/enrollments/EnrollmentsList.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria', 'finanzas'] }
  },
  {
    path: '/enrollments/create',
    name: 'EnrollmentCreate',
    component: () => import('@/views/enrollments/EnrollmentForm.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/enrollments/:id',
    name: 'EnrollmentDetail',
    component: () => import('@/views/enrollments/EnrollmentDetail.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria', 'finanzas'] }
  },
  {
    path: '/secciones',
    name: 'SeccionesManagement',
    component: () => import('@/views/academic/SeccionesManagement.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/cursos',
    name: 'CursosManagement',
    component: () => import('@/views/academic/CursosManagement.vue'),
    meta: { requiresAuth: true, roles: ['administrador', 'secretaria'] }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/reports/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/school-year-config',
    name: 'ConfigAñoEscolar',
    component: () => import('@/views/settings/ConfigAñoEscolar.vue'),
    meta: { requiresAuth: true, roles: ['administrador'] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.rol

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Rutas solo para invitados (no autenticados)
  if (to.meta.requiresGuest && isAuthenticated) {
    return next('/dashboard')
  }

  // Verificar roles
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    return next('/dashboard')
  }

  next()
})

export default router
