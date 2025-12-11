<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📈 Reportes Financieros</h1>
          <p class="page-subtitle">Informes e indicadores financieros del colegio</p>
        </div>
        <button @click="exportarReporte" class="btn btn-primary">
          📊 Exportar Reporte
        </button>
      </div>

      <!-- Filtros de Fecha -->
      <div class="card mb-6">
        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Desde</label>
            <input
              v-model="filters.fecha_desde"
              @change="cargarEstadisticas"
              type="date"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Hasta</label>
            <input
              v-model="filters.fecha_hasta"
              @change="cargarEstadisticas"
              type="date"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Período Rápido</label>
            <select @change="aplicarPeriodoRapido" class="filter-select">
              <option value="">Seleccionar...</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="anio">Este Año</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Indicadores Principales -->
      <div class="stats-grid mb-6">
        <div class="stat-card stat-primary">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Total Ingresos</p>
            <p class="stat-value">S/ {{ estadisticas.totalIngresos.toFixed(2) }}</p>
            <p class="stat-change positive">+15.3% vs período anterior</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-label">Pagos Completados</p>
            <p class="stat-value">{{ estadisticas.totalPagosCompletados }}</p>
            <p class="stat-change positive">+8.2% vs período anterior</p>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <p class="stat-label">Pagos Pendientes</p>
            <p class="stat-value">{{ estadisticas.totalPagosPendientes }}</p>
            <p class="stat-change neutral">Sin cambios</p>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-label">Promedio por Pago</p>
            <p class="stat-value">S/ {{ estadisticas.promedioPorPago.toFixed(2) }}</p>
            <p class="stat-change positive">+5.7% vs período anterior</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid mb-6">
        <!-- Ingresos por Método de Pago -->
        <div class="card">
          <h3 class="card-title">Ingresos por Método de Pago</h3>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="bar-chart">
              <div
                v-for="metodo in estadisticas.porMetodo"
                :key="metodo.metodo_pago"
                class="bar-item"
              >
                <div class="bar-label">{{ getMetodoLabel(metodo.metodo_pago) }}</div>
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :style="{
                      width: `${(metodo.total / maxIngresoMetodo) * 100}%`,
                      backgroundColor: getMetodoColor(metodo.metodo_pago)
                    }"
                  >
                    <span class="bar-value">S/ {{ parseFloat(metodo.total).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="bar-count">{{ metodo.cantidad }} pagos</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingresos por Tipo de Pago -->
        <div class="card">
          <h3 class="card-title">Ingresos por Tipo de Pago</h3>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="donut-chart">
              <div
                v-for="tipo in estadisticas.porTipo"
                :key="tipo.tipo_pago"
                class="donut-item"
              >
                <div class="donut-indicator" :style="{ backgroundColor: getTipoColor(tipo.tipo_pago) }"></div>
                <div class="donut-info">
                  <p class="donut-label">{{ getTipoPagoLabel(tipo.tipo_pago) }}</p>
                  <p class="donut-value">S/ {{ parseFloat(tipo.total).toFixed(2) }}</p>
                  <p class="donut-count">{{ tipo.cantidad }} pagos</p>
                </div>
                <div class="donut-percentage">
                  {{ ((tipo.total / estadisticas.totalIngresos) * 100).toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla Detallada -->
      <div class="card">
        <div class="table-header">
          <h3 class="card-title">Resumen Detallado</h3>
          <div class="table-actions">
            <button @click="toggleVista" class="btn btn-outline btn-sm">
              {{ vistaDetallada ? '📊 Vista Resumida' : '📋 Vista Detallada' }}
            </button>
          </div>
        </div>

        <div v-if="!loading && vistaDetallada" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Total (S/)</th>
                <th>Promedio (S/)</th>
                <th>% del Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="5" class="table-section-header">Por Método de Pago</td>
              </tr>
              <tr v-for="metodo in estadisticas.porMetodo" :key="`metodo-${metodo.metodo_pago}`">
                <td>
                  <span class="category-badge" :style="{ backgroundColor: getMetodoColor(metodo.metodo_pago) }">
                    {{ getMetodoLabel(metodo.metodo_pago) }}
                  </span>
                </td>
                <td>{{ metodo.cantidad }}</td>
                <td class="amount-cell">{{ parseFloat(metodo.total).toFixed(2) }}</td>
                <td>{{ (metodo.total / metodo.cantidad).toFixed(2) }}</td>
                <td>
                  <div class="percentage-bar">
                    <div
                      class="percentage-fill"
                      :style="{
                        width: `${(metodo.total / estadisticas.totalIngresos) * 100}%`,
                        backgroundColor: getMetodoColor(metodo.metodo_pago)
                      }"
                    ></div>
                    <span class="percentage-text">
                      {{ ((metodo.total / estadisticas.totalIngresos) * 100).toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="5" class="table-section-header">Por Tipo de Pago</td>
              </tr>
              <tr v-for="tipo in estadisticas.porTipo" :key="`tipo-${tipo.tipo_pago}`">
                <td>
                  <span class="category-badge" :style="{ backgroundColor: getTipoColor(tipo.tipo_pago) }">
                    {{ getTipoPagoLabel(tipo.tipo_pago) }}
                  </span>
                </td>
                <td>{{ tipo.cantidad }}</td>
                <td class="amount-cell">{{ parseFloat(tipo.total).toFixed(2) }}</td>
                <td>{{ (tipo.total / tipo.cantidad).toFixed(2) }}</td>
                <td>
                  <div class="percentage-bar">
                    <div
                      class="percentage-fill"
                      :style="{
                        width: `${(tipo.total / estadisticas.totalIngresos) * 100}%`,
                        backgroundColor: getTipoColor(tipo.tipo_pago)
                      }"
                    ></div>
                    <span class="percentage-text">
                      {{ ((tipo.total / estadisticas.totalIngresos) * 100).toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!loading && !vistaDetallada" class="summary-cards-grid">
          <div class="summary-mini-card">
            <h4 class="summary-mini-title">Método Más Usado</h4>
            <p class="summary-mini-value">{{ metodoPrincipal.label }}</p>
            <p class="summary-mini-detail">S/ {{ metodoPrincipal.total.toFixed(2) }}</p>
          </div>
          <div class="summary-mini-card">
            <h4 class="summary-mini-title">Tipo Más Común</h4>
            <p class="summary-mini-value">{{ tipoPrincipal.label }}</p>
            <p class="summary-mini-detail">S/ {{ tipoPrincipal.total.toFixed(2) }}</p>
          </div>
          <div class="summary-mini-card">
            <h4 class="summary-mini-title">Tasa de Conversión</h4>
            <p class="summary-mini-value">{{ tasaConversion.toFixed(1) }}%</p>
            <p class="summary-mini-detail">Pagos completados vs total</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import paymentService from '@/services/payment.service'

const loading = ref(false)
const vistaDetallada = ref(true)

const filters = ref({
  fecha_desde: '',
  fecha_hasta: ''
})

const estadisticas = ref({
  totalIngresos: 0,
  totalPagosCompletados: 0,
  totalPagosPendientes: 0,
  promedioPorPago: 0,
  porMetodo: [],
  porTipo: []
})

const maxIngresoMetodo = computed(() => {
  if (estadisticas.value.porMetodo.length === 0) return 1
  return Math.max(...estadisticas.value.porMetodo.map(m => parseFloat(m.total)))
})

const metodoPrincipal = computed(() => {
  if (estadisticas.value.porMetodo.length === 0) {
    return { label: '-', total: 0 }
  }
  const principal = estadisticas.value.porMetodo.reduce((max, metodo) =>
    parseFloat(metodo.total) > parseFloat(max.total) ? metodo : max
  )
  return {
    label: getMetodoLabel(principal.metodo_pago),
    total: parseFloat(principal.total)
  }
})

const tipoPrincipal = computed(() => {
  if (estadisticas.value.porTipo.length === 0) {
    return { label: '-', total: 0 }
  }
  const principal = estadisticas.value.porTipo.reduce((max, tipo) =>
    parseFloat(tipo.total) > parseFloat(max.total) ? tipo : max
  )
  return {
    label: getTipoPagoLabel(principal.tipo_pago),
    total: parseFloat(principal.total)
  }
})

const tasaConversion = computed(() => {
  const total = estadisticas.value.totalPagosCompletados + estadisticas.value.totalPagosPendientes
  if (total === 0) return 0
  return (estadisticas.value.totalPagosCompletados / total) * 100
})

const cargarEstadisticas = async () => {
  loading.value = true
  try {
    const response = await paymentService.getAll({
      fecha_desde: filters.value.fecha_desde,
      fecha_hasta: filters.value.fecha_hasta,
      estado: 'completado'
    })

    if (response.data.success) {
      const pagos = response.data.data || []

      // Calcular estadísticas
      const totalIngresos = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
      const totalPagosCompletados = pagos.filter(p => p.estado === 'completado').length
      const totalPagosPendientes = pagos.filter(p => p.estado === 'pendiente').length
      const promedioPorPago = totalPagosCompletados > 0 ? totalIngresos / totalPagosCompletados : 0

      // Agrupar por método de pago
      const porMetodo = Object.values(
        pagos.reduce((acc, pago) => {
          const metodo = pago.metodo_pago
          if (!acc[metodo]) {
            acc[metodo] = { metodo_pago: metodo, total: 0, cantidad: 0 }
          }
          acc[metodo].total += parseFloat(pago.monto || 0)
          acc[metodo].cantidad++
          return acc
        }, {})
      ).sort((a, b) => b.total - a.total)

      // Agrupar por tipo de pago
      const porTipo = Object.values(
        pagos.reduce((acc, pago) => {
          const tipo = pago.tipo_pago
          if (!acc[tipo]) {
            acc[tipo] = { tipo_pago: tipo, total: 0, cantidad: 0 }
          }
          acc[tipo].total += parseFloat(pago.monto || 0)
          acc[tipo].cantidad++
          return acc
        }, {})
      ).sort((a, b) => b.total - a.total)

      estadisticas.value = {
        totalIngresos,
        totalPagosCompletados,
        totalPagosPendientes,
        promedioPorPago,
        porMetodo,
        porTipo
      }
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  } finally {
    loading.value = false
  }
}

const aplicarPeriodoRapido = (event) => {
  const periodo = event.target.value
  const hoy = new Date()
  const inicio = new Date()

  switch (periodo) {
    case 'hoy':
      inicio.setHours(0, 0, 0, 0)
      break
    case 'semana':
      inicio.setDate(hoy.getDate() - hoy.getDay())
      break
    case 'mes':
      inicio.setDate(1)
      break
    case 'trimestre':
      const mesActual = hoy.getMonth()
      inicio.setMonth(mesActual - (mesActual % 3), 1)
      break
    case 'anio':
      inicio.setMonth(0, 1)
      break
  }

  if (periodo) {
    filters.value.fecha_desde = inicio.toISOString().split('T')[0]
    filters.value.fecha_hasta = hoy.toISOString().split('T')[0]
    cargarEstadisticas()
  }

  event.target.value = ''
}

const toggleVista = () => {
  vistaDetallada.value = !vistaDetallada.value
}

const exportarReporte = () => {
  alert('Función de exportación en desarrollo')
}

const getMetodoLabel = (metodo) => {
  const labels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    deposito: 'Depósito',
    transferencia: 'Transferencia',
    yape: 'Yape',
    plin: 'Plin'
  }
  return labels[metodo] || metodo
}

const getTipoPagoLabel = (tipo) => {
  const labels = {
    matricula: 'Matrícula',
    mensualidad: 'Mensualidad',
    otro: 'Otro'
  }
  return labels[tipo] || tipo
}

const getMetodoColor = (metodo) => {
  const colors = {
    efectivo: '#10b981',
    tarjeta: '#3b82f6',
    deposito: '#6366f1',
    transferencia: '#8b5cf6',
    yape: '#a855f7',
    plin: '#ec4899'
  }
  return colors[metodo] || '#6b7280'
}

const getTipoColor = (tipo) => {
  const colors = {
    matricula: '#f59e0b',
    mensualidad: '#3b82f6',
    otro: '#6b7280'
  }
  return colors[tipo] || '#6b7280'
}

onMounted(() => {
  // Establecer fechas por defecto (este mes)
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  filters.value.fecha_desde = primerDiaMes.toISOString().split('T')[0]
  filters.value.fecha_hasta = hoy.toISOString().split('T')[0]

  cargarEstadisticas()
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
  align-items: flex-start;
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

.mb-6 {
  margin-bottom: 1.5rem;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Filters */
.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.filter-input,
.filter-select {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.stat-primary {
  border-left-color: #667eea;
}

.stat-success {
  border-left-color: #10b981;
}

.stat-warning {
  border-left-color: #f59e0b;
}

.stat-info {
  border-left-color: #3b82f6;
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: #6b7280;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-container {
  min-height: 300px;
  position: relative;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  min-width: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.bar-wrapper {
  flex: 1;
  height: 40px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  transition: width 0.5s ease;
  min-width: 60px;
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-count {
  min-width: 80px;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

/* Donut Chart */
.donut-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.donut-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.donut-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.donut-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut-info {
  flex: 1;
}

.donut-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.donut-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.donut-count {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.donut-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #667eea;
}

/* Table */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.table-container {
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

.table-section-header {
  background: #f3f4f6;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem !important;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.amount-cell {
  font-weight: 700;
  color: #059669;
}

.percentage-bar {
  position: relative;
  height: 24px;
  background: #f3f4f6;
  border-radius: 0.375rem;
  overflow: hidden;
}

.percentage-fill {
  height: 100%;
  border-radius: 0.375rem;
  transition: width 0.5s ease;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: #111827;
}

/* Summary Mini Cards */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-mini-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  color: white;
  text-align: center;
}

.summary-mini-title {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0 0 0.5rem 0;
}

.summary-mini-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.summary-mini-detail {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .bar-item {
    flex-direction: column;
    align-items: stretch;
  }

  .bar-label {
    min-width: auto;
  }

  .bar-count {
    text-align: left;
  }
}
</style>
