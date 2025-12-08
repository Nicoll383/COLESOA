<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Detalle de Matrícula</h1>
          <p v-if="enrollment" class="page-subtitle">{{ enrollment.codigo_matricula }}</p>
        </div>
        <button @click="goBack" class="btn btn-outline">
          ← Volver
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando información...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card text-center py-8 bg-red-50">
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadEnrollment" class="btn btn-primary mt-4">Reintentar</button>
      </div>

      <!-- Enrollment Details -->
      <div v-else-if="enrollment" class="details-container">
        <!-- Status Banner -->
        <div class="status-banner" :class="`status-${enrollment.estado}`">
          <div class="status-icon">
            <span v-if="enrollment.estado === 'pendiente'">⏳</span>
            <span v-else-if="enrollment.estado === 'confirmada'">✓</span>
            <span v-else-if="enrollment.estado === 'pagada'">✓✓</span>
            <span v-else-if="enrollment.estado === 'cancelada'">⊗</span>
            <span v-else-if="enrollment.estado === 'anulada'">✗</span>
          </div>
          <div>
            <h3 class="status-title">Estado: {{ getEstadoLabel(enrollment.estado) }}</h3>
            <p class="status-subtitle">
              Matrícula creada el {{ formatDateTime(enrollment.created_at) }}
            </p>
          </div>
          <div class="status-actions">
            <button
              v-if="enrollment.estado === 'pendiente' && canUpdateEstado"
              @click="showEstadoModal = true"
              class="btn btn-sm btn-white"
            >
              Actualizar Estado
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            v-if="enrollment.estado === 'pendiente' && canUpdateEstado"
            @click="confirmarMatricula"
            :disabled="confirmando"
            class="action-btn action-btn-warning"
          >
            <span class="action-icon">✓</span>
            <div class="action-content">
              <span class="action-title">
                {{ confirmando ? 'Confirmando...' : 'Confirmar Matrícula' }}
              </span>
              <span class="action-subtitle">Inicializar documentos y enviar credenciales</span>
            </div>
          </button>
          <button @click="downloadContrato" :disabled="downloadingContrato" class="action-btn action-btn-primary">
            <span class="action-icon">📄</span>
            <div class="action-content">
              <span class="action-title">
                {{ downloadingContrato ? 'Descargando...' : 'Descargar Contrato' }}
              </span>
              <span class="action-subtitle">Documento oficial de matrícula</span>
            </div>
          </button>
          <button @click="downloadComprobante" :disabled="downloadingComprobante" class="action-btn action-btn-success">
            <span class="action-icon">🧾</span>
            <div class="action-content">
              <span class="action-title">
                {{ downloadingComprobante ? 'Descargando...' : 'Descargar Comprobante' }}
              </span>
              <span class="action-subtitle">Comprobante de pago</span>
            </div>
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Información del Estudiante -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">👤</span>
                Información del Estudiante
              </h3>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Código Estudiante</span>
                  <span class="info-value">{{ enrollment.estudiante_codigo }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Nombres</span>
                  <span class="info-value">{{ enrollment.estudiante_nombres }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Apellidos</span>
                  <span class="info-value">{{ enrollment.estudiante_apellidos }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">DNI</span>
                  <span class="info-value">{{ enrollment.estudiante_dni }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Académica -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">📚</span>
                Información Académica
              </h3>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Año Escolar</span>
                  <span class="info-value">{{ enrollment.año_escolar }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Grado</span>
                  <span class="info-value">{{ enrollment.grado_nombre }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sección</span>
                  <span class="info-value">{{ enrollment.seccion_nombre }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Aula</span>
                  <span class="info-value">{{ enrollment.seccion_aula || 'No asignada' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Financiera -->
          <div class="info-card highlight-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">💰</span>
                Información Financiera
              </h3>
            </div>
            <div class="card-body">
              <div class="financial-summary">
                <div class="financial-row">
                  <span class="financial-label">Monto de Matrícula</span>
                  <span class="financial-value">S/. {{ parseFloat(enrollment.monto_total).toFixed(2) }}</span>
                </div>
                <div class="financial-row">
                  <span class="financial-label">Estado de Pago</span>
                  <span
                    class="payment-badge"
                    :class="{
                      'badge-success': enrollment.estado === 'pagada',
                      'badge-warning': enrollment.estado === 'pendiente',
                      'badge-secondary': ['cancelada', 'anulada'].includes(enrollment.estado)
                    }"
                  >
                    {{ getEstadoLabel(enrollment.estado) }}
                  </span>
                </div>
                <div v-if="enrollment.fecha_pago" class="financial-row">
                  <span class="financial-label">Fecha de Pago</span>
                  <span class="financial-value">{{ formatDate(enrollment.fecha_pago) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">ℹ️</span>
                Información Adicional
              </h3>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Fecha de Creación</span>
                  <span class="info-value">{{ formatDateTime(enrollment.created_at) }}</span>
                </div>
                <div class="info-item" v-if="enrollment.updated_at">
                  <span class="info-label">Última Actualización</span>
                  <span class="info-value">{{ formatDateTime(enrollment.updated_at) }}</span>
                </div>
                <div class="info-item" v-if="enrollment.observaciones">
                  <span class="info-label">Observaciones</span>
                  <span class="info-value">{{ enrollment.observaciones }}</span>
                </div>
                <div class="info-item" v-if="enrollment.estado === 'anulada' && enrollment.motivo_anulacion">
                  <span class="info-label">Motivo de Anulación</span>
                  <span class="info-value text-red-600">{{ enrollment.motivo_anulacion }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de actualizar estado -->
      <div v-if="showEstadoModal" class="modal-overlay" @click="showEstadoModal = false">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Actualizar Estado de Matrícula</h3>
          <div class="form-group">
            <label class="form-label">Nuevo Estado</label>
            <select v-model="nuevoEstado" class="form-input">
              <option value="">Seleccione...</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Observaciones (opcional)</label>
            <textarea
              v-model="observaciones"
              class="form-input"
              rows="3"
              placeholder="Ingrese observaciones adicionales..."
            ></textarea>
          </div>
          <div v-if="updateError" class="alert alert-error">
            {{ updateError }}
          </div>
          <div class="modal-actions">
            <button @click="showEstadoModal = false" class="btn btn-outline">
              Cancelar
            </button>
            <button
              @click="updateEstado"
              :disabled="!nuevoEstado || updating"
              class="btn btn-primary"
            >
              {{ updating ? 'Actualizando...' : 'Actualizar Estado' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import enrollmentService from '@/services/enrollment.service'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const canUpdateEstado = computed(() => ['administrador', 'secretaria'].includes(user.value?.rol))

const enrollment = ref(null)
const loading = ref(false)
const error = ref(null)

const downloadingContrato = ref(false)
const downloadingComprobante = ref(false)
const confirmando = ref(false)

const showEstadoModal = ref(false)
const nuevoEstado = ref('')
const observaciones = ref('')
const updating = ref(false)
const updateError = ref(null)

const loadEnrollment = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await enrollmentService.getById(route.params.id)
    enrollment.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar matrícula'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const downloadContrato = async () => {
  downloadingContrato.value = true
  try {
    const response = await enrollmentService.descargarContrato(route.params.id)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Contrato_${enrollment.value.codigo_matricula}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al descargar contrato:', err)
    alert('Error al descargar el contrato')
  } finally {
    downloadingContrato.value = false
  }
}

const downloadComprobante = async () => {
  downloadingComprobante.value = true
  try {
    const response = await enrollmentService.descargarComprobante(route.params.id)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Comprobante_${enrollment.value.codigo_matricula}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al descargar comprobante:', err)
    alert('Error al descargar el comprobante')
  } finally {
    downloadingComprobante.value = false
  }
}

const confirmarMatricula = async () => {
  if (!confirm('¿Está seguro de confirmar esta matrícula? Esto inicializará los documentos requeridos y enviará las credenciales de acceso al apoderado.')) {
    return
  }

  confirmando.value = true
  try {
    const response = await enrollmentService.confirmar(route.params.id)
    alert(response.data.message || 'Matrícula confirmada exitosamente')
    await loadEnrollment()
  } catch (err) {
    console.error('Error al confirmar matrícula:', err)
    alert(err.response?.data?.message || 'Error al confirmar matrícula')
  } finally {
    confirmando.value = false
  }
}

const updateEstado = async () => {
  updating.value = true
  updateError.value = null
  try {
    await enrollmentService.updateEstado(route.params.id, nuevoEstado.value, observaciones.value)
    showEstadoModal.value = false
    nuevoEstado.value = ''
    observaciones.value = ''
    await loadEnrollment()
  } catch (err) {
    updateError.value = err.response?.data?.message || 'Error al actualizar estado'
    console.error('Error:', err)
  } finally {
    updating.value = false
  }
}

const goBack = () => {
  router.push('/enrollments')
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente de Pago',
    confirmada: 'Confirmada',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
    anulada: 'Anulada'
  }
  return labels[estado] || estado
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (datetime) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadEnrollment()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
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
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

/* Status Banner */
.status-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.status-pendiente {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
}

.status-confirmada {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  border: 2px solid #3b82f6;
}

.status-pagada {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.status-cancelada,
.status-anulada {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #9ca3af;
}

.status-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.status-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.status-actions {
  margin-left: auto;
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.action-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-subtitle {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Content Grid */
.content-grid {
  display: grid;
  gap: 1.5rem;
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.highlight-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.highlight-card .card-header {
  background: rgba(255, 255, 255, 0.5);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  font-size: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
}

/* Financial Summary */
.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.financial-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.financial-row:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.financial-label {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.financial-value {
  font-size: 1.25rem;
  color: #111827;
  font-weight: 700;
}

.payment-badge {
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

.badge-secondary {
  background: #6b7280;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-white {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-white:hover:not(:disabled) {
  background: #f9fafb;
}

/* Utilities */
.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #6b7280;
}

.text-red-600 {
  color: #dc2626;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mt-4 {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .status-banner {
    flex-direction: column;
    text-align: center;
  }

  .status-actions {
    margin-left: 0;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
