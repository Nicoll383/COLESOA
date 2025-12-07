<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <h2 class="font-semibold text-gray-900">
            {{ isEdit ? 'Editar' : 'Nuevo' }} Estudiante
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <button @click="goBack" class="btn btn-outline">Volver</button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div v-if="error" class="alert alert-danger mb-6">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- SECCIÓN 1: Datos Personales -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
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
              <label class="form-label">Distrito</label>
              <input
                v-model="form.distrito"
                type="text"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Provincia</label>
              <input
                v-model="form.provincia"
                type="text"
                class="form-input"
                value="Lima"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Departamento</label>
              <input
                v-model="form.departamento"
                type="text"
                class="form-input"
                value="Lima"
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

        <!-- SECCIÓN 2: Información Médica -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
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
              <label class="form-label">Medicamentos Regulares</label>
              <textarea
                v-model="form.informacion_medica.medicamentos_regulares"
                class="form-input"
                rows="2"
                placeholder="Medicamentos que toma regularmente..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Seguro Médico</label>
              <input
                v-model="form.informacion_medica.seguro_medico"
                type="text"
                class="form-input"
                placeholder="Ej: SIS, EsSalud, Pacífico"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Número de Seguro</label>
              <input
                v-model="form.informacion_medica.numero_seguro"
                type="text"
                class="form-input"
              />
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

            <div class="form-group md:col-span-2">
              <label class="form-label">Observaciones Médicas</label>
              <textarea
                v-model="form.informacion_medica.observaciones_medicas"
                class="form-input"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: Apoderados -->
        <div class="card mb-6">
          <div class="flex justify-between items-center mb-4">
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
                <input
                  v-model="apoderado.dni"
                  type="text"
                  maxlength="8"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Nombres</label>
                <input
                  v-model="apoderado.nombres"
                  type="text"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Apellidos</label>
                <input
                  v-model="apoderado.apellidos"
                  type="text"
                  class="form-input"
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

        <!-- SECCIÓN 4: Foto del Estudiante -->
        <div class="card mb-6">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
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

        <!-- Botones de acción -->
        <div class="flex gap-4 justify-end">
          <button type="button" @click="goBack" class="btn btn-outline">
            Cancelar
          </button>
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }} Estudiante
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import studentService from '@/services/student.service'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const error = ref(null)
const submitting = ref(false)

const form = ref({
  nombres: '',
  apellidos: '',
  dni: '',
  fecha_nacimiento: '',
  genero: '',
  telefono: '',
  email: '',
  direccion: '',
  distrito: '',
  provincia: 'Lima',
  departamento: 'Lima',
  estado: 'activo',
  foto_url: '',
  informacion_medica: {
    tipo_sangre: '',
    esta_vacunado: false,
    vacunas_completas: '',
    tiene_alergias: false,
    alergias: '',
    condiciones_medicas: '',
    medicamentos_regulares: '',
    seguro_medico: '',
    numero_seguro: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones_medicas: ''
  },
  apoderados: []
})

const fotoPreview = ref(null)
const fotoFile = ref(null)

const agregarApoderado = () => {
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
}

const eliminarApoderado = (index) => {
  form.value.apoderados.splice(index, 1)
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
      distrito: student.distrito || '',
      provincia: student.provincia || 'Lima',
      departamento: student.departamento || 'Lima',
      estado: student.estado,
      foto_url: student.foto_url || '',
      informacion_medica: student.informacion_medica || {
        tipo_sangre: '',
        esta_vacunado: false,
        vacunas_completas: '',
        tiene_alergias: false,
        alergias: '',
        condiciones_medicas: '',
        medicamentos_regulares: '',
        seguro_medico: '',
        numero_seguro: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        contacto_emergencia_relacion: '',
        observaciones_medicas: ''
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
.required::after {
  content: ' *';
  color: red;
}

.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
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
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>
