<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">📋 Asistencia</h1>
          <p class="page-subtitle">Control de asistencia de mis hijos</p>
        </div>
        <div class="hijo-selector">
          <label for="hijo-select" class="selector-label">Estudiante:</label>
          <select
            id="hijo-select"
            v-model="selectedHijoId"
            @change="cargarAsistencia"
            class="hijo-select"
          >
            <option value="">Seleccionar estudiante...</option>
            <option v-for="hijo in hijos" :key="hijo.id" :value="hijo.id">
              {{ hijo.nombres }} {{ hijo.apellidos }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card text-center py-8">
        <div class="loading-spinner"></div>
        <p class="text-gray-600 mt-4">Cargando asistencia...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- No hijo seleccionado -->
      <div v-else-if="!selectedHijoId" class="card text-center py-12">
        <div class="empty-icon">👨‍👩‍👧‍👦</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona un estudiante</h3>
        <p class="text-gray-600">Por favor selecciona un estudiante para ver su asistencia</p>
      </div>

      <!-- Contenido de Asistencia -->
      <div v-else>
        <!-- Filtros -->
        <div class="card mb-6">
          <div class="filters-section">
            <div class="filter-group">
              <label class="filter-label">Mes</label>
              <select v-model="filters.mes" @change="cargarAsistencia" class="filter-select">
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Año</label>
              <select v-model="filters.anio" @change="cargarAsistencia" class="filter-select">
                <option v-for="anio in anios" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Estado</label>
              <select v-model="filters.estado" @change="filtrarAsistencias" class="filter-select">
                <option value="">Todos</option>
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="tardanza">Tardanza</option>
                <option value="justificado">Justificado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Resumen de Asistencia -->
        <div class="resumen-grid mb-6">
          <div class="resumen-card resumen-success">
            <div class="resumen-icon">✅</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Asistencias</h4>
              <p class="resumen-value">{{ estadisticas.presentes }}</p>
              <p class="resumen-text">{{ estadisticas.porcentajePresentes.toFixed(1) }}%</p>
            </div>
          </div>

          <div class="resumen-card resumen-danger">
            <div class="resumen-icon">❌</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Inasistencias</h4>
              <p class="resumen-value">{{ estadisticas.ausentes }}</p>
              <p class="resumen-text">{{ estadisticas.porcentajeAusentes.toFixed(1) }}%</p>
            </div>
          </div>

          <div class="resumen-card resumen-warning">
            <div class="resumen-icon">⏰</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Tardanzas</h4>
              <p class="resumen-value">{{ estadisticas.tardanzas }}</p>
              <p class="resumen-text">{{ estadisticas.porcentajeTardanzas.toFixed(1) }}%</p>
            </div>
          </div>

          <div class="resumen-card resumen-info">
            <div class="resumen-icon">📝</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Justificadas</h4>
              <p class="resumen-value">{{ estadisticas.justificados }}</p>
              <p class="resumen-text">{{ estadisticas.porcentajeJustificados.toFixed(1) }}%</p>
            </div>
          </div>
        </div>

        <!-- Progreso Visual -->
        <div class="card mb-6">
          <h3 class="section-title">📊 Progreso de Asistencia</h3>
          <div class="progress-container">
            <div class="progress-bar-wrapper">
              <div
                class="progress-bar progress-presente"
                :style="{ width: `${estadisticas.porcentajePresentes}%` }"
              ></div>
              <div
                class="progress-bar progress-tardanza"
                :style="{ width: `${estadisticas.porcentajeTardanzas}%`, left: `${estadisticas.porcentajePresentes}%` }"
              ></div>
              <div
                class="progress-bar progress-justificado"
                :style="{ width: `${estadisticas.porcentajeJustificados}%`, left: `${estadisticas.porcentajePresentes + estadisticas.porcentajeTardanzas}%` }"
              ></div>
            </div>
            <div class="progress-labels">
              <span class="label-presente">Presente ({{ estadisticas.porcentajePresentes.toFixed(1) }}%)</span>
              <span class="label-tardanza">Tardanza ({{ estadisticas.porcentajeTardanzas.toFixed(1) }}%)</span>
              <span class="label-justificado">Justificado ({{ estadisticas.porcentajeJustificados.toFixed(1) }}%)</span>
              <span class="label-ausente">Ausente ({{ estadisticas.porcentajeAusentes.toFixed(1) }}%)</span>
            </div>
          </div>
        </div>

        <!-- Tabla de Asistencias -->
        <div class="card">
          <h3 class="section-title">📅 Registro de Asistencia</h3>

          <div v-if="asistenciasFiltradas.length > 0" class="asistencias-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Día</th>
                  <th>Estado</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="asistencia in paginatedAsistencias" :key="asistencia.id">
                  <td class="date-cell">{{ formatDate(asistencia.fecha) }}</td>
                  <td class="day-cell">{{ getDayName(asistencia.fecha) }}</td>
                  <td>
                    <span class="estado-badge" :class="getEstadoClass(asistencia.estado)">
                      {{ getEstadoLabel(asistencia.estado) }}
                    </span>
                  </td>
                  <td class="time-cell">{{ asistencia.hora_entrada || '-' }}</td>
                  <td class="time-cell">{{ asistencia.hora_salida || '-' }}</td>
                  <td class="observaciones-cell">
                    {{ asistencia.observaciones || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginación -->
            <div class="pagination" v-if="totalPages > 1">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                ← Anterior
              </button>
              <span class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <h3 class="empty-title">No hay registros de asistencia</h3>
            <p class="empty-text">No se encontraron registros para el período seleccionado</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()

const loading = ref(false)
const error = ref(null)
const hijos = ref([])
const selectedHijoId = ref('')
const asistencias = ref([])

const filters = ref({
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  estado: ''
})

const currentPage = ref(1)
const itemsPerPage = 15

const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

const anios = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const asistenciasFiltradas = computed(() => {
  if (!filters.value.estado) {
    return asistencias.value
  }
  return asistencias.value.filter(a => a.estado === filters.value.estado)
})

const totalPages = computed(() => {
  return Math.ceil(asistenciasFiltradas.value.length / itemsPerPage)
})

const paginatedAsistencias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return asistenciasFiltradas.value.slice(start, end)
})

const estadisticas = computed(() => {
  const total = asistencias.value.length
  if (total === 0) {
    return {
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificados: 0,
      porcentajePresentes: 0,
      porcentajeAusentes: 0,
      porcentajeTardanzas: 0,
      porcentajeJustificados: 0
    }
  }

  const presentes = asistencias.value.filter(a => a.estado === 'presente').length
  const ausentes = asistencias.value.filter(a => a.estado === 'ausente').length
  const tardanzas = asistencias.value.filter(a => a.estado === 'tardanza').length
  const justificados = asistencias.value.filter(a => a.estado === 'justificado').length

  return {
    presentes,
    ausentes,
    tardanzas,
    justificados,
    porcentajePresentes: (presentes / total) * 100,
    porcentajeAusentes: (ausentes / total) * 100,
    porcentajeTardanzas: (tardanzas / total) * 100,
    porcentajeJustificados: (justificados / total) * 100
  }
})

const loadHijos = async () => {
  try {
    const response = await api.get('/padre/hijos')
    hijos.value = response.data.data

    // Si hay hijos, seleccionar el primero por defecto
    if (hijos.value.length > 0) {
      selectedHijoId.value = hijos.value[0].id
      await cargarAsistencia()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar estudiantes'
  }
}

const cargarAsistencia = async () => {
  if (!selectedHijoId.value) {
    asistencias.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/padre/hijos/${selectedHijoId.value}/asistencias`, {
      params: {
        mes: filters.value.mes,
        anio: filters.value.anio
      }
    })

    if (response.data.success) {
      asistencias.value = response.data.data || []
    }

    currentPage.value = 1 // Reset pagination
    loading.value = false
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar asistencia'
    asistencias.value = []
    loading.value = false
  }
}

const filtrarAsistencias = () => {
  currentPage.value = 1
}

const getEstadoLabel = (estado) => {
  const labels = {
    presente: 'Presente',
    ausente: 'Ausente',
    tardanza: 'Tardanza',
    justificado: 'Justificado'
  }
  return labels[estado] || estado
}

const getEstadoClass = (estado) => {
  const classes = {
    presente: 'badge-presente',
    ausente: 'badge-ausente',
    tardanza: 'badge-tardanza',
    justificado: 'badge-justificado'
  }
  return classes[estado] || 'badge-presente'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDayName = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    weekday: 'long'
  })
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
  gap: 2rem;
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

.hijo-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selector-label {
  font-weight: 600;
  color: #374151;
}

.hijo-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  min-width: 250px;
  cursor: pointer;
  transition: all 0.2s;
}

.hijo-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Filters */
.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.filter-select {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Resumen Grid */
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.resumen-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid;
}

.resumen-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.resumen-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.resumen-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.resumen-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.resumen-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.resumen-content {
  flex: 1;
}

.resumen-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.resumen-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.resumen-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Progress Bar */
.progress-container {
  margin-bottom: 1rem;
}

.progress-bar-wrapper {
  position: relative;
  width: 100%;
  height: 2rem;
  background: #fee2e2;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  position: absolute;
  height: 100%;
  transition: width 0.5s ease, left 0.5s ease;
}

.progress-presente {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  left: 0;
}

.progress-tardanza {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.progress-justificado {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.progress-labels {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  font-weight: 600;
}

.label-presente {
  color: #059669;
}

.label-tardanza {
  color: #d97706;
}

.label-justificado {
  color: #2563eb;
}

.label-ausente {
  color: #dc2626;
}

/* Table */
.asistencias-table {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table tbody td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #111827;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.date-cell {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.day-cell {
  color: #6b7280;
  text-transform: capitalize;
}

.time-cell {
  color: #6b7280;
  white-space: nowrap;
}

.observaciones-cell {
  color: #6b7280;
  max-width: 300px;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block;
}

.badge-presente {
  background: #d1fae5;
  color: #065f46;
}

.badge-ausente {
  background: #fee2e2;
  color: #991b1b;
}

.badge-tardanza {
  background: #fef3c7;
  color: #92400e;
}

.badge-justificado {
  background: #dbeafe;
  color: #1e40af;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 600;
  color: #374151;
}

/* Loading */
.loading-spinner {
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #6b7280;
  margin: 0;
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

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hijo-selector {
    width: 100%;
  }

  .hijo-select {
    flex: 1;
    min-width: 0;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .data-table thead th,
  .data-table tbody td {
    padding: 0.5rem;
  }

  .progress-labels {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
