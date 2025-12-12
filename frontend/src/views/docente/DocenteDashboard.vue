<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Panel Docente</h1>
          <p class="page-subtitle">Gestión de estudiantes, notas y asistencias</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card stat-info">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <p class="stat-label">Mis Estudiantes</p>
            <p class="stat-value">{{ stats.totalEstudiantes }}</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <p class="stat-label">Cursos Asignados</p>
            <p class="stat-value">{{ stats.cursosAsignados }}</p>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <p class="stat-label">Notas Pendientes</p>
            <p class="stat-value">{{ stats.notasPendientes }}</p>
          </div>
        </div>

        <div class="stat-card stat-primary">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-label">Asistencia Promedio</p>
            <p class="stat-value">{{ stats.asistenciaPromedio }}%</p>
          </div>
        </div>
      </div>

      <!-- Módulos -->
      <div class="modules-grid">
        <div @click="router.push('/students')" class="module-card module-info">
          <div class="module-icon">👨‍🎓</div>
          <h3 class="module-title">Mis Estudiantes</h3>
          <p class="module-description">Ver lista de estudiantes asignados</p>
        </div>

        <div class="module-card module-success">
          <div class="module-icon">📝</div>
          <h3 class="module-title">Registrar Notas</h3>
          <p class="module-description">Ingresar calificaciones de evaluaciones</p>
        </div>

        <div class="module-card module-primary">
          <div class="module-icon">✅</div>
          <h3 class="module-title">Tomar Asistencia</h3>
          <p class="module-description">Registrar asistencia diaria</p>
        </div>

        <div class="module-card module-warning">
          <div class="module-icon">📊</div>
          <h3 class="module-title">Reportes</h3>
          <p class="module-description">Ver rendimiento académico</p>
        </div>
      </div>

      <!-- Secciones Asignadas -->
      <div class="card">
        <h2 class="section-title">📚 Mis Secciones</h2>

        <div v-if="secciones.length > 0" class="secciones-grid">
          <div v-for="seccion in secciones" :key="seccion.id" class="seccion-card">
            <div class="seccion-header">
              <h3 class="seccion-title">{{ seccion.grado_nombre }} - Sección {{ seccion.nombre }}</h3>
              <span class="seccion-badge">{{ seccion.estudiantes_count }} estudiantes</span>
            </div>
            <div class="seccion-info">
              <p><strong>Aula:</strong> {{ seccion.aula }}</p>
              <p><strong>Turno:</strong> {{ seccion.turno }}</p>
            </div>
            <div class="seccion-actions">
              <button class="btn-action btn-primary-action">Ver Estudiantes</button>
              <button class="btn-action btn-success-action">Asistencia</button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <p class="empty-text">No tienes secciones asignadas</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()

// DATOS MOCK - Solo visualización
const stats = ref({
  totalEstudiantes: 125,
  cursosAsignados: 3,
  notasPendientes: 8,
  asistenciaPromedio: 92
})

const secciones = ref([
  {
    id: 1,
    grado_nombre: '1° Primaria',
    nombre: 'A',
    estudiantes_count: 28,
    aula: 'Aula 101',
    turno: 'Mañana'
  },
  {
    id: 2,
    grado_nombre: '1° Primaria',
    nombre: 'B',
    estudiantes_count: 30,
    aula: 'Aula 102',
    turno: 'Mañana'
  },
  {
    id: 3,
    grado_nombre: '2° Primaria',
    nombre: 'A',
    estudiantes_count: 27,
    aula: 'Aula 201',
    turno: 'Tarde'
  }
])

const loadStats = async () => {
  // Datos ya cargados en el ref inicial
  console.log('Estadísticas cargadas (mock)')
}

const loadSecciones = async () => {
  // Datos ya cargados en el ref inicial
  console.log('Secciones cargadas (mock)')
}

onMounted(() => {
  loadStats()
  loadSecciones()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
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
  margin-top: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid;
}

.stat-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.stat-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.stat-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.stat-primary {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-color: #6366f1;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.module-card {
  padding: 2rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border: 2px solid;
  background: white;
}

.module-info {
  border-color: #3b82f6;
}

.module-success {
  border-color: #10b981;
}

.module-primary {
  border-color: #6366f1;
}

.module-warning {
  border-color: #f59e0b;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.2);
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.module-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.module-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.secciones-grid {
  display: grid;
  gap: 1rem;
}

.seccion-card {
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.seccion-card:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.seccion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.seccion-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.seccion-badge {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.seccion-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

.seccion-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary-action {
  background: #667eea;
  color: white;
}

.btn-success-action {
  background: #10b981;
  color: white;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  margin: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .seccion-actions {
    flex-direction: column;
  }
}
</style>
