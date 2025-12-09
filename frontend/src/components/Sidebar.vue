<template>
  <div class="sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <span>SOA</span>
        </div>
        <h2 v-if="!collapsed" class="logo-text">Colegio SOA</h2>
      </div>
      <button @click="toggleSidebar" class="toggle-btn">
        <span v-if="collapsed">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <p v-if="!collapsed" class="section-title">MENÚ</p>
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="!collapsed">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-details">
          <p class="user-name">{{ user?.nombre }} {{ user?.apellido }}</p>
          <p class="user-role">{{ roleName }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="logout-btn">
        <span class="nav-icon">🚪</span>
        <span v-if="!collapsed">Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const user = computed(() => authStore.user)

const userInitials = computed(() => {
  if (!user.value) return '?'
  const nombre = user.value.nombre?.charAt(0) || ''
  const apellido = user.value.apellido?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
})

const roleName = computed(() => {
  const roles = {
    administrador: 'Administrador',
    secretaria: 'Secretaría',
    finanzas: 'Finanzas',
    docente: 'Docente',
    padre: 'Padre/Apoderado'
  }
  return roles[user.value?.rol] || user.value?.rol
})

const menuItems = computed(() => {
  const role = user.value?.rol

  // Menús específicos por rol
  const menus = {
    administrador: [
      { path: '/admin', label: 'Dashboard', icon: '📊' },
      { path: '/students', label: 'Estudiantes', icon: '👥' },
      { path: '/enrollments', label: 'Matrículas', icon: '📝' },
      { path: '/payments', label: 'Pagos', icon: '💰' },
      { path: '/secciones', label: 'Secciones', icon: '🏫' },
      { path: '/cursos', label: 'Cursos', icon: '📚' },
      { path: '/users', label: 'Usuarios', icon: '👤' },
      { path: '/school-year-config', label: 'Año Escolar', icon: '📅' },
      { path: '/reports', label: 'Reportes', icon: '📈' }
    ],
    secretaria: [
      { path: '/secretaria', label: 'Dashboard', icon: '📊' },
      { path: '/students', label: 'Estudiantes', icon: '👥' },
      { path: '/enrollments', label: 'Matrículas', icon: '📝' },
      { path: '/secretaria/documentos', label: 'Validar Documentos', icon: '📄' },
      { path: '/secciones', label: 'Secciones', icon: '🏫' },
      { path: '/cursos', label: 'Cursos', icon: '📚' }
    ],
    finanzas: [
      { path: '/finanzas', label: 'Dashboard', icon: '📊' },
      { path: '/finanzas/registrar-pago', label: 'Registrar Pago', icon: '💵' },
      { path: '/finanzas/deudas', label: 'Deudas Pendientes', icon: '⚠️' },
      { path: '/finanzas/historial', label: 'Historial de Pagos', icon: '📜' },
      { path: '/finanzas/reportes', label: 'Reportes Financieros', icon: '📊' }
    ],
    docente: [
      { path: '/docente', label: 'Dashboard', icon: '📊' },
      { path: '/docente/horario', label: 'Mi Horario', icon: '📅' },
      { path: '/docente/estudiantes', label: 'Mis Estudiantes', icon: '👥' },
      { path: '/docente/notas', label: 'Registrar Notas', icon: '📝' },
      { path: '/docente/asistencia', label: 'Asistencia', icon: '✅' },
      { path: '/docente/reportes', label: 'Reportes', icon: '📈' }
    ],
    padre: [
      { path: '/padre', label: 'Dashboard', icon: '📊' },
      { path: '/padre/hijos', label: 'Mis Hijos', icon: '👨‍👩‍👧‍👦' },
      { path: '/padre/cuotas', label: 'Cuotas y Pagos', icon: '💰' },
      { path: '/padre/documentos', label: 'Documentos', icon: '📄' },
      { path: '/padre/asistencia', label: 'Asistencia', icon: '📅' }
    ]
  }

  return menus[role] || []
})

const showAdminItems = computed(() => {
  return false // Ya no se usa, todo está en menuItems
})

const adminItems = [] // Ya no se usa

const isActive = (path) => {
  return route.path.startsWith(path)
}

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1e3a8a;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toggle-btn:hover {
  opacity: 1;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.5rem 1rem;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: white;
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.9375rem;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  overflow: hidden;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.sidebar.collapsed .user-info,
.sidebar.collapsed .section-title {
  display: none;
}

.sidebar.collapsed .nav-item,
.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
