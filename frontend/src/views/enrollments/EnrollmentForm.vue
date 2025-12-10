<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Nueva Matrícula</h1>
          <p class="page-subtitle">Proceso de preinscripción - Año Escolar {{ añoEscolar }}</p>
        </div>
      </div>

      <!-- Stepper -->
      <div class="stepper-container">
        <div class="stepper">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step"
            :class="{
              'step-active': currentStep === index + 1,
              'step-completed': currentStep > index + 1
            }"
          >
            <div class="step-number">
              <span v-if="currentStep > index + 1">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-label">{{ step }}</div>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <!-- Step 1: Buscar Estudiante -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">
            <span class="step-icon">👤</span>
            Seleccionar Estudiante
          </h2>
          <p class="step-description">Busque al estudiante por DNI o nombre</p>

          <div class="search-section">
            <div class="form-group">
              <label class="form-label">Buscar por DNI</label>
              <div class="search-input-group">
                <input
                  v-model="searchDni"
                  type="text"
                  class="form-input"
                  placeholder="Ingrese DNI (8 dígitos)"
                  maxlength="8"
                  @input="searchDni = searchDni.replace(/\D/g, '')"
                  @keyup.enter="searchStudents"
                />
                <button @click="searchStudents" class="btn btn-primary">
                  🔍 Buscar
                </button>
              </div>
            </div>

            <div v-if="searchError" class="alert alert-error">
              {{ searchError }}
            </div>

            <div v-if="searchLoading" class="text-center py-4">
              <p class="text-gray-600">Buscando estudiantes...</p>
            </div>

            <!-- Resultados de búsqueda -->
            <div v-if="searchResults.length > 0" class="search-results">
              <h3 class="font-semibold mb-3">Resultados de búsqueda</h3>
              <div class="student-cards">
                <div
                  v-for="student in searchResults"
                  :key="student.id"
                  class="student-card"
                  :class="{ 'student-card-selected': selectedStudent?.id === student.id }"
                  @click="selectStudent(student)"
                >
                  <div class="student-avatar">
                    {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
                  </div>
                  <div class="student-info">
                    <h4 class="student-name">{{ student.nombres }} {{ student.apellidos }}</h4>
                    <p class="student-details">
                      <span class="detail-badge">DNI: {{ student.dni }}</span>
                      <span class="detail-badge">Código: {{ student.codigo_estudiante }}</span>
                    </p>
                    <p class="student-meta">
                      Fecha Nac.: {{ formatDate(student.fecha_nacimiento) }} |
                      {{ student.genero === 'M' ? 'Masculino' : 'Femenino' }}
                    </p>
                  </div>
                  <div v-if="selectedStudent?.id === student.id" class="student-check">✓</div>
                </div>
              </div>
            </div>

            <!-- Estudiante seleccionado -->
            <div v-if="selectedStudent" class="selected-student-banner">
              <div class="banner-icon">✓</div>
              <div>
                <p class="banner-title">Estudiante Seleccionado</p>
                <p class="banner-text">{{ selectedStudent.nombres }} {{ selectedStudent.apellidos }} - DNI: {{ selectedStudent.dni }}</p>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="goToList" class="btn btn-outline">Cancelar</button>
            <button
              @click="nextStep"
              :disabled="!selectedStudent"
              class="btn btn-primary"
            >
              Siguiente →
            </button>
          </div>
        </div>

        <!-- Step 2: Seleccionar Grado y Sección -->
        <div v-if="currentStep === 2" class="step-content">
          <h2 class="step-title">
            <span class="step-icon">📚</span>
            {{ !selectedGrado ? 'Seleccionar Grado' : 'Seleccionar Sección' }}
          </h2>
          <p class="step-description">
            {{ !selectedGrado ? 'Elija el grado para la matrícula' : `Elija la sección para ${selectedGrado}` }}
          </p>

          <div v-if="loadingSecciones" class="text-center py-8">
            <p class="text-gray-600">Cargando grados y secciones disponibles...</p>
          </div>

          <div v-else-if="errorSecciones" class="alert alert-error">
            {{ errorSecciones }}
          </div>

          <div v-else class="sections-container">
            <!-- Paso 2A: Seleccionar Grado -->
            <div v-if="!selectedGrado" class="grades-grid">
              <div
                v-for="grado in gradosDisponibles"
                :key="grado.nombre"
                class="grade-card"
                :class="{ 'grade-card-disabled': grado.total_vacantes === 0 }"
                @click="grado.total_vacantes > 0 && selectGrado(grado.nombre)"
              >
                <div class="grade-icon">🎓</div>
                <h3 class="grade-name">{{ grado.nombre }}</h3>
                <div class="grade-info">
                  <p class="grade-sections">{{ grado.total_secciones }} {{ grado.total_secciones === 1 ? 'sección' : 'secciones' }}</p>
                  <span class="grade-vacancies" :class="{
                    'text-success': grado.total_vacantes > 10,
                    'text-warning': grado.total_vacantes > 0 && grado.total_vacantes <= 10,
                    'text-danger': grado.total_vacantes === 0
                  }">
                    {{ grado.total_vacantes }} vacantes
                  </span>
                </div>
              </div>

              <div v-if="gradosDisponibles.length === 0" class="text-center py-8 text-gray-500">
                No hay grados disponibles para el año escolar {{ añoEscolar }}
              </div>
            </div>

            <!-- Paso 2B: Seleccionar Sección (después de elegir grado) -->
            <div v-else>
              <div class="selected-grade-banner">
                <div class="banner-content">
                  <span class="banner-icon">📚</span>
                  <span class="banner-text">Grado seleccionado: <strong>{{ selectedGrado }}</strong></span>
                </div>
                <button @click="selectedGrado = null; selectedSeccion = null" class="btn-change">
                  Cambiar Grado
                </button>
              </div>

              <div class="sections-grid">
                <div
                  v-for="seccion in seccionesFiltradas"
                  :key="seccion.id"
                  class="section-card"
                  :class="{
                    'section-card-selected': selectedSeccion?.id === seccion.id,
                    'section-card-full': seccion.vacantes_disponibles === 0
                  }"
                  @click="selectSeccion(seccion)"
                >
                  <div class="section-header">
                    <h4 class="section-name">Sección {{ seccion.nombre }}</h4>
                    <span class="section-badge" :class="{
                      'badge-success': seccion.vacantes_disponibles > 10,
                      'badge-warning': seccion.vacantes_disponibles > 0 && seccion.vacantes_disponibles <= 10,
                      'badge-danger': seccion.vacantes_disponibles === 0
                    }">
                      {{ seccion.vacantes_disponibles }} vacantes
                    </span>
                  </div>
                  <div class="section-details">
                    <p><strong>Aula:</strong> {{ seccion.aula }}</p>
                    <p><strong>Turno:</strong> {{ seccion.turno }}</p>
                    <p><strong>Capacidad:</strong> {{ seccion.capacidad }}</p>
                    <div class="vacancy-bar">
                      <div
                        class="vacancy-fill"
                        :style="{ width: `${(seccion.matriculados / seccion.capacidad) * 100}%` }"
                      ></div>
                    </div>
                    <p class="vacancy-text">
                      {{ seccion.matriculados }} / {{ seccion.capacidad }} matriculados
                    </p>
                  </div>
                  <div v-if="selectedSeccion?.id === seccion.id" class="section-check">✓</div>
                </div>
              </div>

              <div v-if="seccionesFiltradas.length === 0" class="text-center py-8 text-gray-500">
                No hay secciones disponibles para {{ selectedGrado }}
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn btn-outline">← Atrás</button>
            <button
              @click="nextStep"
              :disabled="!selectedSeccion || selectedSeccion.vacantes_disponibles === 0"
              class="btn btn-primary"
            >
              Siguiente →
            </button>
          </div>
        </div>

        <!-- Step 3: Revisar y Confirmar -->
        <div v-if="currentStep === 3" class="step-content">
          <h2 class="step-title">
            <span class="step-icon">📋</span>
            Revisar Información
          </h2>
          <p class="step-description">Verifique los datos antes de crear la matrícula</p>

          <div class="review-section">
            <!-- Información del Estudiante -->
            <div class="review-card">
              <h3 class="review-card-title">
                <span class="review-icon">👤</span>
                Información del Estudiante
              </h3>
              <div class="review-grid">
                <div class="review-item">
                  <span class="review-label">Nombres:</span>
                  <span class="review-value">{{ selectedStudent?.nombres }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Apellidos:</span>
                  <span class="review-value">{{ selectedStudent?.apellidos }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">DNI:</span>
                  <span class="review-value">{{ selectedStudent?.dni }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Código:</span>
                  <span class="review-value">{{ selectedStudent?.codigo_estudiante }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Fecha de Nacimiento:</span>
                  <span class="review-value">{{ formatDate(selectedStudent?.fecha_nacimiento) }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Género:</span>
                  <span class="review-value">{{ selectedStudent?.genero === 'M' ? 'Masculino' : 'Femenino' }}</span>
                </div>
              </div>
            </div>

            <!-- Información Académica -->
            <div class="review-card">
              <h3 class="review-card-title">
                <span class="review-icon">📚</span>
                Información Académica
              </h3>
              <div class="review-grid">
                <div class="review-item">
                  <span class="review-label">Año Escolar:</span>
                  <span class="review-value">{{ añoEscolar }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Grado:</span>
                  <span class="review-value">{{ selectedSeccion?.grado_nombre }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Sección:</span>
                  <span class="review-value">{{ selectedSeccion?.nombre }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Aula:</span>
                  <span class="review-value">{{ selectedSeccion?.aula }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Turno:</span>
                  <span class="review-value capitalize">{{ selectedSeccion?.turno }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Vacantes Disponibles:</span>
                  <span class="review-value">{{ selectedSeccion?.vacantes_disponibles }}</span>
                </div>
              </div>
            </div>

            <!-- Información Financiera (solo informativa) -->
            <div class="review-card info-card">
              <h3 class="review-card-title">
                <span class="review-icon">💰</span>
                Información Financiera
              </h3>
              <div class="financial-summary">
                <div class="financial-item">
                  <span class="financial-label">Monto de Matrícula:</span>
                  <span class="financial-amount">S/. {{ montoMatricula.toFixed(2) }}</span>
                </div>
              </div>
              <p class="financial-note">
                * El pago se realizará en el siguiente paso
              </p>
            </div>
          </div>

          <div v-if="createError" class="alert alert-error mb-4">
            {{ createError }}
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn btn-outline" :disabled="creating">← Atrás</button>
            <button
              @click="createEnrollment"
              :disabled="creating"
              class="btn btn-success"
            >
              <span v-if="creating">Creando matrícula...</span>
              <span v-else>✓ Confirmar Matrícula</span>
            </button>
          </div>
        </div>

        <!-- Step 4: Subir Documentos (Opcional) -->
        <div v-if="currentStep === 4" class="step-content">
          <h2 class="step-title">
            <span class="step-icon">📄</span>
            Documentos del Estudiante
          </h2>
          <p class="step-description">
            Suba los documentos requeridos. Puede hacerlo ahora o posteriormente desde su portal.
            <strong>Este paso es opcional y no bloquea la matrícula.</strong>
          </p>

          <div class="documents-container">
            <div
              v-for="doc in documentosRequeridos"
              :key="doc.id"
              class="document-card"
              :class="{ 'document-uploaded': doc.subido }"
            >
              <div class="document-info">
                <div class="document-header">
                  <h4 class="document-name">{{ doc.nombre }}</h4>
                  <span class="document-badge" :class="{
                    'badge-required': doc.obligatorio && !doc.subido,
                    'badge-optional': !doc.obligatorio && !doc.subido,
                    'badge-success': doc.subido
                  }">
                    {{ doc.subido ? '✓ Subido' : (doc.obligatorio ? 'Obligatorio' : 'Opcional') }}
                  </span>
                </div>
                <div v-if="doc.subido" class="document-file">
                  <span class="file-icon">📎</span>
                  <span class="file-name">{{ doc.archivo }}</span>
                </div>
              </div>
              <div class="document-upload">
                <label :for="`file-${doc.id}`" class="upload-button" :class="{ 'upload-disabled': doc.subido }">
                  <input
                    :id="`file-${doc.id}`"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    @change="handleDocumentUpload(doc.id, $event)"
                    class="file-input-hidden"
                    :disabled="doc.subido"
                  />
                  <span v-if="!doc.subido">📎 Seleccionar Archivo</span>
                  <span v-else>✓ Subido</span>
                </label>
              </div>
            </div>
          </div>

          <div class="documents-note">
            <div class="note-icon">ℹ️</div>
            <div>
              <p class="note-title">Nota Importante</p>
              <p class="note-text">
                Los documentos no subidos ahora pueden ser enviados posteriormente desde el portal de padres.
                La matrícula se creará independientemente de si sube los documentos en este momento.
              </p>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn btn-outline">← Atrás</button>
            <button @click="skipDocuments" class="btn btn-outline">
              Omitir Documentos
            </button>
            <button @click="continueToPayment" class="btn btn-success">
              Continuar al Pago →
            </button>
          </div>
        </div>

        <!-- Step 5: Pagar -->
        <div v-if="currentStep === 5" class="step-content">
          <h2 class="step-title">
            <span class="step-icon">💳</span>
            Procesar Pago de Matrícula
          </h2>
          <p class="step-description">Seleccione el método de pago y registre el pago de la matrícula</p>

          <!-- Resumen de Matrícula -->
          <div class="payment-summary-card">
            <h3 class="payment-summary-title">Resumen de Matrícula</h3>
            <div class="payment-summary-content">
              <div class="summary-row">
                <span class="summary-label">Código de Matrícula:</span>
                <span class="summary-value">{{ createdEnrollment?.codigo_matricula }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Estudiante:</span>
                <span class="summary-value">{{ selectedStudent?.nombres }} {{ selectedStudent?.apellidos }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Grado y Sección:</span>
                <span class="summary-value">{{ selectedSeccion?.grado_nombre }} - Sección {{ selectedSeccion?.nombre }}</span>
              </div>
              <div class="summary-row summary-total">
                <span class="summary-label">Monto a Pagar:</span>
                <span class="summary-amount">S/. {{ montoMatricula.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Método de Pago -->
          <div class="payment-method-section">
            <h3 class="payment-section-title">
              <span class="payment-icon">💳</span>
              Seleccione el Método de Pago
            </h3>
            <div class="payment-methods-grid">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-method-card"
                :class="{ 'payment-method-selected': metodoPago === method.value }"
              >
                <input
                  type="radio"
                  v-model="metodoPago"
                  :value="method.value"
                  class="payment-radio"
                />
                <div class="payment-icon">{{ method.icon }}</div>
                <div class="payment-name">{{ method.label }}</div>
              </label>
            </div>
          </div>

          <!-- Información adicional de pago -->
          <div class="payment-details-section">
            <div class="form-group">
              <label class="form-label">Número de Comprobante / Referencia (Opcional)</label>
              <input
                v-model="paymentReference"
                type="text"
                class="form-input"
                placeholder="Ej: 0001-12345, Operación #123456"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Observaciones (Opcional)</label>
              <textarea
                v-model="paymentObservations"
                class="form-textarea"
                rows="3"
                placeholder="Agregue cualquier observación sobre el pago..."
              ></textarea>
            </div>
          </div>

          <div v-if="paymentError" class="alert alert-error mb-4">
            {{ paymentError }}
          </div>

          <div class="payment-note">
            <div class="note-icon">ℹ️</div>
            <div>
              <p class="note-title">Nota Importante</p>
              <p class="note-text">
                Este paso registra el pago en el sistema. Puede omitir este paso y realizar el pago posteriormente desde el módulo de finanzas.
              </p>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="btn btn-outline" :disabled="processingPayment">← Atrás</button>
            <button @click="skipPayment" class="btn btn-outline" :disabled="processingPayment">
              Omitir Pago (Pagar Después)
            </button>
            <button
              @click="processPayment"
              :disabled="processingPayment"
              class="btn btn-success"
            >
              <span v-if="processingPayment">Procesando pago...</span>
              <span v-else>💳 Confirmar Pago</span>
            </button>
          </div>
        </div>

        <!-- Step 6: Confirmación Final -->
        <div v-if="currentStep === 6" class="step-content">
          <div class="success-container">
            <div class="success-icon">✓</div>
            <h2 class="success-title">¡Matrícula Completada Exitosamente!</h2>
            <p class="success-message">
              La matrícula ha sido registrada con el código:
            </p>
            <div class="enrollment-code">{{ createdEnrollment?.codigo_matricula }}</div>

            <div class="success-details">
              <p><strong>Estudiante:</strong> {{ selectedStudent?.nombres }} {{ selectedStudent?.apellidos }}</p>
              <p><strong>Grado:</strong> {{ selectedSeccion?.grado_nombre }} - Sección {{ selectedSeccion?.nombre }}</p>
              <p><strong>Año Escolar:</strong> {{ añoEscolar }}</p>
              <p><strong>Monto de Matrícula:</strong> S/. {{ montoMatricula.toFixed(2) }}</p>
              <p>
                <strong>Estado del Pago:</strong>
                <span v-if="paymentProcessed" class="badge-success">✓ Pago Registrado ({{ metodoPago }})</span>
                <span v-else class="badge-warning">⏳ Pendiente de Pago</span>
              </p>
            </div>

            <div v-if="!paymentProcessed" class="success-note">
              <div class="note-icon">ℹ️</div>
              <div>
                <p class="note-title">Completar Pago</p>
                <p class="note-text">
                  El pago de la matrícula puede realizarse posteriormente desde el módulo de finanzas
                  o desde el portal de padres. El código de matrícula es: <strong>{{ createdEnrollment?.codigo_matricula }}</strong>
                </p>
              </div>
            </div>

            <div class="success-actions">
              <button @click="goToEnrollment" class="btn btn-primary">
                Ver Matrícula
              </button>
              <button @click="createAnother" class="btn btn-outline">
                Nueva Matrícula
              </button>
              <button @click="goToList" class="btn btn-outline">
                Ir a Lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import studentService from '@/services/student.service'
import enrollmentService from '@/services/enrollment.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()

const steps = ['Seleccionar Estudiante', 'Grado/Sección', 'Revisar', 'Documentos', 'Pagar', 'Finalizar']
const currentStep = ref(1)
const añoEscolar = ref(2025)

// Step 1: Search Student
const searchDni = ref('')
const searchLoading = ref(false)
const searchError = ref(null)
const searchResults = ref([])
const selectedStudent = ref(null)

// Step 2: Select Section
const loadingSecciones = ref(false)
const errorSecciones = ref(null)
const secciones = ref([])
const selectedGrado = ref(null)
const selectedSeccion = ref(null)

// Step 3: Create Enrollment (without payment)
const creating = ref(false)
const createError = ref(null)
const montoMatricula = ref(500.00)

// Step 4: Upload Documents (Optional)
const documentosRequeridos = ref([])
const documentosSubidos = ref([])
const uploadingDocs = ref(false)

// Step 5: Payment
const metodoPago = ref('efectivo')
const paymentReference = ref('')
const paymentObservations = ref('')
const processingPayment = ref(false)
const paymentError = ref(null)
const paymentProcessed = ref(false)

// Step 6: Success
const createdEnrollment = ref(null)

// Computed
const gradosDisponibles = computed(() => {
  const grados = {}
  secciones.value.forEach(seccion => {
    if (!grados[seccion.grado_nombre]) {
      grados[seccion.grado_nombre] = {
        nombre: seccion.grado_nombre,
        grado_id: seccion.grado_id,
        total_vacantes: 0,
        total_secciones: 0
      }
    }
    grados[seccion.grado_nombre].total_vacantes += seccion.vacantes_disponibles
    grados[seccion.grado_nombre].total_secciones++
  })
  return Object.values(grados)
})

const seccionesFiltradas = computed(() => {
  if (!selectedGrado.value) return []
  return secciones.value.filter(s => s.grado_nombre === selectedGrado.value)
})

// Methods
const searchStudents = async () => {
  if (!searchDni.value || searchDni.value.length !== 8) {
    searchError.value = 'Debe ingresar un DNI válido de 8 dígitos'
    return
  }

  searchLoading.value = true
  searchError.value = null
  searchResults.value = []

  try {
    const response = await studentService.getAll({ dni: searchDni.value })
    if (response.data.data && response.data.data.length > 0) {
      searchResults.value = response.data.data
    } else {
      searchError.value = 'No se encontró ningún estudiante con ese DNI'
    }
  } catch (error) {
    searchError.value = error.response?.data?.message || 'Error al buscar estudiante'
    console.error('Error:', error)
  } finally {
    searchLoading.value = false
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
}

const selectGrado = async (gradoNombre) => {
  selectedGrado.value = gradoNombre
  selectedSeccion.value = null // Reset section when changing grade

  // Validar si el estudiante puede matricularse en este grado
  if (selectedStudent.value) {
    const grado = gradosDisponibles.value.find(g => g.nombre === gradoNombre)
    if (grado) {
      try {
        const response = await enrollmentService.validarGrado(selectedStudent.value.id, grado.grado_id)
        const validation = response.data.data

        if (!validation.valido) {
          // Mostrar advertencia pero permitir continuar
          if (confirm(`ADVERTENCIA: ${validation.mensaje}\n\n¿Desea continuar de todas formas?`)) {
            // Usuario confirmó, continuar
          } else {
            // Usuario canceló, deshacer selección
            selectedGrado.value = null
          }
        }
      } catch (error) {
        console.error('Error al validar grado:', error)
        // Continuar sin validación en caso de error
      }
    }
  }
}

const selectSeccion = (seccion) => {
  if (seccion.vacantes_disponibles > 0) {
    selectedSeccion.value = seccion
  }
}

const loadSecciones = async () => {
  loadingSecciones.value = true
  errorSecciones.value = null

  try {
    const response = await enrollmentService.getSeccionesConVacantes(añoEscolar.value)
    secciones.value = response.data.data || []
  } catch (error) {
    errorSecciones.value = error.response?.data?.message || 'Error al cargar secciones'
    console.error('Error:', error)
  } finally {
    loadingSecciones.value = false
  }
}

const createEnrollment = async () => {
  creating.value = true
  createError.value = null

  try {
    const enrollmentData = {
      estudiante_id: selectedStudent.value.id,
      seccion_id: selectedSeccion.value.id,
      año_escolar: añoEscolar.value,
      monto_total: montoMatricula.value
      // NO se incluye metodo_pago aquí - eso va en el paso 5
    }

    const response = await enrollmentService.create(enrollmentData)
    createdEnrollment.value = response.data.data

    // Cargar documentos requeridos para el paso 4
    await loadDocumentosRequeridos()

    currentStep.value = 4 // Ir al paso de documentos
  } catch (error) {
    createError.value = error.response?.data?.message || 'Error al crear matrícula'
    console.error('Error:', error)
  } finally {
    creating.value = false
  }
}

// Procesar pago (Paso 5)
const processPayment = async () => {
  processingPayment.value = true
  paymentError.value = null

  try {
    // Registrar el pago de la matrícula
    const paymentData = {
      enrollment_id: createdEnrollment.value.id,
      monto: montoMatricula.value,
      metodo_pago: metodoPago.value,
      concepto: 'Pago de Matrícula',
      referencia: paymentReference.value || null,
      observaciones: paymentObservations.value || null
    }

    // TODO: Implementar servicio de pagos
    // await paymentService.create(paymentData)

    // Simular respuesta exitosa
    console.log('Procesando pago:', paymentData)

    paymentProcessed.value = true
    currentStep.value = 6 // Ir a confirmación final
  } catch (error) {
    paymentError.value = error.response?.data?.message || 'Error al procesar el pago'
    console.error('Error:', error)
  } finally {
    processingPayment.value = false
  }
}

// Omitir pago (Paso 5)
const skipPayment = () => {
  paymentProcessed.value = false
  currentStep.value = 6 // Ir a confirmación final sin registrar pago
}

const nextStep = async () => {
  // Cargar secciones antes de avanzar al paso 2
  if (currentStep.value === 1) {
    await loadSecciones()
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const goToList = () => {
  router.push('/enrollments')
}

const goToEnrollment = () => {
  router.push(`/enrollments/${createdEnrollment.value.id}`)
}

const createAnother = () => {
  // Reset form
  currentStep.value = 1
  searchDni.value = ''
  searchResults.value = []
  selectedStudent.value = null
  selectedSeccion.value = null
  createdEnrollment.value = null
  searchError.value = null
  createError.value = null
}

// Métodos de pago disponibles
const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'deposito', label: 'Depósito', icon: '🏧' },
  { value: 'yape', label: 'Yape', icon: '📱' },
  { value: 'plin', label: 'Plin', icon: '💸' }
]

// Cargar documentos requeridos
const loadDocumentosRequeridos = async () => {
  try {
    const response = await enrollmentService.getDocumentosRequeridos()
    documentosRequeridos.value = response.data.data || [
      { id: 'dni', nombre: 'DNI o Partida de Nacimiento', obligatorio: true, subido: false },
      { id: 'certificado', nombre: 'Certificado de Estudios', obligatorio: true, subido: false },
      { id: 'foto', nombre: 'Foto tamaño carné', obligatorio: false, subido: false },
      { id: 'ficha', nombre: 'Ficha de Matrícula (firmada)', obligatorio: true, subido: false }
    ]
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    // Usar lista por defecto en caso de error
    documentosRequeridos.value = [
      { id: 'dni', nombre: 'DNI o Partida de Nacimiento', obligatorio: true, subido: false },
      { id: 'certificado', nombre: 'Certificado de Estudios', obligatorio: true, subido: false },
      { id: 'foto', nombre: 'Foto tamaño carné', obligatorio: false, subido: false },
      { id: 'ficha', nombre: 'Ficha de Matrícula (firmada)', obligatorio: true, subido: false }
    ]
  }
}

// Subir documento
const handleDocumentUpload = async (documentoId, event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validación de tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alert('El archivo excede el tamaño máximo de 5MB')
    return
  }

  uploadingDocs.value = true

  try {
    // Aquí iría la lógica de subida al servidor
    // Por ahora solo marcamos como subido
    const docIndex = documentosRequeridos.value.findIndex(d => d.id === documentoId)
    if (docIndex !== -1) {
      documentosRequeridos.value[docIndex].subido = true
      documentosRequeridos.value[docIndex].archivo = file.name
    }
  } catch (error) {
    console.error('Error al subir documento:', error)
    alert('Error al subir el documento')
  } finally {
    uploadingDocs.value = false
  }
}

// Saltar paso de documentos (opcional)
const skipDocuments = () => {
  currentStep.value = 5 // Ir a pago
}

// Continuar al paso de pago
const continueToPayment = () => {
  currentStep.value = 5 // Ir a pago
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  // Optional: Load sections on mount for better UX
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
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
  margin: 0.5rem 0 0 0;
}

/* Stepper */
.stepper-container {
  margin-bottom: 2rem;
}

.stepper {
  display: flex;
  justify-content: space-between;
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stepper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step-active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}

.step-completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  max-width: 120px;
}

.step-active .step-label {
  color: #111827;
  font-weight: 600;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.step-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-icon {
  font-size: 2rem;
}

.step-description {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 1rem;
}

.search-input-group .form-input {
  flex: 1;
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

/* Student Cards */
.search-results {
  margin-top: 2rem;
}

.student-cards {
  display: grid;
  gap: 1rem;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.student-card:hover {
  background: white;
  border-color: #667eea;
  transform: translateX(4px);
}

.student-card-selected {
  background: #ede9fe;
  border-color: #667eea;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.student-details {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.detail-badge {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: white;
  border-radius: 0.375rem;
  color: #6b7280;
  font-weight: 500;
}

.student-meta {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.student-check {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* Selected Student Banner */
.selected-student-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 0.75rem;
  margin-top: 1rem;
}

.banner-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.banner-title {
  font-weight: 600;
  margin: 0;
  font-size: 1rem;
}

.banner-text {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
}

/* Sections */
.sections-container {
  margin-bottom: 2rem;
}

.grade-group {
  margin-bottom: 2rem;
}

.grade-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* Grades Grid */
.grades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.grade-card {
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  position: relative;
}

.grade-card:hover {
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border-color: #667eea;
  transform: translateY(-8px);
  box-shadow: 0 12px 20px -5px rgba(102, 126, 234, 0.3);
}

.grade-card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.grade-card-disabled:hover {
  transform: none;
  box-shadow: none;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-color: #e5e7eb;
}

.grade-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.grade-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.grade-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grade-sections {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.grade-vacancies {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Selected Grade Banner */
.selected-grade-banner {
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border: 2px solid #667eea;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-icon {
  font-size: 2rem;
}

.banner-text {
  font-size: 1.125rem;
  color: #4a5568;
}

.btn-change {
  padding: 0.5rem 1rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-change:hover {
  background: #667eea;
  color: white;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.section-card {
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.section-card:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-card-selected {
  background: #ede9fe;
  border-color: #667eea;
}

.section-card-full {
  opacity: 0.6;
  cursor: not-allowed;
}

.section-card-full:hover {
  transform: none;
  box-shadow: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
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

.badge-danger {
  background: #ef4444;
  color: white;
}

.section-details p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.vacancy-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.75rem 0;
}

.vacancy-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.vacancy-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.section-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* Review Section */
.review-section {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.review-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.highlight-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.info-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.review-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-icon {
  font-size: 1.5rem;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.review-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
}

.capitalize {
  text-transform: capitalize;
}

/* Financial Summary */
.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.financial-label {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.financial-amount {
  font-size: 1.25rem;
  color: #111827;
  font-weight: 600;
}

.financial-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #fbbf24;
}

.financial-amount-total {
  font-size: 1.75rem;
  color: #111827;
  font-weight: 700;
}

.financial-note {
  margin: 1rem 0 0 0;
  font-size: 0.875rem;
  color: #92400e;
  font-style: italic;
}

/* Success */
.success-container {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin: 0 auto 1.5rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.success-message {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.enrollment-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  padding: 1rem 2rem;
  background: #ede9fe;
  border-radius: 0.5rem;
  display: inline-block;
  margin-bottom: 2rem;
  font-family: 'Courier New', monospace;
}

.success-details {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.success-details p {
  margin: 0.75rem 0;
  color: #111827;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
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

/* Payment Methods */
.payment-method-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.payment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.payment-method-card {
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.payment-method-card:hover {
  border-color: #667eea;
  background: #f9fafb;
  transform: translateY(-2px);
}

.payment-method-selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
}

.payment-radio {
  display: none;
}

.payment-icon {
  font-size: 2rem;
}

.payment-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

/* Documents Section */
.documents-container {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.document-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.document-uploaded {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.document-info {
  flex: 1;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.document-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.document-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-required {
  background: #fef3c7;
  color: #92400e;
}

.badge-optional {
  background: #e0e7ff;
  color: #3730a3;
}

.badge-success {
  background: #10b981;
  color: white;
}

.document-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.file-icon {
  font-size: 1.25rem;
}

.file-name {
  font-weight: 500;
}

.document-upload {
  margin-left: 1rem;
}

.upload-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.upload-disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.upload-disabled:hover {
  transform: none;
  box-shadow: none;
}

.file-input-hidden {
  display: none;
}

.documents-note {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #dbeafe;
  border: 2px solid #3b82f6;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.note-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.note-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.5rem 0;
}

.note-text {
  font-size: 0.875rem;
  color: #1e3a8a;
  margin: 0;
  line-height: 1.5;
}

/* Payment Summary Card (Step 5) */
.payment-summary-card {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.payment-summary-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.payment-summary-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
}

.summary-total {
  border-bottom: none;
  padding-top: 1.5rem;
  border-top: 2px solid #111827;
}

.summary-amount {
  font-size: 1.75rem;
  color: #10b981;
  font-weight: 700;
}

.payment-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-details-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 2rem 0;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.payment-note {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #dbeafe;
  border: 2px solid #3b82f6;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.success-note {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.badge-success {
  padding: 0.25rem 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-success {
  color: #10b981;
}

.text-warning {
  color: #f59e0b;
}

.text-danger {
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .stepper {
    padding: 1rem;
  }

  .step-label {
    font-size: 0.75rem;
    max-width: 80px;
  }

  .step-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .review-grid {
    grid-template-columns: 1fr;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }

  .search-input-group {
    flex-direction: column;
  }

  .step-actions {
    flex-direction: column;
  }

  .success-actions {
    flex-direction: column;
  }

  .payment-methods-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .document-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .document-upload {
    margin-left: 0;
  }
}
</style>
