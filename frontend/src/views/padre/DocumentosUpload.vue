<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <h2 class="font-semibold text-gray-900">Portal de Padres - Documentos</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.nombre }} {{ user?.apellido }}</span>
          <button @click="handleBack" class="btn btn-outline">Volver</button>
          <button @click="handleLogout" class="btn btn-outline">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <!-- Selector de Hijo -->
      <div class="card mb-6" v-if="estudiantes.length > 0">
        <h2 class="text-xl font-semibold mb-4">Seleccionar Estudiante</h2>
        <select
          v-model="estudianteSeleccionado"
          @change="cargarDocumentos"
          class="input w-full md:w-1/2"
        >
          <option :value="null">Seleccione un estudiante...</option>
          <option
            v-for="estudiante in estudiantes"
            :key="estudiante.id"
            :value="estudiante.id"
          >
            {{ estudiante.nombre }} {{ estudiante.apellido }} - DNI: {{ estudiante.dni }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando documentos...</p>
      </div>

      <!-- Documentos Section -->
      <div v-else-if="estudianteSeleccionado && documentos.length > 0">
        <!-- Progress Indicator -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">Progreso de Documentos</h2>
          <div class="flex items-center gap-4 mb-4">
            <div class="flex-1">
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-green-500 h-3 rounded-full transition-all duration-300"
                  :style="{ width: `${progreso}%` }"
                ></div>
              </div>
            </div>
            <span class="text-sm font-medium text-gray-700">
              {{ documentosCompletados }}/{{ documentos.length }} completados
            </span>
          </div>

          <!-- Visual Guide -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-blue-500 rounded"></div>
              <span class="text-sm">{{ documentosEnviados }} Documentos enviados</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-yellow-500 rounded"></div>
              <span class="text-sm">{{ documentosEnRevision }} Documentos en revisión</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-green-500 rounded"></div>
              <span class="text-sm">{{ documentosAceptados }} Documentos aceptados</span>
            </div>
          </div>
        </div>

        <!-- List of Documents -->
        <div class="space-y-4">
          <div
            v-for="documento in documentos"
            :key="documento.id"
            class="card"
          >
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <!-- Document Info -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="font-semibold text-lg">{{ documento.nombre }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ documento.descripcion }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      Formatos permitidos: {{ documento.tipo_archivo }}
                    </p>
                  </div>
                  <span
                    class="badge text-xs px-3 py-1 rounded-full font-medium"
                    :class="getEstadoClass(documento.estado)"
                  >
                    {{ getEstadoLabel(documento.estado) }}
                  </span>
                </div>

                <!-- Current File Info -->
                <div v-if="documento.archivo_url" class="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium">{{ documento.nombre_archivo }}</span>
                    </div>
                    <a
                      :href="getFileUrl(documento.archivo_url)"
                      target="_blank"
                      class="text-sm text-primary hover:underline"
                    >
                      Ver documento
                    </a>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Subido el {{ formatDate(documento.fecha_subida) }}
                  </p>
                </div>

                <!-- Observaciones (if rejected) -->
                <div v-if="documento.estado === 'rechazado' && documento.observaciones"
                     class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm font-medium text-red-800">Motivo del rechazo:</p>
                  <p class="text-sm text-red-700 mt-1">{{ documento.observaciones }}</p>
                </div>
              </div>

              <!-- Upload Area -->
              <div class="md:w-64">
                <div
                  v-if="documento.estado !== 'aceptado'"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                  :class="{ 'border-primary bg-primary/5': uploadingDoc === documento.id }"
                  @click="$refs[`fileInput${documento.id}`][0].click()"
                  @dragover.prevent="handleDragOver($event, documento.id)"
                  @dragleave.prevent="handleDragLeave($event, documento.id)"
                  @drop.prevent="handleDrop($event, documento)"
                >
                  <input
                    :ref="`fileInput${documento.id}`"
                    type="file"
                    class="hidden"
                    :accept="getAcceptTypes(documento.tipo_archivo)"
                    @change="handleFileSelect($event, documento)"
                  />

                  <svg v-if="uploadingDoc !== documento.id" class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>

                  <p class="text-sm font-medium text-gray-700">
                    {{ uploadingDoc === documento.id ? 'Subiendo...' : (documento.archivo_url ? 'Cambiar archivo' : 'Subir archivo') }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    o arrastre aquí
                  </p>
                </div>
                <div v-else class="text-center text-green-600 py-4">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium">Documento aprobado</p>
                </div>

                <!-- View Timeline Button -->
                <button
                  v-if="documento.archivo_url"
                  @click="verSeguimiento(documento)"
                  class="btn btn-outline btn-sm w-full mt-2"
                >
                  Ver seguimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Student Selected -->
      <div v-else-if="!estudianteSeleccionado" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">Seleccione un estudiante para ver los documentos requeridos</p>
      </div>
    </main>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import documentoService from '@/services/documento.service'
import { toast } from 'vue3-toastify'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const estudiantes = ref([])
const estudianteSeleccionado = ref(null)
const documentos = ref([])
const loading = ref(false)
const uploadingDoc = ref(null)
const showTimelineModal = ref(false)
const seguimiento = ref([])
const loadingTimeline = ref(false)
const currentDocument = ref(null)

// Computed properties for progress
const documentosCompletados = computed(() => {
  return documentos.value.filter(d => d.estado === 'aceptado').length
})

const documentosEnviados = computed(() => {
  return documentos.value.filter(d => d.estado === 'enviado').length
})

const documentosEnRevision = computed(() => {
  return documentos.value.filter(d => d.estado === 'en_revision').length
})

const documentosAceptados = computed(() => {
  return documentos.value.filter(d => d.estado === 'aceptado').length
})

const progreso = computed(() => {
  if (documentos.value.length === 0) return 0
  return Math.round((documentosCompletados.value / documentos.value.length) * 100)
})

// Methods
const cargarEstudiantes = async () => {
  try {
    // TODO: Implementar API para obtener hijos del padre actual
    // Por ahora, usaremos un mock. En producción, esto debería venir de una API
    // que retorne los hijos asociados al padre logueado
    estudiantes.value = []
    toast.info('Debe implementar el endpoint para obtener los estudiantes del padre')
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
    toast.error('Error al cargar la lista de estudiantes')
  }
}

const cargarDocumentos = async () => {
  if (!estudianteSeleccionado.value) return

  loading.value = true
  try {
    const response = await documentoService.getDocumentosEstudiante(estudianteSeleccionado.value)
    if (response.data.success) {
      documentos.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    toast.error('Error al cargar documentos del estudiante')
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
  event.currentTarget.classList.add('border-primary', 'bg-primary/5')
}

const handleDragLeave = (event, docId) => {
  event.currentTarget.classList.remove('border-primary', 'bg-primary/5')
}

const handleDrop = async (event, documento) => {
  event.currentTarget.classList.remove('border-primary', 'bg-primary/5')
  const file = event.dataTransfer.files[0]
  if (file) {
    await uploadFile(file, documento)
  }
}

const uploadFile = async (file, documento) => {
  // Validate file type
  const allowedTypes = documento.tipo_archivo.split(',').map(t => t.trim().toLowerCase())
  const fileExtension = file.name.split('.').pop().toLowerCase()

  if (!allowedTypes.includes(fileExtension)) {
    toast.error(`Tipo de archivo no permitido. Solo se permiten: ${documento.tipo_archivo}`)
    return
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('El archivo excede el tamaño máximo de 5MB')
    return
  }

  uploadingDoc.value = documento.id

  try {
    const response = await documentoService.subirDocumento(documento.id, file)
    if (response.data.success) {
      toast.success('Documento subido exitosamente. Está en revisión.')
      await cargarDocumentos() // Reload documents
    }
  } catch (error) {
    console.error('Error al subir documento:', error)
    toast.error(error.response?.data?.message || 'Error al subir el documento')
  } finally {
    uploadingDoc.value = null
  }
}

const verSeguimiento = async (documento) => {
  currentDocument.value = documento
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

const getAcceptTypes = (tipoArchivo) => {
  const types = tipoArchivo.split(',').map(t => {
    const ext = t.trim().toLowerCase()
    if (ext === 'pdf') return '.pdf'
    if (ext === 'jpg' || ext === 'jpeg') return '.jpg,.jpeg'
    if (ext === 'png') return '.png'
    return ''
  })
  return types.join(',')
}

const getFileUrl = (url) => {
  // Assuming backend serves files at /uploads
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

const handleBack = () => {
  router.push('/padre/dashboard')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  cargarEstudiantes()
})
</script>
