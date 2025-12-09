<template>
  <AppLayout>
    <div class="page-container">
      <h1 class="text-3xl font-bold mb-6">Aprobación de Documentos</h1>

      <!-- Filters -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Filtros</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select v-model="filters.estado" @change="cargarDocumentos" class="input w-full">
              <option value="">Todos</option>
              <option value="enviado">Enviado</option>
              <option value="en_revision">En Revisión</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Estudiante</label>
            <input
              v-model="filters.busqueda"
              @input="debounceSearch"
              type="text"
              placeholder="DNI o nombre..."
              class="input w-full"
            />
          </div>
          <div class="flex items-end">
            <button @click="limpiarFiltros" class="btn btn-outline w-full">
              Limpiar Filtros
            </button>
          </div>
          <div class="flex items-end">
            <button @click="cargarDocumentos" class="btn btn-primary w-full">
              Buscar
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Pendientes de Revisión</p>
              <p class="text-2xl font-bold text-blue-600">{{ estadisticas.pendientes }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">En Revisión</p>
              <p class="text-2xl font-bold text-yellow-600">{{ estadisticas.en_revision }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Aprobados</p>
              <p class="text-2xl font-bold text-green-600">{{ estadisticas.aceptados }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Rechazados</p>
              <p class="text-2xl font-bold text-red-600">{{ estadisticas.rechazados }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando documentos...</p>
      </div>

      <!-- Documents List -->
      <div v-else-if="documentos.length > 0" class="space-y-4">
        <div
          v-for="documento in documentos"
          :key="documento.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-lg">{{ documento.estudiante_nombre }}</h3>
                  <p class="text-sm text-gray-600">DNI: {{ documento.estudiante_dni }}</p>
                  <p class="text-xs text-gray-500 mt-1">Matrícula: {{ documento.matricula_codigo }}</p>
                </div>
                <span
                  class="badge text-xs px-3 py-1 rounded-full font-medium"
                  :class="getEstadoClass(documento.estado)"
                >
                  {{ getEstadoLabel(documento.estado) }}
                </span>
              </div>

              <!-- Document Info -->
              <div class="bg-gray-50 rounded-lg p-4 mb-3">
                <h4 class="font-medium text-sm mb-2">{{ documento.nombre_documento }}</h4>
                <p class="text-xs text-gray-600 mb-2">{{ documento.descripcion_documento }}</p>

                <div class="flex items-center gap-4 mt-3">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs text-gray-700">{{ documento.nombre_archivo }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs text-gray-600">{{ formatDate(documento.fecha_subida) }}</span>
                  </div>
                </div>
              </div>

              <!-- Observaciones (if any) -->
              <div v-if="documento.observaciones" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p class="text-xs font-medium text-yellow-800 mb-1">Observaciones anteriores:</p>
                <p class="text-xs text-yellow-700">{{ documento.observaciones }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="lg:w-80 flex flex-col gap-3">
              <!-- Preview Button -->
              <a
                :href="getFileUrl(documento.archivo_url)"
                target="_blank"
                class="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Documento
              </a>

              <!-- Mark as In Review (if enviado) -->
              <button
                v-if="documento.estado === 'enviado'"
                @click="cambiarEstado(documento, 'en_revision')"
                :disabled="processingDoc === documento.id"
                class="btn btn-secondary w-full"
              >
                <span v-if="processingDoc !== documento.id">Marcar En Revisión</span>
                <span v-else>Procesando...</span>
              </button>

              <!-- Approve/Reject Actions (if enviado or en_revision) -->
              <div v-if="documento.estado === 'enviado' || documento.estado === 'en_revision'" class="space-y-2">
                <button
                  @click="abrirModalRechazo(documento)"
                  :disabled="processingDoc === documento.id"
                  class="btn btn-danger w-full"
                >
                  Rechazar
                </button>
                <button
                  @click="aprobarDocumento(documento)"
                  :disabled="processingDoc === documento.id"
                  class="btn btn-success w-full"
                >
                  <span v-if="processingDoc !== documento.id">Aprobar</span>
                  <span v-else>Procesando...</span>
                </button>
              </div>

              <!-- Already processed -->
              <div v-else-if="documento.estado === 'aceptado'" class="text-center text-green-600 py-4">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium">Documento Aprobado</p>
                <p class="text-xs text-gray-600 mt-1">{{ formatDate(documento.fecha_revision) }}</p>
              </div>

              <div v-else-if="documento.estado === 'rechazado'" class="text-center text-red-600 py-4">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium">Documento Rechazado</p>
                <p class="text-xs text-gray-600 mt-1">{{ formatDate(documento.fecha_revision) }}</p>
              </div>

              <!-- View Timeline -->
              <button
                @click="verSeguimiento(documento)"
                class="btn btn-outline btn-sm w-full"
              >
                Ver Seguimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Documents -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No hay documentos para revisar</p>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div
      v-if="showRechazoModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showRechazoModal = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="border-b px-6 py-4">
          <h3 class="text-xl font-semibold">Rechazar Documento</h3>
        </div>

        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">
            Por favor, indique el motivo del rechazo del documento:
          </p>
          <textarea
            v-model="rechazoObservaciones"
            rows="4"
            placeholder="Ingrese las observaciones..."
            class="input w-full resize-none"
          ></textarea>
        </div>

        <div class="border-t px-6 py-4 flex gap-3">
          <button
            @click="showRechazoModal = false"
            class="btn btn-outline flex-1"
            :disabled="processingDoc !== null"
          >
            Cancelar
          </button>
          <button
            @click="rechazarDocumento"
            class="btn btn-danger flex-1"
            :disabled="!rechazoObservaciones.trim() || processingDoc !== null"
          >
            {{ processingDoc ? 'Procesando...' : 'Rechazar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Timeline Modal -->
    <div
      v-if="showTimelineModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showTimelineModal = false"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-semibold">Seguimiento del Documento</h3>
          <button @click="showTimelineModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div v-if="loadingTimeline" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>

          <div v-else-if="seguimiento.length > 0" class="space-y-4">
            <div
              v-for="(item, index) in seguimiento"
              :key="item.id"
              class="relative pl-8 pb-4"
              :class="{ 'border-l-2 border-gray-200': index < seguimiento.length - 1 }"
            >
              <div
                class="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full"
                :class="getTimelineColor(item.estado_nuevo)"
              ></div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                  <span
                    class="text-sm font-medium px-2 py-1 rounded"
                    :class="getEstadoClass(item.estado_nuevo)"
                  >
                    {{ getEstadoLabel(item.estado_nuevo) }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(item.created_at) }}
                  </span>
                </div>
                <p v-if="item.comentario" class="text-sm text-gray-700 mt-2">
                  {{ item.comentario }}
                </p>
                <p v-if="item.usuario_nombre" class="text-xs text-gray-500 mt-2">
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
import documentoService from '@/services/documento.service'
import { toast } from 'vue3-toastify'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const documentos = ref([])
const loading = ref(false)
const processingDoc = ref(null)
const filters = ref({
  estado: 'enviado',
  busqueda: ''
})

const estadisticas = ref({
  pendientes: 0,
  en_revision: 0,
  aceptados: 0,
  rechazados: 0
})

// Modal states
const showRechazoModal = ref(false)
const showTimelineModal = ref(false)
const rechazoObservaciones = ref('')
const selectedDocument = ref(null)
const seguimiento = ref([])
const loadingTimeline = ref(false)

let searchTimeout = null

// Methods
const cargarDocumentos = async () => {
  loading.value = true
  try {
    const response = await documentoService.getDocumentosPendientesRevision()
    if (response.data.success) {
      let docs = response.data.data

      // Apply filters client-side
      if (filters.value.estado) {
        docs = docs.filter(d => d.estado === filters.value.estado)
      }
      if (filters.value.busqueda) {
        const search = filters.value.busqueda.toLowerCase()
        docs = docs.filter(d =>
          d.estudiante_nombre.toLowerCase().includes(search) ||
          d.estudiante_dni.includes(search)
        )
      }

      documentos.value = docs
      calcularEstadisticas()
    }
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    toast.error('Error al cargar documentos pendientes')
  } finally {
    loading.value = false
  }
}

const calcularEstadisticas = () => {
  estadisticas.value = {
    pendientes: documentos.value.filter(d => d.estado === 'enviado').length,
    en_revision: documentos.value.filter(d => d.estado === 'en_revision').length,
    aceptados: documentos.value.filter(d => d.estado === 'aceptado').length,
    rechazados: documentos.value.filter(d => d.estado === 'rechazado').length
  }
}

const cambiarEstado = async (documento, nuevoEstado, observaciones = '') => {
  processingDoc.value = documento.id

  try {
    const response = await documentoService.cambiarEstado(
      documento.id,
      nuevoEstado,
      observaciones || null
    )

    if (response.data.success) {
      toast.success(`Documento ${nuevoEstado === 'aceptado' ? 'aprobado' : 'actualizado'} exitosamente`)
      await cargarDocumentos()
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    toast.error(error.response?.data?.message || 'Error al actualizar el documento')
  } finally {
    processingDoc.value = null
  }
}

const aprobarDocumento = (documento) => {
  cambiarEstado(documento, 'aceptado')
}

const abrirModalRechazo = (documento) => {
  selectedDocument.value = documento
  rechazoObservaciones.value = ''
  showRechazoModal.value = true
}

const rechazarDocumento = async () => {
  if (!rechazoObservaciones.value.trim()) {
    toast.error('Debe ingresar observaciones para rechazar el documento')
    return
  }

  await cambiarEstado(selectedDocument.value, 'rechazado', rechazoObservaciones.value)
  showRechazoModal.value = false
  selectedDocument.value = null
  rechazoObservaciones.value = ''
}

const verSeguimiento = async (documento) => {
  selectedDocument.value = documento
  showTimelineModal.value = true
  loadingTimeline.value = true

  try {
    const response = await documentoService.getSeguimiento(documento.id)
    if (response.data.success) {
      seguimiento.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar seguimiento:', error)
    toast.error('Error al cargar el seguimiento del documento')
  } finally {
    loadingTimeline.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    cargarDocumentos()
  }, 500)
}

const limpiarFiltros = () => {
  filters.value = {
    estado: '',
    busqueda: ''
  }
  cargarDocumentos()
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    en_revision: 'En Revisión',
    aceptado: 'Aceptado',
    rechazado: 'Rechazado'
  }
  return labels[estado] || estado
}

const getEstadoClass = (estado) => {
  const classes = {
    pendiente: 'bg-gray-200 text-gray-700',
    enviado: 'bg-blue-100 text-blue-700',
    en_revision: 'bg-yellow-100 text-yellow-700',
    aceptado: 'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const getTimelineColor = (estado) => {
  const colors = {
    pendiente: 'bg-gray-400',
    enviado: 'bg-blue-500',
    en_revision: 'bg-yellow-500',
    aceptado: 'bg-green-500',
    rechazado: 'bg-red-500'
  }
  return colors[estado] || 'bg-gray-400'
}

const getFileUrl = (url) => {
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  cargarDocumentos()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
}
</style>
