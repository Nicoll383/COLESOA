<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📜 Historial de Pagos</h1>
        <p class="page-subtitle">Registro completo de todas las transacciones</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Desde</label>
            <input
              v-model="filters.fecha_desde"
              @change="cargarPagos"
              type="date"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Hasta</label>
            <input
              v-model="filters.fecha_hasta"
              @change="cargarPagos"
              type="date"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Método de Pago</label>
            <select v-model="filters.metodo_pago" @change="cargarPagos" class="filter-select">
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="deposito">Depósito Bancario</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select v-model="filters.estado" @change="cargarPagos" class="filter-select">
              <option value="">Todos</option>
              <option value="completado">Completado</option>
              <option value="pendiente">Pendiente</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <input
              v-model="filters.busqueda"
              @input="debounceSearch"
              type="text"
              class="filter-input"
              placeholder="Código o estudiante..."
            />
          </div>

          <div class="filter-actions">
            <button @click="limpiarFiltros" class="btn btn-outline btn-sm">
              Limpiar
            </button>
            <button @click="exportarExcel" class="btn btn-success btn-sm">
              📊 Exportar
            </button>
          </div>
        </div>

        <!-- Resumen de Totales -->
        <div class="summary-section">
          <div class="summary-card summary-success">
            <div class="summary-icon">✅</div>
            <div class="summary-content">
              <p class="summary-value">S/ {{ totalCompletado.toFixed(2) }}</p>
              <p class="summary-label">Total Completado</p>
            </div>
          </div>

          <div class="summary-card summary-warning">
            <div class="summary-icon">⏳</div>
            <div class="summary-content">
              <p class="summary-value">S/ {{ totalPendiente.toFixed(2) }}</p>
              <p class="summary-label">Total Pendiente</p>
            </div>
          </div>

          <div class="summary-card summary-info">
            <div class="summary-icon">📄</div>
            <div class="summary-content">
              <p class="summary-value">{{ pagos.length }}</p>
              <p class="summary-label">Total Registros</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Pagos -->
      <div class="card">
        <h2 class="section-title">Registro de Pagos</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-600 mt-4">Cargando historial...</p>
        </div>

        <div v-else-if="pagos.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Estudiante</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pago in paginatedPagos" :key="pago.id">
                <td class="text-sm">
                  {{ formatDate(pago.fecha_pago) }}
                </td>
                <td>
                  <code class="code-badge">{{ pago.codigo_pago }}</code>
                </td>
                <td>
                  <div class="student-cell">
                    <p class="student-name">{{ pago.estudiante_nombres }} {{ pago.estudiante_apellidos }}</p>
                    <p class="student-dni">{{ pago.codigo_matricula }}</p>
                  </div>
                </td>
                <td class="text-sm">{{ formatConcepto(pago.concepto, pago.tipo_pago) }}</td>
                <td class="amount-cell">S/ {{ parseFloat(pago.monto).toFixed(2) }}</td>
                <td>
                  <span class="method-badge" :class="`method-${pago.metodo_pago}`">
                    {{ getMetodoLabel(pago.metodo_pago) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="`status-${pago.estado}`">
                    {{ getEstadoLabel(pago.estado) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="verDetalle(pago)"
                      class="btn-action btn-action-primary"
                      title="Ver detalle"
                    >
                      👁️
                    </button>
                    <button
                      v-if="pago.estado === 'pendiente' && user.rol === 'finanzas'"
                      @click="aprobarPago(pago)"
                      class="btn-action btn-action-success"
                      title="Aprobar pago"
                    >
                      ✓
                    </button>
                    <button
                      v-if="pago.estado !== 'anulado' && user.rol === 'finanzas'"
                      @click="anularPago(pago)"
                      class="btn-action btn-action-danger"
                      title="Anular pago"
                    >
                      ✕
                    </button>
                  </div>
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
          <h3 class="empty-title">No hay pagos registrados</h3>
          <p class="empty-text">No se encontraron pagos con los filtros seleccionados</p>
        </div>
      </div>

      <!-- Modal de Detalle -->
      <div v-if="showDetalle" class="modal-overlay" @click="showDetalle = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Detalle del Pago</h3>
            <button @click="showDetalle = false" class="modal-close">✕</button>
          </div>

          <div class="modal-body" v-if="selectedPago">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Código de Pago:</span>
                <span class="detail-value"><code>{{ selectedPago.codigo_pago }}</code></span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">{{ formatDateTime(selectedPago.fecha_pago) }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Estudiante:</span>
                <span class="detail-value">
                  {{ selectedPago.estudiante_nombres }} {{ selectedPago.estudiante_apellidos }}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Matrícula:</span>
                <span class="detail-value"><code>{{ selectedPago.codigo_matricula }}</code></span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Tipo de Pago:</span>
                <span class="detail-value">{{ getTipoPagoLabel(selectedPago.tipo_pago) }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Concepto:</span>
                <span class="detail-value">{{ selectedPago.concepto || '-' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Monto:</span>
                <span class="detail-value amount-highlight">S/ {{ parseFloat(selectedPago.monto).toFixed(2) }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Método de Pago:</span>
                <span class="detail-value">{{ getMetodoLabel(selectedPago.metodo_pago) }}</span>
              </div>

              <div class="detail-item" v-if="selectedPago.numero_operacion">
                <span class="detail-label">Nº Operación:</span>
                <span class="detail-value"><code>{{ selectedPago.numero_operacion }}</code></span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value">
                  <span class="status-badge" :class="`status-${selectedPago.estado}`">
                    {{ getEstadoLabel(selectedPago.estado) }}
                  </span>
                </span>
              </div>

              <div class="detail-item" v-if="selectedPago.creado_por_nombre">
                <span class="detail-label">Registrado por:</span>
                <span class="detail-value">{{ selectedPago.creado_por_nombre }}</span>
              </div>

              <div class="detail-item full-width" v-if="selectedPago.observaciones">
                <span class="detail-label">Observaciones:</span>
                <span class="detail-value">{{ selectedPago.observaciones }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showDetalle = false" class="btn btn-outline">Cerrar</button>
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
import paymentService from '@/services/payment.service'

const router = useRouter()

const loading = ref(false)
const pagos = ref([])
const showDetalle = ref(false)
const selectedPago = ref(null)

const user = ref({
  rol: localStorage.getItem('userRole') || 'admin'
})

const filters = ref({
  fecha_desde: '',
  fecha_hasta: '',
  metodo_pago: '',
  estado: '',
  busqueda: ''
})

const currentPage = ref(1)
const itemsPerPage = 15

let searchTimeout = null

const totalCompletado = computed(() => {
  return pagos.value
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
})

const totalPendiente = computed(() => {
  return pagos.value
    .filter(p => p.estado === 'pendiente')
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
})

const filteredPagos = computed(() => {
  let result = pagos.value

  if (filters.value.busqueda) {
    const search = filters.value.busqueda.toLowerCase()
    result = result.filter(p =>
      p.codigo_pago?.toLowerCase().includes(search) ||
      p.estudiante_nombres?.toLowerCase().includes(search) ||
      p.estudiante_apellidos?.toLowerCase().includes(search) ||
      p.codigo_matricula?.toLowerCase().includes(search)
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredPagos.value.length / itemsPerPage)
})

const paginatedPagos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPagos.value.slice(start, end)
})

const cargarPagos = async () => {
  loading.value = true
  try {
    const response = await paymentService.getAll(filters.value)

    if (response.data.success) {
      pagos.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
    pagos.value = []
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 500)
}

const limpiarFiltros = () => {
  filters.value = {
    fecha_desde: '',
    fecha_hasta: '',
    metodo_pago: '',
    estado: '',
    busqueda: ''
  }
  currentPage.value = 1
  cargarPagos()
}

const verDetalle = (pago) => {
  selectedPago.value = pago
  showDetalle.value = true
}

const aprobarPago = async (pago) => {
  if (!confirm('¿Está seguro de aprobar este pago?')) return

  try {
    await paymentService.updateEstado(pago.id, 'completado', 'Aprobado por finanzas')
    alert('Pago aprobado exitosamente')
    cargarPagos()
  } catch (error) {
    console.error('Error al aprobar pago:', error)
    alert('Error al aprobar el pago')
  }
}

const anularPago = async (pago) => {
  const motivo = prompt('Ingrese el motivo de anulación:')
  if (!motivo) return

  try {
    await paymentService.updateEstado(pago.id, 'anulado', motivo)
    alert('Pago anulado exitosamente')
    cargarPagos()
  } catch (error) {
    console.error('Error al anular pago:', error)
    alert('Error al anular el pago')
  }
}

const exportarExcel = () => {
  // TODO: Implementar exportación a Excel
  alert('Función de exportación en desarrollo')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatConcepto = (concepto, tipoPago) => {
  if (concepto) return concepto
  return getTipoPagoLabel(tipoPago)
}

const getTipoPagoLabel = (tipo) => {
  const labels = {
    matricula: 'Matrícula',
    mensualidad: 'Mensualidad',
    otro: 'Otro'
  }
  return labels[tipo] || tipo
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

const getEstadoLabel = (estado) => {
  const labels = {
    completado: 'Completado',
    pendiente: 'Pendiente',
    anulado: 'Anulado'
  }
  return labels[estado] || estado
}

onMounted(() => {
  // Establecer fechas por defecto (último mes)
  const hoy = new Date()
  const hace30dias = new Date(hoy)
  hace30dias.setDate(hoy.getDate() - 30)

  filters.value.fecha_desde = hace30dias.toISOString().split('T')[0]
  filters.value.fecha_hasta = hoy.toISOString().split('T')[0]

  cargarPagos()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Filters Section */
.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

/* Summary Section */
.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid;
}

.summary-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.summary-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.summary-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.summary-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
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

/* Table */
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

.student-cell {
  min-width: 150px;
}

.student-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.student-dni {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.code-badge {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
  white-space: nowrap;
}

.amount-cell {
  font-weight: 700;
  color: #059669;
  white-space: nowrap;
}

.amount-highlight {
  font-size: 1.125rem;
  color: #059669;
  font-weight: 700;
}

.method-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.method-efectivo {
  background: #d1fae5;
  color: #065f46;
}

.method-tarjeta {
  background: #dbeafe;
  color: #1e40af;
}

.method-deposito,
.method-transferencia {
  background: #e0e7ff;
  color: #3730a3;
}

.method-yape,
.method-plin {
  background: #fae8ff;
  color: #86198f;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-completado {
  background: #d1fae5;
  color: #065f46;
}

.status-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-anulado {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-action-primary {
  background: #dbeafe;
}

.btn-action-primary:hover {
  background: #3b82f6;
}

.btn-action-success {
  background: #d1fae5;
}

.btn-action-success:hover {
  background: #10b981;
}

.btn-action-danger {
  background: #fee2e2;
}

.btn-action-danger:hover {
  background: #ef4444;
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

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.text-sm {
  font-size: 0.875rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .summary-section {
    grid-template-columns: 1fr;
  }

  .table-container {
    font-size: 0.75rem;
  }

  .data-table thead th,
  .data-table tbody td {
    padding: 0.5rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
