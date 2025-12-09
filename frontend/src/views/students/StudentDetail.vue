<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <h2 class="font-semibold text-gray-900">Detalle del Estudiante</h2>
        </div>
        <div class="flex items-center gap-4">
          <button @click="generateCarnet" class="btn btn-secondary">
            📄 Generar Carnet
          </button>
          <button @click="goToEdit" class="btn btn-primary">
            Editar
          </button>
          <button @click="goBack" class="btn btn-outline">Volver</button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8 max-w-5xl">
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando información del estudiante...</p>
      </div>

      <div v-else-if="error" class="card text-center py-8 bg-red-50">
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadStudent" class="btn btn-primary mt-4">Reintentar</button>
      </div>

      <div v-else-if="student">
        <!-- Datos Personales -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 pb-3 border-b">Datos Personales</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-600">Código Estudiante</p>
              <p class="font-semibold">{{ student.codigo_estudiante }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Nombres</p>
              <p class="font-semibold">{{ student.nombres }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Apellidos</p>
              <p class="font-semibold">{{ student.apellidos }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">DNI</p>
              <p class="font-semibold">{{ student.dni }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p class="font-semibold">{{ formatDate(student.fecha_nacimiento) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Edad</p>
              <p class="font-semibold">{{ calcularEdad(student.fecha_nacimiento) }} años</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Género</p>
              <p class="font-semibold">{{ student.genero === 'M' ? 'Masculino' : 'Femenino' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Estado</p>
              <p class="font-semibold">
                <span
                  :class="{
                    'text-green-600': student.estado === 'activo',
                    'text-red-600': student.estado === 'retirado',
                    'text-yellow-600': student.estado === 'trasladado'
                  }"
                >
                  {{ student.estado }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Teléfono</p>
              <p class="font-semibold">{{ student.telefono || '-' }}</p>
            </div>
            <div class="md:col-span-3">
              <p class="text-sm text-gray-600">Email</p>
              <p class="font-semibold">{{ student.email || '-' }}</p>
            </div>
            <div class="md:col-span-3">
              <p class="text-sm text-gray-600">Dirección</p>
              <p class="font-semibold">
                {{ student.direccion || '-' }}
                {{ student.distrito ? `, ${student.distrito}` : '' }}
                {{ student.provincia ? `, ${student.provincia}` : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Información Médica -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 pb-3 border-b">Información Médica</h3>
          <div v-if="student.informacion_medica">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-600">Tipo de Sangre</p>
                <p class="font-semibold">{{ student.informacion_medica.tipo_sangre || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Estado de Vacunación</p>
                <p class="font-semibold">
                  <span :class="student.informacion_medica.esta_vacunado ? 'text-green-600' : 'text-red-600'">
                    {{ student.informacion_medica.esta_vacunado ? 'Vacunado' : 'No vacunado' }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Tiene Alergias</p>
                <p class="font-semibold">
                  <span :class="student.informacion_medica.tiene_alergias ? 'text-yellow-600' : 'text-green-600'">
                    {{ student.informacion_medica.tiene_alergias ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
            </div>

            <div v-if="student.informacion_medica.vacunas_completas" class="mb-4">
              <p class="text-sm text-gray-600">Vacunas Aplicadas</p>
              <p class="font-semibold">{{ student.informacion_medica.vacunas_completas }}</p>
            </div>

            <div v-if="student.informacion_medica.alergias" class="mb-4 bg-yellow-50 p-3 rounded">
              <p class="text-sm text-gray-600">Alergias</p>
              <p class="font-semibold text-yellow-800">{{ student.informacion_medica.alergias }}</p>
            </div>

            <div v-if="student.informacion_medica.condiciones_medicas" class="mb-4 bg-red-50 p-3 rounded">
              <p class="text-sm text-gray-600">Condiciones Médicas</p>
              <p class="font-semibold text-red-800">{{ student.informacion_medica.condiciones_medicas }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-600">Seguro Médico</p>
                <p class="font-semibold">{{ student.informacion_medica.seguro_medico || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Número de Seguro</p>
                <p class="font-semibold">{{ student.informacion_medica.numero_seguro || '-' }}</p>
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded">
              <h4 class="font-semibold mb-2 text-blue-900">Contacto de Emergencia</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Nombre</p>
                  <p class="font-semibold">{{ student.informacion_medica.contacto_emergencia_nombre }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Teléfono</p>
                  <p class="font-semibold">{{ student.informacion_medica.contacto_emergencia_telefono }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Relación</p>
                  <p class="font-semibold">{{ student.informacion_medica.contacto_emergencia_relacion || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500">No hay información médica registrada</p>
        </div>

        <!-- Apoderados -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 pb-3 border-b">Apoderados</h3>
          <div v-if="student.apoderados && student.apoderados.length > 0">
            <div v-for="apoderado in student.apoderados" :key="apoderado.id" class="border rounded-lg p-4 mb-3">
              <h4 class="font-semibold mb-3">{{ apoderado.tipo_apoderado }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Nombre Completo</p>
                  <p class="font-semibold">{{ apoderado.nombres }} {{ apoderado.apellidos }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">DNI</p>
                  <p class="font-semibold">{{ apoderado.dni }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Teléfono</p>
                  <p class="font-semibold">{{ apoderado.telefono || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-semibold">{{ apoderado.email || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Ocupación</p>
                  <p class="font-semibold">{{ apoderado.ocupacion || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500">No hay apoderados registrados</p>
        </div>

        <!-- Historial Académico -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 pb-3 border-b">Historial Académico</h3>
          <div v-if="student.historial_academico && student.historial_academico.length > 0">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left p-2">Año</th>
                  <th class="text-left p-2">Grado</th>
                  <th class="text-left p-2">Sección</th>
                  <th class="text-left p-2">Promedio</th>
                  <th class="text-left p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hist in student.historial_academico" :key="hist.id" class="border-b">
                  <td class="p-2">{{ hist.año_escolar }}</td>
                  <td class="p-2">{{ hist.grado_nombre }}</td>
                  <td class="p-2">{{ hist.seccion_nombre || '-' }}</td>
                  <td class="p-2">{{ hist.promedio_final || '-' }}</td>
                  <td class="p-2">
                    <span
                      :class="{
                        'text-green-600': hist.estado_año === 'aprobado',
                        'text-red-600': hist.estado_año === 'desaprobado',
                        'text-gray-600': hist.estado_año === 'retirado' || hist.estado_año === 'trasladado'
                      }"
                    >
                      {{ hist.estado_año }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500">No hay historial académico registrado</p>
        </div>

        <!-- Documentos -->
        <div class="card mb-6">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-xl font-semibold">Documentos</h3>
            <button @click="verificarDocumentos" class="btn btn-sm btn-outline">
              Verificar Completitud
            </button>
          </div>

          <div v-if="verificacionDocs" class="mb-4 p-3 rounded" :class="verificacionDocs.completo ? 'bg-green-50' : 'bg-yellow-50'">
            <p class="font-semibold" :class="verificacionDocs.completo ? 'text-green-800' : 'text-yellow-800'">
              {{ verificacionDocs.completo ? 'Todos los documentos obligatorios están completos' : 'Faltan documentos obligatorios' }}
            </p>
            <p class="text-sm mt-1">
              {{ verificacionDocs.total_subidos }} de {{ verificacionDocs.total_requeridos }} documentos completos
            </p>
            <div v-if="!verificacionDocs.completo && verificacionDocs.documentos_faltantes.length > 0" class="mt-2">
              <p class="text-sm font-medium">Documentos faltantes:</p>
              <ul class="text-sm list-disc list-inside">
                <li v-for="doc in verificacionDocs.documentos_faltantes" :key="doc.tipo_documento">
                  {{ doc.descripcion }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="student.documentos && student.documentos.length > 0">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left p-2">Tipo</th>
                  <th class="text-left p-2">Nombre Archivo</th>
                  <th class="text-left p-2">Estado</th>
                  <th class="text-left p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in student.documentos" :key="doc.id" class="border-b">
                  <td class="p-2">{{ formatTipoDocumento(doc.tipo_documento) }}</td>
                  <td class="p-2">{{ doc.nombre_archivo }}</td>
                  <td class="p-2">
                    <span
                      :class="{
                        'text-green-600': doc.estado_verificacion === 'aprobado',
                        'text-yellow-600': doc.estado_verificacion === 'pendiente',
                        'text-red-600': doc.estado_verificacion === 'rechazado'
                      }"
                    >
                      {{ doc.estado_verificacion }}
                    </span>
                  </td>
                  <td class="p-2">{{ formatDate(doc.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500">No hay documentos subidos</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import studentService from '@/services/student.service'

const router = useRouter()
const route = useRoute()

const student = ref(null)
const loading = ref(false)
const error = ref(null)
const verificacionDocs = ref(null)

const loadStudent = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await studentService.getById(route.params.id)
    student.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar estudiante'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const verificarDocumentos = async () => {
  try {
    const response = await studentService.verificarDocumentos(route.params.id)
    verificacionDocs.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al verificar documentos'
    console.error('Error:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE')
}

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

const formatTipoDocumento = (tipo) => {
  const tipos = {
    dni_copia: 'Copia DNI',
    partida_nacimiento: 'Partida de Nacimiento',
    certificado_estudios: 'Certificado de Estudios',
    certificado_conducta: 'Certificado de Conducta',
    certificado_salud: 'Certificado de Salud',
    foto_carnet: 'Foto Carnet',
    recibo_agua: 'Recibo Agua/Luz',
    otro: 'Otro'
  }
  return tipos[tipo] || tipo
}

const generateCarnet = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/students/${route.params.id}/carnet`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al generar el carnet')
    }

    // Crear blob del PDF
    const blob = await response.blob()

    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carnet-${student.value.codigo_estudiante}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error:', error)
    alert('Error al generar el carnet del estudiante')
  }
}

const goBack = () => {
  router.push('/students')
}

const goToEdit = () => {
  router.push(`/students/${route.params.id}/edit`)
}

onMounted(() => {
  loadStudent()
})
</script>

<style scoped>
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

table {
  border-collapse: collapse;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  font-size: 0.875rem;
}

td {
  font-size: 0.875rem;
}
</style>
