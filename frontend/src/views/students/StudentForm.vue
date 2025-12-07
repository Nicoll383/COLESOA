<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Editar' : 'Nuevo' }} Estudiante</h1>
          <p class="page-subtitle">Complete todos los pasos del formulario</p>
        </div>
        <button @click="goBack" class="btn-secondary">
          <span>← Volver</span>
        </button>
      </div>

      <div class="content-wrapper">
      <div v-if="error" class="alert alert-danger mb-6">
        {{ error }}
      </div>

      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex-1 flex items-center"
          >
            <div class="flex flex-col items-center flex-1">
              <div
                :class="{
                  'bg-blue-600 text-white': currentStep >= step.number,
                  'bg-gray-300 text-gray-600': currentStep < step.number
                }"
                class="w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2"
              >
                {{ step.number }}
              </div>
              <span
                :class="{
                  'text-blue-600 font-semibold': currentStep === step.number,
                  'text-gray-600': currentStep !== step.number
                }"
                class="text-sm text-center"
              >
                {{ step.title }}
              </span>
            </div>
            <div
              v-if="step.number < steps.length"
              :class="{
                'bg-blue-600': currentStep > step.number,
                'bg-gray-300': currentStep <= step.number
              }"
              class="h-1 flex-1 mx-2"
            ></div>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- PASO 1: Datos Personales -->
        <div v-show="currentStep === 1" class="card">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
            Datos Personales
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label required">Nombres</label>
              <input
                v-model="form.nombres"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label required">Apellidos</label>
              <input
                v-model="form.apellidos"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label required">DNI</label>
              <input
                v-model="form.dni"
                type="text"
                maxlength="8"
                pattern="[0-9]{8}"
                class="form-input"
                required
              />
              <p class="text-xs text-gray-500 mt-1">Debe tener 8 dígitos</p>
            </div>

            <div class="form-group">
              <label class="form-label required">Fecha de Nacimiento</label>
              <input
                v-model="form.fecha_nacimiento"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label required">Género</label>
              <select v-model="form.genero" class="form-input" required>
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input
                v-model="form.telefono"
                type="tel"
                class="form-input"
              />
            </div>

            <div class="form-group md:col-span-2">
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-input"
              />
            </div>

            <div class="form-group md:col-span-2">
              <label class="form-label">Dirección</label>
              <input
                v-model="form.direccion"
                type="text"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="form.estado" class="form-input">
                <option value="activo">Activo</option>
                <option value="retirado">Retirado</option>
                <option value="trasladado">Trasladado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- PASO 2: Información Médica -->
        <div v-show="currentStep === 2" class="card">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
            Información Médica
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Tipo de Sangre</label>
              <select v-model="form.informacion_medica.tipo_sangre" class="form-input">
                <option value="">No especificado</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.informacion_medica.esta_vacunado"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="form-label mb-0">Está vacunado</span>
              </label>
            </div>

            <div class="form-group md:col-span-2">
              <label class="form-label">Vacunas Completas</label>
              <textarea
                v-model="form.informacion_medica.vacunas_completas"
                class="form-input"
                rows="2"
                placeholder="Ej: BCG, Hepatitis B, Pentavalente, Rotavirus, Neumococo, Influenza, SPR"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.informacion_medica.tiene_alergias"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="form-label mb-0">Tiene alergias</span>
              </label>
            </div>

            <div class="form-group md:col-span-2" v-if="form.informacion_medica.tiene_alergias">
              <label class="form-label">Descripción de Alergias</label>
              <textarea
                v-model="form.informacion_medica.alergias"
                class="form-input"
                rows="2"
                placeholder="Describe las alergias..."
              ></textarea>
            </div>

            <div class="form-group md:col-span-2">
              <label class="form-label">Condiciones Médicas Especiales</label>
              <textarea
                v-model="form.informacion_medica.condiciones_medicas"
                class="form-input"
                rows="2"
                placeholder="Ej: Asma, diabetes, epilepsia, etc."
              ></textarea>
            </div>

            <div class="form-group md:col-span-2">
              <h4 class="font-semibold mb-3 text-red-600">Contacto de Emergencia</h4>
            </div>

            <div class="form-group">
              <label class="form-label required">Nombre Completo</label>
              <input
                v-model="form.informacion_medica.contacto_emergencia_nombre"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label required">Teléfono de Emergencia</label>
              <input
                v-model="form.informacion_medica.contacto_emergencia_telefono"
                type="tel"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Relación</label>
              <input
                v-model="form.informacion_medica.contacto_emergencia_relacion"
                type="text"
                class="form-input"
                placeholder="Ej: Padre, Madre, Tío, etc."
              />
            </div>
          </div>
        </div>

        <!-- PASO 3: Apoderados -->
        <div v-show="currentStep === 3" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold flex items-center gap-2">
              <span class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Apoderados
            </h3>
            <button type="button" @click="agregarApoderado" class="btn btn-sm btn-outline">
              Agregar Apoderado
            </button>
          </div>

          <div v-if="form.apoderados.length === 0" class="text-center py-8 text-gray-500">
            No hay apoderados registrados. Haz clic en "Agregar Apoderado" para añadir uno.
          </div>

          <div v-for="(apoderado, index) in form.apoderados" :key="index" class="border rounded-lg p-4 mb-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-semibold">Apoderado {{ index + 1 }}</h4>
              <button type="button" @click="eliminarApoderado(index)" class="text-red-600 text-sm">
                Eliminar
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Tipo</label>
                <select v-model="apoderado.tipo_apoderado" class="form-input">
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="tutor">Tutor</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">DNI</label>
                <div class="flex gap-2">
                  <input
                    v-model="apoderado.dni"
                    type="text"
                    maxlength="8"
                    class="form-input"
                    @blur="consultarReniec(apoderado)"
                  />
                  <button
                    type="button"
                    @click="consultarReniec(apoderado)"
                    :disabled="loadingReniec[index]"
                    class="btn btn-sm btn-primary"
                  >
                    {{ loadingReniec[index] ? '...' : 'Buscar' }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Ingresa DNI y presiona Buscar</p>
              </div>

              <div class="form-group">
                <label class="form-label">Nombres</label>
                <input
                  v-model="apoderado.nombres"
                  type="text"
                  class="form-input"
                  :disabled="loadingReniec[index]"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Apellidos</label>
                <input
                  v-model="apoderado.apellidos"
                  type="text"
                  class="form-input"
                  :disabled="loadingReniec[index]"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input
                  v-model="apoderado.telefono"
                  type="tel"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  v-model="apoderado.email"
                  type="email"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Ocupación</label>
                <input
                  v-model="apoderado.ocupacion"
                  type="text"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Dirección</label>
                <input
                  v-model="apoderado.direccion"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 4: Foto del Estudiante -->
        <div v-show="currentStep === 4" class="card">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
            Foto del Estudiante
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Esta foto se utilizará para generar el carnet del estudiante.
          </p>
          <div class="form-group">
            <label class="form-label">Cargar Foto (fondo blanco, tamaño carnet)</label>
            <input
              @change="handleFotoChange"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              class="form-input"
            />
            <p class="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB</p>
          </div>

          <div v-if="fotoPreview" class="mt-4">
            <p class="text-sm font-medium mb-2">Vista previa:</p>
            <img :src="fotoPreview" alt="Foto preview" class="w-32 h-40 object-cover border rounded" />
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="flex gap-4 justify-between mt-6">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            class="btn btn-outline"
          >
            Anterior
          </button>
          <div v-else></div>

          <div class="flex gap-4">
            <button type="button" @click="goBack" class="btn btn-outline">
              Cancelar
            </button>
            <button
              v-if="currentStep < 4"
              type="button"
              @click="nextStep"
              class="btn btn-primary"
            >
              Siguiente
            </button>
            <button
              v-else
              type="submit"
              :disabled="submitting"
              class="btn btn-primary"
            >
              {{ submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }} Estudiante
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import studentService from '@/services/student.service'
import reniecService from '@/services/reniec.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const error = ref(null)
const submitting = ref(false)
const currentStep = ref(1)

const steps = [
  { number: 1, title: 'Datos Personales' },
  { number: 2, title: 'Información Médica' },
  { number: 3, title: 'Apoderados' },
  { number: 4, title: 'Foto' }
]

const form = ref({
  nombres: '',
  apellidos: '',
  dni: '',
  fecha_nacimiento: '',
  genero: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: 'activo',
  foto_url: '',
  informacion_medica: {
    tipo_sangre: '',
    esta_vacunado: false,
    vacunas_completas: '',
    tiene_alergias: false,
    alergias: '',
    condiciones_medicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
  },
  apoderados: []
})

const fotoPreview = ref(null)
const fotoFile = ref(null)
const loadingReniec = reactive({})

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const agregarApoderado = () => {
  const index = form.value.apoderados.length
  form.value.apoderados.push({
    tipo_apoderado: 'padre',
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: ''
  })
  loadingReniec[index] = false
}

const eliminarApoderado = (index) => {
  form.value.apoderados.splice(index, 1)
}

const consultarReniec = async (apoderado) => {
  const index = form.value.apoderados.indexOf(apoderado)

  if (!apoderado.dni || apoderado.dni.length !== 8) {
    error.value = 'El DNI debe tener 8 dígitos'
    setTimeout(() => error.value = null, 3000)
    return
  }

  loadingReniec[index] = true
  error.value = null

  try {
    const response = await reniecService.consultarDni(apoderado.dni)

    if (response.data.success && response.data.data) {
      const data = response.data.data
      apoderado.nombres = data.nombres || ''
      apoderado.apellidos = `${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim()

      // Mostrar mensaje de éxito
      const successMsg = document.createElement('div')
      successMsg.className = 'alert-success'
      successMsg.textContent = 'Datos cargados desde RENIEC'
      successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 0.5rem; z-index: 9999;'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    }
  } catch (err) {
    console.error('Error al consultar RENIEC:', err)
    error.value = 'No se pudo consultar el DNI. Por favor, ingresa los datos manualmente.'
    setTimeout(() => error.value = null, 5000)
  } finally {
    loadingReniec[index] = false
  }
}

const handleFotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'La foto no puede superar los 5MB'
      return
    }
    fotoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  error.value = null
  submitting.value = true

  try {
    if (isEdit.value) {
      await studentService.update(route.params.id, form.value)
    } else {
      await studentService.create(form.value)
    }
    router.push('/students')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar estudiante'
    console.error('Error:', err)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/students')
}

const loadStudent = async () => {
  if (!isEdit.value) return

  try {
    const response = await studentService.getById(route.params.id)
    const student = response.data.data

    form.value = {
      nombres: student.nombres,
      apellidos: student.apellidos,
      dni: student.dni,
      fecha_nacimiento: student.fecha_nacimiento,
      genero: student.genero,
      telefono: student.telefono || '',
      email: student.email || '',
      direccion: student.direccion || '',
      estado: student.estado,
      foto_url: student.foto_url || '',
      informacion_medica: student.informacion_medica || {
        tipo_sangre: '',
        esta_vacunado: false,
        vacunas_completas: '',
        tiene_alergias: false,
        alergias: '',
        condiciones_medicas: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        contacto_emergencia_relacion: ''
      },
      apoderados: student.apoderados || []
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar estudiante'
    console.error('Error:', err)
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadStudent()
  }
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
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

.btn-secondary {
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.content-wrapper {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.card {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.required::after {
  content: ' *';
  color: #ef4444;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
}

/* Progress steps styling */
.mb-8 {
  margin-bottom: 2rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
}

.flex-col {
  flex-direction: column;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.rounded-full {
  border-radius: 9999px;
}

.font-bold {
  font-weight: 700;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-center {
  text-align: center;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: white;
}

.bg-gray-300 {
  background-color: #d1d5db;
}

.text-gray-600 {
  color: #4b5563;
}

.text-blue-600 {
  color: #2563eb;
}

.font-semibold {
  font-weight: 600;
}

.h-1 {
  height: 0.25rem;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}
</style>
