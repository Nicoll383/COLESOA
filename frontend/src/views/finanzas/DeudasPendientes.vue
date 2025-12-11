<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📊 Deudas Pendientes</h1>
        <p class="page-subtitle">Control de morosidad y cuotas por cobrar</p>
      </div>

      <!-- Filtros y Resumen -->
      <div class="card mb-6">
        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Estado</label>
            <select v-model="filters.estado" @change="cargarDeudas" class="filter-select">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <input
              v-model="filters.busqueda"
              @input="debounceSearch"
              type="text"
              class="filter-input"
              placeholder="DNI o nombre..."
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Grado</label>
            <select v-model="filters.grado" @change="cargarDeudas" class="filter-select">
              <option value="">Todos</option>
              <option value="1">Primero</option>
              <option value="2">Segundo</option>
              <option value="3">Tercero</option>
              <option value="4">Cuarto</option>
              <option value="5">Quinto</option>
              <option value="6">Sexto</option>
            </select>
          </div>

          <div class="filter-actions">
            <button @click="limpiarFiltros" class="btn btn-outline btn-sm">
              Limpiar
            </button>
          </div>
        </div>

        <!-- Resumen de Deudas -->
        <div class="summary-section">
          <div class="summary-card summary-warning">
            <div class="summary-icon">⏳</div>
            <div class="summary-content">
              <p class="summary-value">S/ {{ totalPendiente.toFixed(2) }}</p>
              <p class="summary-label">Total Pendiente</p>
            </div>
          </div>

          <div class="summary-card summary-danger">
            <div class="summary-icon">🔴</div>
            <div class="summary-content">
              <p class="summary-value">S/ {{ totalVencido.toFixed(2) }}</p>
              <p class="summary-label">Total Vencido</p>
            </div>
          </div>

          <div class="summary-card summary-info">
            <div class="summary-icon">👥</div>
            <div class="summary-content">
              <p class="summary-value">{{ totalEstudiantes }}</p>
              <p class="summary-label">Estudiantes con Deuda</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Deudas -->
      <div class="card">
        <h2 class="section-title">Lista de Deudas</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-600 mt-4">Cargando deudas...</p>
        </div>

        <div v-else-if="deudas.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Matrícula</th>
                <th>Monto Adeudado</th>
                <th>Estado</th>
                <th>Última Cuota</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deuda in deudas" :key="deuda.id">
                <td>
                  <div class="student-cell">
                    <p class="student-name">{{ deuda.estudiante_nombre }}</p>
                    <p class="student-dni">DNI: {{ deuda.estudiante_dni }}</p>
                  </div>
                </td>
                <td>{{ deuda.grado_nombre }} "{{ deuda.seccion_nombre }}"</td>
                <td>
                  <code class="code-badge">{{ deuda.codigo_matricula }}</code>
                </td>
                <td class="amount-cell">S/ {{ parseFloat(deuda.monto_adeudado).toFixed(2) }}</td>
                <td>
                  <span class="status-badge" :class="`status-${deuda.estado_deuda}`">
                    {{ getEstadoLabel(deuda.estado_deuda) }}
                  </span>
                </td>
                <td>
                  <span v-if="deuda.ultima_cuota" class="text-sm">
                    {{ formatDate(deuda.ultima_cuota) }}
                  </span>
                  <span v-else class="text-sm text-gray-500">-</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="verDetalles(deuda)"
                      class="btn-action btn-action-primary"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button
                      @click="registrarPago(deuda)"
                      class="btn-action btn-action-success"
                      title="Registrar pago"
                    >
                      💰
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">✅</div>
          <h3 class="empty-title">No hay deudas pendientes</h3>
          <p class="empty-text">Todos los pagos están al día</p>
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
const deudas = ref([])

const filters = ref({
  estado: '',
  busqueda: '',
  grado: ''
})

let searchTimeout = null

const totalPendiente = computed(() => {
  return deudas.value
    .filter(d => d.estado_deuda === 'pendiente')
    .reduce((sum, d) => sum + parseFloat(d.monto_adeudado || 0), 0)
})

const totalVencido = computed(() => {
  return deudas.value
    .filter(d => d.estado_deuda === 'vencido')
    .reduce((sum, d) => sum + parseFloat(d.monto_adeudado || 0), 0)
})

const totalEstudiantes = computed(() => {
  return deudas.value.length
})

const cargarDeudas = async () => {
  loading.value = true
  try {
    const response = await api.get('/payments/deudas', {
      params: filters.value
    })

    if (response.data.success) {
      deudas.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error al cargar deudas:', error)
    // Datos de ejemplo en caso de error
    deudas.value = []
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    cargarDeudas()
  }, 500)
}

const limpiarFiltros = () => {
  filters.value = {
    estado: '',
    busqueda: '',
    grado: ''
  }
  cargarDeudas()
}

const verDetalles = (deuda) => {
  router.push(`/enrollments/${deuda.matricula_id}`)
}

const registrarPago = (deuda) => {
  router.push({
    path: '/finanzas/registrar-pago',
    query: { matricula_id: deuda.matricula_id }
  })
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    vencido: 'Vencido',
    al_dia: 'Al Día'
  }
  return labels[estado] || estado
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  cargarDeudas()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.summary-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.summary-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
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
  color: #dc2626;
  white-space: nowrap;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-vencido {
  background: #fee2e2;
  color: #991b1b;
}

.status-al_dia {
  background: #d1fae5;
  color: #065f46;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #9ca3af;
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
}
</style>
