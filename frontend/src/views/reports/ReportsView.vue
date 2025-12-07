<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Reportes y Estadísticas</h1>
          <p class="page-subtitle">Análisis y métricas del año escolar</p>
        </div>
        <div class="year-selector">
          <label>Año Escolar:</label>
          <select v-model="añoEscolar" @change="loadData" class="form-input">
            <option :value="currentYear">{{ currentYear }}</option>
            <option :value="currentYear - 1">{{ currentYear - 1 }}</option>
            <option :value="currentYear - 2">{{ currentYear - 2 }}</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="dashboardData" class="stats-grid">
        <div class="stat-card bg-gradient-blue">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <p class="stat-label">Estudiantes Matriculados</p>
            <p class="stat-value">{{ dashboardData.estudiantes }}</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-green">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <p class="stat-label">Matrículas Activas</p>
            <p class="stat-value">{{ getTotalMatriculas }}</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-purple">
          <div class="stat-icon">🏫</div>
          <div class="stat-content">
            <p class="stat-label">Vacantes Disponibles</p>
            <p class="stat-value">{{ dashboardData.vacantes?.disponibles || 0 }}</p>
            <p class="stat-meta">{{ dashboardData.vacantes?.porcentaje_ocupacion }}% ocupación</p>
          </div>
        </div>

        <div class="stat-card bg-gradient-yellow">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Ingresos del Año</p>
            <p class="stat-value">S/. {{ formatMoney(dashboardData.pagos?.ingresos) }}</p>
            <p class="stat-meta">{{ dashboardData.pagos?.total_transacciones }} transacciones</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab"
            :class="{ 'tab-active': activeTab === tab.id }"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Estudiantes Matriculados -->
          <div v-if="activeTab === 'estudiantes'" class="tab-panel">
            <h3 class="section-title">Estudiantes Matriculados por Grado y Sección</h3>
            <div v-if="loadingEstudiantes" class="loading">Cargando...</div>
            <div v-else-if="estudiantesData.length > 0">
              <div v-for="(gradoData, index) in estudiantesAgrupados" :key="index" class="grade-section">
                <h4 class="grade-name">{{ gradoData.grado }}</h4>
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Sección</th>
                        <th>Capacidad</th>
                        <th>Matriculados</th>
                        <th>Vacantes</th>
                        <th>% Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="seccion in gradoData.secciones" :key="seccion.seccion_id">
                        <td><strong>{{ seccion.seccion_nombre }}</strong></td>
                        <td>{{ seccion.capacidad }}</td>
                        <td>{{ seccion.total_matriculados }}</td>
                        <td>
                          <span
                            class="badge"
                            :class="{
                              'badge-success': seccion.vacantes_disponibles > 10,
                              'badge-warning': seccion.vacantes_disponibles > 0 && seccion.vacantes_disponibles <= 10,
                              'badge-danger': seccion.vacantes_disponibles === 0
                            }"
                          >
                            {{ seccion.vacantes_disponibles }}
                          </span>
                        </td>
                        <td>
                          <div class="progress-mini">
                            <div
                              class="progress-fill"
                              :style="{ width: `${(seccion.total_matriculados / seccion.capacidad) * 100}%` }"
                            ></div>
                          </div>
                          {{ ((seccion.total_matriculados / seccion.capacidad) * 100).toFixed(1) }}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>No hay datos disponibles</p>
            </div>
          </div>

          <!-- Vacantes Disponibles -->
          <div v-if="activeTab === 'vacantes'" class="tab-panel">
            <h3 class="section-title">Resumen de Vacantes</h3>
            <div v-if="loadingVacantes" class="loading">Cargando...</div>
            <div v-else-if="vacantesData.length > 0">
              <div class="totals-card">
                <div class="total-item">
                  <span class="total-label">Capacidad Total:</span>
                  <span class="total-value">{{ vacantesTotales.capacidad_total }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Matriculados:</span>
                  <span class="total-value">{{ vacantesTotales.matriculados_total }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Vacantes:</span>
                  <span class="total-value text-green">{{ vacantesTotales.vacantes_total }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">% Ocupación:</span>
                  <span class="total-value">{{ vacantesTotales.porcentaje_ocupacion }}%</span>
                </div>
              </div>

              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Grado</th>
                      <th>Sección</th>
                      <th>Capacidad</th>
                      <th>Matriculados</th>
                      <th>Vacantes</th>
                      <th>% Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in vacantesData" :key="`${row.grado}-${row.seccion}`">
                      <td>{{ row.grado }}</td>
                      <td><strong>{{ row.seccion }}</strong></td>
                      <td>{{ row.capacidad }}</td>
                      <td>{{ row.matriculados }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'badge-success': row.vacantes > 10,
                            'badge-warning': row.vacantes > 0 && row.vacantes <= 10,
                            'badge-danger': row.vacantes === 0
                          }"
                        >
                          {{ row.vacantes }}
                        </span>
                      </td>
                      <td>
                        <div class="progress-mini">
                          <div
                            class="progress-fill"
                            :style="{ width: `${row.porcentaje_ocupacion}%` }"
                          ></div>
                        </div>
                        {{ row.porcentaje_ocupacion }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Pagos Pendientes -->
          <div v-if="activeTab === 'pagos'" class="tab-panel">
            <h3 class="section-title">Pagos Pendientes</h3>
            <div v-if="loadingPagos" class="loading">Cargando...</div>
            <div v-else-if="pagosPendientesData.length > 0">
              <div class="totals-card alert-warning">
                <div class="total-item">
                  <span class="total-label">Total Estudiantes con Deuda:</span>
                  <span class="total-value">{{ pagosTotales.total_estudiantes }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Monto Total Pendiente:</span>
                  <span class="total-value text-red">S/. {{ formatMoney(pagosTotales.monto_total_pendiente) }}</span>
                </div>
              </div>

              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Código Matrícula</th>
                      <th>Estudiante</th>
                      <th>DNI</th>
                      <th>Grado</th>
                      <th>Monto Total</th>
                      <th>Pagado</th>
                      <th>Saldo Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in pagosPendientesData" :key="row.matricula_id">
                      <td><strong>{{ row.codigo_matricula }}</strong></td>
                      <td>{{ row.nombres }} {{ row.apellidos }}</td>
                      <td>{{ row.dni }}</td>
                      <td>{{ row.grado }} - {{ row.seccion }}</td>
                      <td>S/. {{ parseFloat(row.monto_total).toFixed(2) }}</td>
                      <td>S/. {{ parseFloat(row.monto_pagado).toFixed(2) }}</td>
                      <td class="text-red"><strong>S/. {{ parseFloat(row.saldo_pendiente).toFixed(2) }}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="empty-state-small">
              <p>✅ No hay pagos pendientes</p>
            </div>
          </div>

          <!-- Comparativas -->
          <div v-if="activeTab === 'comparativas'" class="tab-panel">
            <h3 class="section-title">Estadísticas Comparativas (Últimos 3 Años)</h3>
            <div v-if="loadingComparativas" class="loading">Cargando...</div>
            <div v-else-if="comparativasData.length > 0">
              <div class="comparativas-grid">
                <div v-for="yearData in comparativasData" :key="yearData.año" class="year-card">
                  <div class="year-header">
                    <h4>Año {{ yearData.año }}</h4>
                  </div>
                  <div class="year-stats">
                    <div class="stat-item">
                      <span class="stat-label-small">Total Matrículas</span>
                      <span class="stat-value-big">{{ yearData.matriculas.total }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label-small">Pagadas</span>
                      <span class="stat-value-small text-green">{{ yearData.matriculas.pagadas }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label-small">Pendientes</span>
                      <span class="stat-value-small text-yellow">{{ yearData.matriculas.pendientes }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label-small">Ingresos Totales</span>
                      <span class="stat-value-big text-green">S/. {{ formatMoney(yearData.ingresos) }}</span>
                    </div>
                  </div>

                  <div class="por-grado">
                    <h5>Distribución por Grado</h5>
                    <div v-for="grado in yearData.por_grado" :key="grado.grado" class="grado-bar">
                      <span class="grado-label">{{ grado.grado }}</span>
                      <div class="grado-progress">
                        <div
                          class="grado-fill"
                          :style="{ width: `${(grado.total / yearData.matriculas.total) * 100}%` }"
                        ></div>
                      </div>
                      <span class="grado-value">{{ grado.total }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import reportService from '@/services/report.service'
import AppLayout from '@/components/AppLayout.vue'

const currentYear = new Date().getFullYear()
const añoEscolar = ref(currentYear)

const activeTab = ref('estudiantes')
const tabs = [
  { id: 'estudiantes', label: 'Estudiantes Matriculados', icon: '👥' },
  { id: 'vacantes', label: 'Vacantes', icon: '🏫' },
  { id: 'pagos', label: 'Pagos Pendientes', icon: '💰' },
  { id: 'comparativas', label: 'Comparativas', icon: '📊' }
]

const dashboardData = ref(null)
const estudiantesData = ref([])
const vacantesData = ref([])
const vacantesTotales = ref({})
const pagosPendientesData = ref([])
const pagosTotales = ref({})
const comparativasData = ref([])

const loadingEstudiantes = ref(false)
const loadingVacantes = ref(false)
const loadingPagos = ref(false)
const loadingComparativas = ref(false)

const getTotalMatriculas = computed(() => {
  if (!dashboardData.value?.matriculas) return 0
  return dashboardData.value.matriculas.reduce((sum, m) => sum + m.total, 0)
})

const estudiantesAgrupados = computed(() => {
  const grouped = {}
  estudiantesData.value.forEach(item => {
    if (!grouped[item.grado_nombre]) {
      grouped[item.grado_nombre] = {
        grado: item.grado_nombre,
        secciones: []
      }
    }
    if (item.seccion_id) {
      grouped[item.grado_nombre].secciones.push(item)
    }
  })
  return Object.values(grouped)
})

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadDashboard = async () => {
  try {
    const response = await reportService.getDashboard(añoEscolar.value)
    dashboardData.value = response.data.data
  } catch (error) {
    console.error('Error:', error)
  }
}

const loadEstudiantes = async () => {
  loadingEstudiantes.value = true
  try {
    const response = await reportService.getEstudiantesMatriculados(añoEscolar.value)
    estudiantesData.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loadingEstudiantes.value = false
  }
}

const loadVacantes = async () => {
  loadingVacantes.value = true
  try {
    const response = await reportService.getVacantesDisponibles(añoEscolar.value)
    vacantesData.value = response.data.data || []
    vacantesTotales.value = response.data.totales || {}
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loadingVacantes.value = false
  }
}

const loadPagosPendientes = async () => {
  loadingPagos.value = true
  try {
    const response = await reportService.getPagosPendientes(añoEscolar.value)
    pagosPendientesData.value = response.data.data || []
    pagosTotales.value = response.data.totales || {}
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loadingPagos.value = false
  }
}

const loadComparativas = async () => {
  loadingComparativas.value = true
  try {
    const response = await reportService.getEstadisticasComparativas()
    comparativasData.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loadingComparativas.value = false
  }
}

const loadData = () => {
  loadDashboard()
  loadEstudiantes()
  loadVacantes()
  loadPagosPendientes()
  loadComparativas()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
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
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.year-selector label {
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.bg-gradient-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.bg-gradient-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  margin: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.25rem 0 0 0;
}

.stat-meta {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0.25rem 0 0 0;
}

/* Tabs */
.tabs-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  background: #f9fafb;
  color: #111827;
}

.tab-active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f5f3ff;
}

.tab-content {
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Tables */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
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

.badge-danger {
  background: #ef4444;
  color: white;
}

.progress-mini {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.grade-section {
  margin-bottom: 2rem;
}

.grade-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

/* Totals Card */
.totals-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.alert-warning {
  background: #fffbeb;
  border: 2px solid #fbbf24;
}

.total-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.text-green {
  color: #10b981;
}

.text-yellow {
  color: #f59e0b;
}

.text-red {
  color: #ef4444;
}

/* Comparativas */
.comparativas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.year-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
}

.year-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
}

.year-header h4 {
  margin: 0;
  font-size: 1.25rem;
}

.year-stats {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label-small {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value-big {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.stat-value-small {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.por-grado {
  padding: 0 1.5rem 1.5rem;
}

.por-grado h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.grado-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.grado-label {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 100px;
}

.grado-progress {
  flex: 1;
  height: 20px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.grado-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.grado-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  min-width: 30px;
  text-align: right;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state-small {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    overflow-x: auto;
  }

  .tab-content {
    padding: 1rem;
  }

  .totals-card {
    flex-direction: column;
    gap: 1rem;
  }

  .year-stats {
    grid-template-columns: 1fr;
  }
}
</style>
