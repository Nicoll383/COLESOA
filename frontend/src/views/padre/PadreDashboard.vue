<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Bienvenido, {{ user?.nombre }}</h1>
          <p class="page-subtitle">Portal de Padres - Información de sus Hijos</p>
        </div>
        <div class="current-date">
          <span class="text-sm text-gray-600">{{ currentDate }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando información...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Hijos del Padre -->
      <div v-else class="children-section">
        <!-- No tiene hijos matriculados -->
        <div v-if="hijos.length === 0" class="card text-center py-12">
          <div class="empty-icon">👨‍👩‍👧‍👦</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay estudiantes matriculados</h3>
          <p class="text-gray-600">No se encontraron estudiantes asociados a su cuenta.</p>
        </div>

        <!-- Lista de Hijos -->
        <div v-else class="space-y-6">
          <div v-for="hijo in hijos" :key="hijo.id" class="hijo-card">
            <!-- Información del Estudiante -->
            <div class="hijo-header">
              <div class="hijo-avatar">
                {{ hijo.nombres.charAt(0) }}{{ hijo.apellidos.charAt(0) }}
              </div>
              <div class="hijo-info">
                <h3 class="hijo-name">{{ hijo.nombres }} {{ hijo.apellidos }}</h3>
                <div class="hijo-details">
                  <span class="detail-badge">{{ hijo.grado_nombre }}</span>
                  <span class="detail-badge">Sección {{ hijo.seccion_nombre }}</span>
                  <span class="detail-badge">DNI: {{ hijo.dni }}</span>
                </div>
              </div>
              <div class="hijo-status">
                <span class="status-badge" :class="{
                  'badge-success': hijo.estado_matricula === 'confirmada' || hijo.estado_matricula === 'pagada',
                  'badge-warning': hijo.estado_matricula === 'pendiente'
                }">
                  {{ getEstadoLabel(hijo.estado_matricula) }}
                </span>
              </div>
            </div>

            <!-- Resumen de Cuotas y Documentos -->
            <div class="hijo-summary">
              <div class="summary-card summary-warning">
                <div class="summary-icon">💰</div>
                <div class="summary-content">
                  <h4 class="summary-title">Cuotas Pendientes</h4>
                  <p class="summary-value">{{ hijo.cuotas_pendientes || 0 }}</p>
                  <p class="summary-text">S/. {{ (hijo.monto_pendiente || 0).toFixed(2) }}</p>
                </div>
              </div>

              <div class="summary-card summary-danger">
                <div class="summary-icon">📄</div>
                <div class="summary-content">
                  <h4 class="summary-title">Documentos Pendientes</h4>
                  <p class="summary-value">{{ hijo.documentos_pendientes || 0 }}</p>
                  <p class="summary-text">{{ hijo.documentos_totales || 0 }} documentos totales</p>
                </div>
              </div>

              <div class="summary-card summary-info">
                <div class="summary-icon">📅</div>
                <div class="summary-content">
                  <h4 class="summary-title">Asistencia del Mes</h4>
                  <p class="summary-value">{{ hijo.asistencias || 0 }}%</p>
                  <p class="summary-text">{{ hijo.dias_asistidos || 0 }} de {{ hijo.dias_habiles || 0 }} días</p>
                </div>
              </div>
            </div>

            <!-- Acciones Rápidas -->
            <div class="hijo-actions">
              <button @click="verCuotas(hijo.id)" class="action-button action-primary">
                <span class="action-icon">💳</span>
                <span>Ver Cuotas</span>
              </button>
              <button @click="verDocumentos(hijo.id)" class="action-button action-secondary">
                <span class="action-icon">📄</span>
                <span>Documentos</span>
              </button>
              <button @click="verAsistencia(hijo.id)" class="action-button action-info">
                <span class="action-icon">📊</span>
                <span>Asistencia</span>
              </button>
              <button @click="verNotas(hijo.id)" class="action-button action-success">
                <span class="action-icon">📝</span>
                <span>Notas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Avisos Importantes -->
      <div class="card mt-6">
        <h2 class="section-title">📢 Avisos Importantes</h2>
        <div class="avisos-list">
          <div class="aviso-item aviso-warning">
            <div class="aviso-icon">⚠️</div>
            <div class="aviso-content">
              <h4 class="aviso-title">Fecha límite de pago</h4>
              <p class="aviso-text">Las cuotas mensuales vencen el día 10 de cada mes. Evite recargos.</p>
            </div>
          </div>
          <div class="aviso-item aviso-info">
            <div class="aviso-icon">ℹ️</div>
            <div class="aviso-content">
              <h4 class="aviso-title">Documentos requeridos</h4>
              <p class="aviso-text">Complete la documentación pendiente para evitar inconvenientes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loading = ref(true)
const error = ref(null)
const hijos = ref([])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    pagada: 'Pagada',
    cancelada: 'Cancelada'
  }
  return labels[estado] || estado
}

const loadHijos = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/padre/hijos')
    hijos.value = response.data.data
    loading.value = false
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar información'
    loading.value = false
  }
}

const verCuotas = (hijoId) => {
  router.push({ name: 'PadreCuotasEstudiante', params: { estudianteId: hijoId } })
}

const verDocumentos = (hijoId) => {
  router.push({ name: 'PadreDocumentos', query: { estudiante: hijoId } })
}

const verAsistencia = (hijoId) => {
  router.push({ name: 'PadreAsistencia' })
}

const verNotas = (hijoId) => {
  // TODO: Implementar vista de notas
  alert('Vista de notas en desarrollo')
}

onMounted(() => {
  loadHijos()
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
  margin-top: 0.5rem;
}

.current-date {
  text-align: right;
}

/* Hijo Card */
.hijo-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: transform 0.2s;
}

.hijo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
}

.hijo-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.hijo-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.hijo-info {
  flex: 1;
}

.hijo-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.hijo-details {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-badge {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.hijo-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-success {
  background: #10b981;
  color: white;
}

.badge-warning {
  background: #f59e0b;
  color: white;
}

/* Summary Cards */
.hijo-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
}

.summary-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

.summary-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
}

.summary-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.summary-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Action Buttons */
.hijo-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1rem;
  border: 2px solid;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 1.25rem;
}

.action-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.action-secondary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-color: #f59e0b;
}

.action-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #3b82f6;
}

.action-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-color: #10b981;
}

/* Avisos */
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.avisos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.aviso-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  display: flex;
  gap: 1rem;
}

.aviso-warning {
  background: #fef3c7;
  border-color: #f59e0b;
}

.aviso-info {
  background: #dbeafe;
  border-color: #3b82f6;
}

.aviso-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.aviso-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.aviso-text {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}

/* Empty State */
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Card */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

/* Alert */
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .hijo-header {
    flex-direction: column;
    text-align: center;
  }

  .hijo-summary {
    grid-template-columns: 1fr;
  }

  .hijo-actions {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
