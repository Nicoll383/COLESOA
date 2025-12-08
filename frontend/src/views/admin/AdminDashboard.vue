<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Bienvenido, {{ user?.nombre }}</h1>
          <p class="page-subtitle">Administrador - Panel de Control</p>
        </div>
        <div class="current-date">
          <span class="text-sm text-gray-600">{{ currentDate }}</span>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="stats-grid">
        <div class="stat-card bg-gradient-blue">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3 class="stat-label">Estudiantes Activos</h3>
            <p class="stat-value">{{ stats.estudiantes }}</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-green">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3 class="stat-label">Matrículas 2025</h3>
            <p class="stat-value">{{ stats.matriculas }}</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-yellow">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3 class="stat-label">Pagos Pendientes</h3>
            <p class="stat-value">{{ stats.pagosPendientes }}</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-purple">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3 class="stat-label">Reportes</h3>
            <p class="stat-value">{{ stats.reportes }}</p>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="card">
        <h2 class="section-title">Accesos Rápidos</h2>
        <div class="quick-actions-grid">
          <router-link to="/users" class="quick-action-card">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h3 class="action-title">Gestionar Estudiantes</h3>
              <p class="action-description">Ver, crear y editar estudiantes</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/enrollments" class="quick-action-card">
            <div class="action-icon">📝</div>
            <div class="action-content">
              <h3 class="action-title">Matrículas</h3>
              <p class="action-description">Gestionar proceso de matrícula</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/payments" class="quick-action-card">
            <div class="action-icon">💰</div>
            <div class="action-content">
              <h3 class="action-title">Pagos</h3>
              <p class="action-description">Control de pagos y pensiones</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/reports" class="quick-action-card">
            <div class="action-icon">📊</div>
            <div class="action-content">
              <h3 class="action-title">Reportes</h3>
              <p class="action-description">Ver reportes y estadísticas</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
        </div>
      </div>

      <!-- Información Adicional -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="card">
          <h2 class="section-title mb-4">Actividad Reciente</h2>
          <div class="text-center py-8 text-gray-500">
            <p>No hay actividad reciente</p>
          </div>
        </div>

        <div class="card">
          <h2 class="section-title mb-4">Notificaciones</h2>
          <div class="text-center py-8 text-gray-500">
            <p>No hay notificaciones nuevas</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const stats = ref({
  estudiantes: '--',
  matriculas: '--',
  pagosPendientes: '--',
  reportes: '--'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

onMounted(async () => {
  // TODO: Cargar estadísticas reales desde API
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.current-date {
  text-transform: capitalize;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bg-gradient-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.bg-gradient-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.bg-gradient-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.quick-action-card:hover {
  background: white;
  border-color: #3b82f6;
  transform: translateX(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.action-arrow {
  font-size: 1.5rem;
  color: #3b82f6;
  opacity: 0;
  transition: opacity 0.2s;
}

.quick-action-card:hover .action-arrow {
  opacity: 1;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
