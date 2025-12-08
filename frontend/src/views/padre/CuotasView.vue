<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header con selector de hijo -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Cuotas Mensuales</h1>
          <p class="page-subtitle">Gestiona los pagos de pensiones escolares</p>
        </div>
        <div class="hijo-selector">
          <label for="hijo-select" class="selector-label">Estudiante:</label>
          <select
            id="hijo-select"
            v-model="selectedHijoId"
            @change="loadCuotas"
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
        <p class="text-gray-600">Cargando cuotas...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- No hijo seleccionado -->
      <div v-else-if="!selectedHijoId" class="card text-center py-12">
        <div class="empty-icon">👨‍👩‍👧‍👦</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona un estudiante</h3>
        <p class="text-gray-600">Por favor selecciona un estudiante para ver sus cuotas</p>
      </div>

      <!-- Contenido de cuotas -->
      <div v-else-if="cuotasData">
        <!-- Resumen de Cuotas -->
        <div class="resumen-grid">
          <div class="resumen-card resumen-total">
            <div class="resumen-icon">📊</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Total Cuotas</h4>
              <p class="resumen-value">{{ resumen.total_cuotas }}</p>
              <p class="resumen-text">S/. {{ resumen.monto_total.toFixed(2) }}</p>
            </div>
          </div>

          <div class="resumen-card resumen-danger">
            <div class="resumen-icon">⚠️</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Pendientes</h4>
              <p class="resumen-value">{{ resumen.pendientes }}</p>
              <p class="resumen-text">S/. {{ resumen.monto_pendiente.toFixed(2) }}</p>
            </div>
          </div>

          <div class="resumen-card resumen-success">
            <div class="resumen-icon">✅</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Pagadas</h4>
              <p class="resumen-value">{{ resumen.pagadas }}</p>
              <p class="resumen-text">S/. {{ resumen.monto_pagado.toFixed(2) }}</p>
            </div>
          </div>

          <div v-if="resumen.vencidas > 0" class="resumen-card resumen-vencido">
            <div class="resumen-icon">🔴</div>
            <div class="resumen-content">
              <h4 class="resumen-title">Vencidas</h4>
              <p class="resumen-value">{{ resumen.vencidas }}</p>
              <p class="resumen-text">¡Requieren atención!</p>
            </div>
          </div>
        </div>

        <!-- Lista de Cuotas -->
        <div class="card mt-6">
          <h2 class="section-title">📋 Detalle de Cuotas</h2>

          <div class="cuotas-table">
            <div v-for="cuota in cuotas" :key="cuota.id" class="cuota-row" :class="{
              'cuota-pendiente': cuota.estado === 'pendiente',
              'cuota-vencida': cuota.estado === 'vencido',
              'cuota-pagada': cuota.estado === 'completado'
            }">
              <div class="cuota-info">
                <div class="cuota-header-row">
                  <h4 class="cuota-concepto">{{ cuota.concepto }}</h4>
                  <span class="cuota-badge" :class="{
                    'badge-pendiente': cuota.estado === 'pendiente',
                    'badge-vencido': cuota.estado === 'vencido',
                    'badge-pagado': cuota.estado === 'completado'
                  }">
                    {{ getEstadoLabel(cuota.estado) }}
                  </span>
                </div>

                <div class="cuota-details">
                  <span class="detail-item">
                    <strong>Código:</strong> {{ cuota.codigo_pago }}
                  </span>
                  <span class="detail-item">
                    <strong>Monto:</strong> S/. {{ parseFloat(cuota.monto).toFixed(2) }}
                  </span>
                  <span v-if="cuota.fecha_vencimiento" class="detail-item">
                    <strong>Vence:</strong> {{ formatDate(cuota.fecha_vencimiento) }}
                  </span>
                  <span v-if="cuota.fecha_pago" class="detail-item">
                    <strong>Pagado:</strong> {{ formatDate(cuota.fecha_pago) }}
                  </span>
                  <span v-if="cuota.metodo_pago && cuota.estado === 'completado'" class="detail-item">
                    <strong>Método:</strong> {{ getMetodoPagoLabel(cuota.metodo_pago) }}
                  </span>
                  <span v-if="cuota.numero_operacion" class="detail-item">
                    <strong>Operación:</strong> {{ cuota.numero_operacion }}
                  </span>
                </div>

                <div v-if="cuota.observaciones" class="cuota-observaciones">
                  <strong>Observaciones:</strong> {{ cuota.observaciones }}
                </div>
              </div>

              <div v-if="cuota.estado !== 'completado'" class="cuota-actions">
                <button
                  @click="openPagarModal(cuota)"
                  class="btn-pagar"
                  :class="{
                    'btn-pagar-urgente': cuota.estado === 'vencido'
                  }"
                >
                  <span class="btn-icon">💳</span>
                  <span>Pagar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Pago -->
      <div v-if="showPagarModal" class="modal-overlay" @click.self="closePagarModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">💳 Registrar Pago</h3>
            <button @click="closePagarModal" class="modal-close">&times;</button>
          </div>

          <div class="modal-body">
            <div v-if="selectedCuota" class="pago-info">
              <p><strong>Concepto:</strong> {{ selectedCuota.concepto }}</p>
              <p><strong>Monto:</strong> S/. {{ parseFloat(selectedCuota.monto).toFixed(2) }}</p>
            </div>

            <form @submit.prevent="procesarPago">
              <div class="form-group">
                <label for="metodo_pago">Método de Pago *</label>
                <select
                  id="metodo_pago"
                  v-model="pagoForm.metodo_pago"
                  required
                  class="form-control"
                >
                  <option value="">Seleccionar método...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="deposito">Depósito Bancario</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              <div class="form-group" v-if="requiereNumeroOperacion">
                <label for="numero_operacion">Número de Operación</label>
                <input
                  type="text"
                  id="numero_operacion"
                  v-model="pagoForm.numero_operacion"
                  placeholder="Ej: 1234567890"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="observaciones">Observaciones (opcional)</label>
                <textarea
                  id="observaciones"
                  v-model="pagoForm.observaciones"
                  rows="3"
                  placeholder="Comentarios adicionales sobre el pago..."
                  class="form-control"
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" @click="closePagarModal" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="processingPago">
                  {{ processingPago ? 'Procesando...' : 'Confirmar Pago' }}
                </button>
              </div>
            </form>
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

const loading = ref(false)
const error = ref(null)
const hijos = ref([])
const selectedHijoId = ref('')
const cuotasData = ref(null)
const showPagarModal = ref(false)
const selectedCuota = ref(null)
const processingPago = ref(false)

const pagoForm = ref({
  metodo_pago: '',
  numero_operacion: '',
  observaciones: ''
})

const cuotas = computed(() => cuotasData.value?.cuotas || [])
const resumen = computed(() => cuotasData.value?.resumen || {
  total_cuotas: 0,
  pendientes: 0,
  vencidas: 0,
  pagadas: 0,
  monto_total: 0,
  monto_pendiente: 0,
  monto_pagado: 0
})

const requiereNumeroOperacion = computed(() => {
  return ['transferencia', 'deposito', 'yape', 'plin'].includes(pagoForm.value.metodo_pago)
})

const loadHijos = async () => {
  try {
    const response = await api.get('/padre/hijos')
    hijos.value = response.data.data

    // Si viene de un parámetro de ruta, seleccionar ese hijo
    const estudianteId = router.currentRoute.value.params.estudianteId
    if (estudianteId && hijos.value.find(h => h.id == estudianteId)) {
      selectedHijoId.value = parseInt(estudianteId)
      await loadCuotas()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar estudiantes'
  }
}

const loadCuotas = async () => {
  if (!selectedHijoId.value) {
    cuotasData.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/padre/hijos/${selectedHijoId.value}/cuotas`)
    cuotasData.value = response.data.data
    loading.value = false
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar cuotas'
    loading.value = false
  }
}

const openPagarModal = (cuota) => {
  selectedCuota.value = cuota
  pagoForm.value = {
    metodo_pago: '',
    numero_operacion: '',
    observaciones: ''
  }
  showPagarModal.value = true
}

const closePagarModal = () => {
  showPagarModal.value = false
  selectedCuota.value = null
}

const procesarPago = async () => {
  if (!selectedCuota.value) return

  processingPago.value = true

  try {
    await api.post(`/padre/cuotas/${selectedCuota.value.id}/pagar`, pagoForm.value)

    // Recargar cuotas
    await loadCuotas()

    closePagarModal()

    alert('Pago registrado exitosamente')
  } catch (err) {
    alert(err.response?.data?.message || 'Error al procesar el pago')
  } finally {
    processingPago.value = false
  }
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    completado: 'Pagado',
    vencido: 'Vencido',
    anulado: 'Anulado'
  }
  return labels[estado] || estado
}

const getMetodoPagoLabel = (metodo) => {
  const labels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    deposito: 'Depósito',
    yape: 'Yape',
    plin: 'Plin'
  }
  return labels[metodo] || metodo
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

/* Resumen Grid */
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.resumen-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid;
}

.resumen-total {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-color: #6366f1;
}

.resumen-danger {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.resumen-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.resumen-vencido {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
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

/* Cuotas Table */
.cuotas-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cuota-row {
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s;
}

.cuota-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cuota-pendiente {
  background: #fef3c7;
  border-color: #f59e0b;
}

.cuota-vencida {
  background: #fee2e2;
  border-color: #ef4444;
}

.cuota-pagada {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.cuota-info {
  flex: 1;
}

.cuota-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.cuota-concepto {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.cuota-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-pendiente {
  background: #f59e0b;
  color: white;
}

.badge-vencido {
  background: #ef4444;
  color: white;
}

.badge-pagado {
  background: #10b981;
  color: white;
}

.cuota-details {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #4b5563;
}

.detail-item {
  display: flex;
  gap: 0.25rem;
}

.cuota-observaciones {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.cuota-actions {
  flex-shrink: 0;
}

.btn-pagar {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-pagar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
}

.btn-pagar-urgente {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.btn-icon {
  font-size: 1.25rem;
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
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.pago-info {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.pago-info p {
  margin: 0.5rem 0;
  color: #374151;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* Card and Section */
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

/* Empty State */
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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

  .cuota-row {
    flex-direction: column;
    align-items: stretch;
  }

  .cuota-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .cuota-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-pagar {
    width: 100%;
    justify-content: center;
  }
}
</style>
