<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Documentos del Estudiante</h1>
          <p class="page-subtitle">Sube los documentos requeridos para la matrícula</p>
        </div>
      </div>

      <!-- Selector de Estudiante -->
      <div class="card mb-6" v-if="hijos.length > 0">
        <label for="estudiante-select" class="selector-label">Seleccionar Estudiante:</label>
        <select
          id="estudiante-select"
          v-model="estudianteSeleccionado"
          @change="cargarDocumentos"
          class="hijo-select"
        >
          <option :value="null">Seleccione un estudiante...</option>
          <option
            v-for="hijo in hijos"
            :key="hijo.id"
            :value="hijo.id"
          >
            {{ hijo.nombres }} {{ hijo.apellidos }} - DNI: {{ hijo.dni }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando documentos...</p>
      </div>

      <!-- No estudiante seleccionado -->
      <div v-else-if="!estudianteSeleccionado" class="card text-center py-12">
        <div class="empty-icon">👨‍👩‍👧‍👦</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Selecciona un estudiante</h3>
        <p class="text-gray-600">Por favor selecciona un estudiante para ver los documentos requeridos</p>
      </div>

      <!-- Documentos Section -->
      <div v-else-if="documentos.length > 0">
        <!-- Progress Indicator -->
        <div class="card mb-6">
          <h2 class="section-title">📊 Progreso de Documentos</h2>
          <div class="progress-container">
            <div class="progress-bar-wrapper">
              <div
                class="progress-bar"
                :style="{ width: `${progreso}%` }"
              ></div>
            </div>
            <span class="progress-text">
              {{ documentosCompletados }}/{{ documentos.length }} completados
            </span>
          </div>

          <!-- Visual Guide -->
          <div class="legend-grid">
            <div class="legend-item">
              <div class="legend-dot legend-pending"></div>
              <span>{{ documentosPendientes }} Pendientes</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot legend-enviado"></div>
              <span>{{ documentosEnviados }} Enviados</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot legend-revision"></div>
              <span>{{ documentosEnRevision }} En Revisión</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot legend-aceptado"></div>
              <span>{{ documentosAceptados }} Aceptados</span>
            </div>
            <div class="legend-item" v-if="documentosRechazados > 0">
              <div class="legend-dot legend-rechazado"></div>
              <span>{{ documentosRechazados }} Rechazados</span>
            </div>
          </div>
        </div>

        <!-- List of Documents -->
        <div class="documentos-list">
          <div
            v-for="documento in documentos"
            :key="documento.id"
            class="documento-card"
          >
            <div class="documento-content">
              <!-- Document Info -->
              <div class="documento-info">
                <div class="documento-header-row">
                  <div>
                    <h3 class="documento-nombre">{{ documento.tipo_documento }}</h3>
                    <p class="documento-desc" v-if="documento.descripcion">{{ documento.descripcion }}</p>
                    <p class="documento-formato">
                      Formatos: {{ documento.mime_type || 'PDF, JPG, PNG' }}
                    </p>
                  </div>
                  <span
                    class="estado-badge"
                    :class="getEstadoClass(documento.estado_verificacion)"
                  >
                    {{ getEstadoLabel(documento.estado_verificacion) }}
                  </span>
                </div>

                <!-- Current File Info -->
                <div v-if="documento.ruta_archivo" class="archivo-actual">
                  <div class="archivo-info-row">
                    <div class="archivo-details">
                      <svg class="archivo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="archivo-nombre">{{ documento.nombre_archivo }}</span>
                    </div>
                    <a
                      :href="getFileUrl(documento.ruta_archivo)"
                      target="_blank"
                      class="btn-ver-archivo"
                    >
                      Ver documento
                    </a>
                  </div>
                  <p class="archivo-fecha">
                    Subido el {{ formatDate(documento.created_at) }}
                  </p>
                </div>

                <!-- Observaciones (if rejected) -->
                <div v-if="documento.estado_verificacion === 'rechazado' && documento.observaciones"
                     class="observaciones-rechazado">
                  <p class="observaciones-title">Motivo del rechazo:</p>
                  <p class="observaciones-text">{{ documento.observaciones }}</p>
                </div>
              </div>

              <!-- Upload Area -->
              <div class="upload-area">
                <div
                  v-if="documento.estado_verificacion !== 'aprobado'"
                  class="upload-zone"
                  :class="{ 'upload-zone-active': uploadingDoc === documento.id }"
                  @click="$refs[`fileInput${documento.id}`][0].click()"
                  @dragover.prevent="handleDragOver($event, documento.id)"
                  @dragleave.prevent="handleDragLeave($event, documento.id)"
                  @drop.prevent="handleDrop($event, documento)"
                >
                  <input
                    :ref="`fileInput${documento.id}`"
                    type="file"
                    class="file-input-hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    @change="handleFileSelect($event, documento)"
                  />

                  <svg v-if="uploadingDoc !== documento.id" class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div v-else class="loading-spinner"></div>

                  <p class="upload-text">
                    {{ uploadingDoc === documento.id ? 'Subiendo...' : (documento.ruta_archivo ? 'Cambiar archivo' : 'Subir archivo') }}
                  </p>
                  <p class="upload-hint">
                    o arrastre aquí
                  </p>
                </div>
                <div v-else class="upload-approved">
                  <svg class="approved-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="approved-text">Documento aprobado</p>
                </div>

                <!-- View Timeline Button -->
                <button
                  v-if="documento.ruta_archivo"
                  @click="verSeguimiento(documento)"
                  class="btn-seguimiento"
                >
                  Ver seguimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No documents found -->
      <div v-else-if="estudianteSeleccionado" class="card text-center py-12">
        <div class="empty-icon">📄</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay documentos requeridos</h3>
        <p class="text-gray-600">No se encontraron documentos pendientes para este estudiante</p>
      </div>
    </div>

    <!-- Timeline Modal -->
    <div
      v-if="showTimelineModal"
      class="modal-overlay"
      @click.self="showTimelineModal = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">📜 Seguimiento del Documento</h3>
          <button @click="showTimelineModal = false" class="modal-close">&times;</button>
        </div>

        <div class="modal-body">
          <div v-if="loadingTimeline" class="text-center py-8">
            <div class="loading-spinner"></div>
          </div>

          <div v-else-if="seguimiento.length > 0" class="timeline">
            <div
              v-for="(item, index) in seguimiento"
              :key="item.id"
              class="timeline-item"
              :class="{ 'timeline-item-last': index === seguimiento.length - 1 }"
            >
              <div
                class="timeline-dot"
                :class="getTimelineColor(item.estado_nuevo)"
              ></div>
              <div class="timeline-content">
                <div class="timeline-content-header">
                  <span
                    class="timeline-badge"
                    :class="getEstadoClass(item.estado_nuevo)"
                  >
                    {{ getEstadoLabel(item.estado_nuevo) }}
                  </span>
                  <span class="timeline-date">
                    {{ formatDate(item.created_at) }}
                  </span>
                </div>
                <p v-if="item.comentario" class="timeline-comment">
                  {{ item.comentario }}
                </p>
                <p v-if="item.usuario_nombre" class="timeline-user">
                  Por: {{ item.usuario_nombre }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            No hay seguimiento disponible
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
import documentoService from '@/services/documento.service'

const router = useRouter()
const authStore = useAuthStore()

const hijos = ref([])
const estudianteSeleccionado = ref(null)
const documentos = ref([])
const loading = ref(false)
const uploadingDoc = ref(null)
const showTimelineModal = ref(false)
const seguimiento = ref([])
const loadingTimeline = ref(false)

// Computed properties for progress
const documentosCompletados = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'aprobado').length
})

const documentosPendientes = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'pendiente').length
})

const documentosEnviados = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'enviado').length
})

const documentosEnRevision = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'en_revision').length
})

const documentosAceptados = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'aprobado').length
})

const documentosRechazados = computed(() => {
  return documentos.value.filter(d => d.estado_verificacion === 'rechazado').length
})

const progreso = computed(() => {
  if (documentos.value.length === 0) return 0
  return Math.round((documentosCompletados.value / documentos.value.length) * 100)
})

// Methods
const cargarHijos = async () => {
  try {
    const response = await api.get('/padre/hijos')
    hijos.value = response.data.data

    // Si viene de un parámetro de query, seleccionar ese hijo
    const estudianteId = router.currentRoute.value.query.estudiante
    if (estudianteId && hijos.value.find(h => h.id == estudianteId)) {
      estudianteSeleccionado.value = parseInt(estudianteId)
      await cargarDocumentos()
    }
  } catch (error) {
    console.error('Error al cargar hijos:', error)
    alert('Error al cargar la lista de estudiantes')
  }
}

const cargarDocumentos = async () => {
  if (!estudianteSeleccionado.value) {
    documentos.value = []
    return
  }

  loading.value = true
  try {
    const response = await documentoService.getDocumentosEstudiante(estudianteSeleccionado.value)
    if (response.data.success) {
      documentos.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    alert('Error al cargar documentos del estudiante')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = async (event, documento) => {
  const file = event.target.files[0]
  if (file) {
    await uploadFile(file, documento)
  }
}

const handleDragOver = (event, docId) => {
  event.currentTarget.classList.add('upload-zone-dragover')
}

const handleDragLeave = (event, docId) => {
  event.currentTarget.classList.remove('upload-zone-dragover')
}

const handleDrop = async (event, documento) => {
  event.currentTarget.classList.remove('upload-zone-dragover')
  const file = event.dataTransfer.files[0]
  if (file) {
    await uploadFile(file, documento)
  }
}

const uploadFile = async (file, documento) => {
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('El archivo excede el tamaño máximo de 5MB')
    return
  }

  uploadingDoc.value = documento.id

  try {
    const response = await documentoService.subirDocumento(documento.id, file)
    if (response.data.success) {
      alert('Documento subido exitosamente. Está en revisión.')
      await cargarDocumentos() // Reload documents
    }
  } catch (error) {
    console.error('Error al subir documento:', error)
    alert(error.response?.data?.message || 'Error al subir el documento')
  } finally {
    uploadingDoc.value = null
  }
}

const verSeguimiento = async (documento) => {
  showTimelineModal.value = true
  loadingTimeline.value = true

  try {
    const response = await documentoService.getSeguimiento(documento.id)
    if (response.data.success) {
      seguimiento.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar seguimiento:', error)
    alert('Error al cargar el seguimiento del documento')
  } finally {
    loadingTimeline.value = false
  }
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    en_revision: 'En Revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado'
  }
  return labels[estado] || estado
}

const getEstadoClass = (estado) => {
  const classes = {
    pendiente: 'badge-pendiente',
    enviado: 'badge-enviado',
    en_revision: 'badge-revision',
    aprobado: 'badge-aprobado',
    rechazado: 'badge-rechazado'
  }
  return classes[estado] || 'badge-pendiente'
}

const getTimelineColor = (estado) => {
  const colors = {
    pendiente: 'timeline-gray',
    enviado: 'timeline-blue',
    en_revision: 'timeline-yellow',
    aprobado: 'timeline-green',
    rechazado: 'timeline-red'
  }
  return colors[estado] || 'timeline-gray'
}

const getFileUrl = (url) => {
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarHijos()
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

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.selector-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.hijo-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.hijo-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Progress */
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar-wrapper {
  flex: 1;
  background: #e5e7eb;
  border-radius: 9999px;
  height: 0.75rem;
  overflow: hidden;
}

.progress-bar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  height: 100%;
  transition: width 0.3s;
  border-radius: 9999px;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.legend-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.legend-pending {
  background: #9ca3af;
}

.legend-enviado {
  background: #3b82f6;
}

.legend-revision {
  background: #f59e0b;
}

.legend-aceptado {
  background: #10b981;
}

.legend-rechazado {
  background: #ef4444;
}

/* Documents List */
.documentos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.documento-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.documento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.documento-content {
  display: flex;
  gap: 2rem;
}

.documento-info {
  flex: 1;
}

.documento-header-row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.documento-nombre {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.documento-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

.documento-formato {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.25rem 0;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-pendiente {
  background: #f3f4f6;
  color: #4b5563;
}

.badge-enviado {
  background: #dbeafe;
  color: #1e40af;
}

.badge-revision {
  background: #fef3c7;
  color: #92400e;
}

.badge-aprobado {
  background: #d1fae5;
  color: #065f46;
}

.badge-rechazado {
  background: #fee2e2;
  color: #991b1b;
}

/* Archivo actual */
.archivo-actual {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.archivo-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.archivo-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.archivo-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  flex-shrink: 0;
}

.archivo-nombre {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-ver-archivo {
  font-size: 0.875rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  flex-shrink: 0;
}

.btn-ver-archivo:hover {
  text-decoration: underline;
}

.archivo-fecha {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
}

.observaciones-rechazado {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.observaciones-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.5rem 0;
}

.observaciones-text {
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0;
}

/* Upload Area */
.upload-area {
  width: 16rem;
  flex-shrink: 0;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover,
.upload-zone-dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-zone-active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.file-input-hidden {
  display: none;
}

.upload-icon {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.5rem;
  color: #9ca3af;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.5rem;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.25rem 0 0 0;
}

.upload-approved {
  text-align: center;
  padding: 1.5rem;
}

.approved-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.5rem;
  color: #10b981;
}

.approved-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #10b981;
  margin: 0;
}

.btn-seguimiento {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-seguimiento:hover {
  background: #667eea;
  color: white;
}

/* Empty state */
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
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
  width: 100%;
  max-width: 42rem;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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
  overflow-y: auto;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
  padding-bottom: 1rem;
}

.timeline-item:not(.timeline-item-last)::after {
  content: '';
  position: absolute;
  left: 0.4375rem;
  top: 1.75rem;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.timeline-gray {
  background: #9ca3af;
}

.timeline-blue {
  background: #3b82f6;
}

.timeline-yellow {
  background: #f59e0b;
}

.timeline-green {
  background: #10b981;
}

.timeline-red {
  background: #ef4444;
}

.timeline-content {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
}

.timeline-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.timeline-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.timeline-comment {
  font-size: 0.875rem;
  color: #374151;
  margin: 0.5rem 0;
}

.timeline-user {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .documento-content {
    flex-direction: column;
  }

  .upload-area {
    width: 100%;
  }

  .legend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
