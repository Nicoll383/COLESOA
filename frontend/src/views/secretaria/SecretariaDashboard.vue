<template>
  <AppLayout>
    <div class="page-container">
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Bienvenido, {{ user?.nombre }}</h1>
          <p class="page-subtitle">Secretaría - Panel de Control</p>
        </div>
        <div class="current-date">
          <span class="text-sm text-gray-600">{{ currentDate }}</span>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Accesos Rápidos</h2>
        <div class="quick-actions-grid">
          <router-link to="/enrollments/create" class="quick-action-card">
            <div class="action-icon">📝</div>
            <div class="action-content">
              <h3 class="action-title">Nueva Matrícula</h3>
              <p class="action-description">Registrar nuevo estudiante</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/students" class="quick-action-card">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h3 class="action-title">Estudiantes</h3>
              <p class="action-description">Ver lista de estudiantes</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/enrollments" class="quick-action-card">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h3 class="action-title">Matrículas</h3>
              <p class="action-description">Gestionar matrículas</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>

          <router-link to="/secretaria/documentos" class="quick-action-card">
            <div class="action-icon">📄</div>
            <div class="action-content">
              <h3 class="action-title">Documentos</h3>
              <p class="action-description">Aprobar documentos de estudiantes</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
  justify-center: center;
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

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #4b5563;
}
</style>
