<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">💳 Registrar Pago</h1>
        <p class="page-subtitle">Registro de pagos de matrículas y cuotas mensuales</p>
      </div>

      <!-- Buscador de Estudiante/Matrícula -->
      <div class="card mb-6">
        <h2 class="section-title">1. Buscar Estudiante</h2>

        <div class="search-section">
          <div class="search-input-group">
            <input
              v-model="searchTerm"
              @keyup.enter="buscarEstudiante"
              type="text"
              class="search-input"
              placeholder="Buscar por DNI, código de estudiante o matrícula..."
            />
            <button @click="buscarEstudiante" :disabled="searching" class="btn btn-primary">
              <span v-if="searching">Buscando...</span>
              <span v-else>🔍 Buscar</span>
            </button>
          </div>

          <!-- Resultados de búsqueda -->
          <div v-if="resultadosBusqueda.length > 0" class="search-results">
            <h4 class="subsection-title">Resultados de búsqueda ({{ resultadosBusqueda.length }})</h4>
            <div v-for="est in resultadosBusqueda" :key="est.id"
                 class="student-card"
                 :class="{ 'student-selected': estudiante?.id === est.id }"
                 @click="seleccionarEstudiante(est)">
              <div class="student-info">
                <h3 class="student-name">{{ est.nombres }} {{ est.apellidos }}</h3>
                <p class="student-detail"><strong>DNI:</strong> {{ est.dni }}</p>
                <p class="student-detail"><strong>Código:</strong> {{ est.codigo_estudiante }}</p>
              </div>
              <span v-if="estudiante?.id === est.id" class="badge-selected">✓ Seleccionado</span>
            </div>
            <button @click="limpiarBusqueda" class="btn btn-outline btn-sm mt-3">Limpiar Búsqueda</button>
          </div>

          <div v-if="matriculas.length > 0" class="matriculas-list">
            <h4 class="subsection-title">Matrículas del Estudiante</h4>
            <div class="matricula-card" v-for="mat in matriculas" :key="mat.id"
                 @click="seleccionarMatricula(mat)"
                 :class="{ 'matricula-selected': matriculaSeleccionada?.id === mat.id }">
              <div>
                <p class="matricula-codigo">{{ mat.codigo_matricula }}</p>
                <p class="matricula-detail">{{ mat.año_escolar }} - {{ mat.grado_nombre }} "{{ mat.seccion_nombre }}"</p>
              </div>
              <span class="matricula-estado" :class="`estado-${mat.estado}`">
                {{ mat.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de Pago -->
      <div v-if="matriculaSeleccionada" class="card">
        <h2 class="section-title">2. Datos del Pago</h2>

        <div class="form-grid">
          <!-- Tipo de Pago -->
          <div class="form-group col-span-2">
            <label class="form-label">Tipo de Pago *</label>
            <select v-model="formData.tipo_pago" class="form-select">
              <option value="matricula">Matrícula</option>
              <option value="cuota">Cuota Mensual</option>
              <option value="pension">Pensión</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <!-- Concepto -->
          <div class="form-group col-span-2">
            <label class="form-label">Concepto *</label>
            <input v-model="formData.concepto" type="text" class="form-input"
                   placeholder="Ej: Cuota de Marzo 2025" />
          </div>

          <!-- Monto -->
          <div class="form-group">
            <label class="form-label">Monto (S/.) *</label>
            <input v-model="formData.monto" type="number" step="0.01" class="form-input"
                   placeholder="0.00" />
          </div>

          <!-- Método de Pago -->
          <div class="form-group">
            <label class="form-label">Método de Pago *</label>
            <select v-model="formData.metodo_pago" class="form-select">
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="deposito">Depósito</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
          </div>

          <!-- Formulario de Tarjeta si es necesario -->
          <div v-if="formData.metodo_pago === 'tarjeta'" class="col-span-2 card-form-section">
            <h4 class="subsection-title">Datos de Tarjeta</h4>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label class="form-label">Número de Tarjeta *</label>
                <input v-model="cardData.numero_tarjeta" type="text" maxlength="19"
                       @input="formatCardNumber" class="form-input"
                       placeholder="1234 5678 9012 3456" />
              </div>
              <div class="form-group">
                <label class="form-label">Titular *</label>
                <input v-model="cardData.titular" type="text" class="form-input"
                       placeholder="Nombre en tarjeta" />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha Venc. *</label>
                <input v-model="cardData.fecha_vencimiento" type="text" maxlength="5"
                       @input="formatExpiryDate" class="form-input"
                       placeholder="MM/AA" />
              </div>
              <div class="form-group">
                <label class="form-label">CVV *</label>
                <input v-model="cardData.cvv" type="text" maxlength="4"
                       @input="formatCVV" class="form-input"
                       placeholder="123" />
              </div>
            </div>
          </div>

          <!-- Número de Operación -->
          <div class="form-group">
            <label class="form-label">Número de Operación</label>
            <input v-model="formData.numero_operacion" type="text" class="form-input"
                   placeholder="Opcional" />
          </div>

          <!-- Observaciones -->
          <div class="form-group col-span-2">
            <label class="form-label">Observaciones</label>
            <textarea v-model="formData.observaciones" class="form-textarea" rows="3"
                      placeholder="Notas adicionales..."></textarea>
          </div>
        </div>

        <!-- Nota de aprobación -->
        <div v-if="formData.metodo_pago === 'efectivo'" class="alert alert-success mt-4">
          ✅ Los pagos en efectivo se aprueban automáticamente.
        </div>
        <div v-if="formData.metodo_pago === 'deposito' || formData.metodo_pago === 'transferencia'"
             class="alert alert-warning mt-4">
          ⏳ Este pago quedará pendiente de validación.
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <button @click="limpiarFormulario" class="btn btn-outline" :disabled="processing">
            Cancelar
          </button>
          <button @click="registrarPago" class="btn btn-success" :disabled="processing || !formularioValido">
            <span v-if="processing">Registrando...</span>
            <span v-else>💰 Registrar Pago</span>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'
import paymentService from '@/services/payment.service'

const router = useRouter()

const searchTerm = ref('')
const searching = ref(false)
const resultadosBusqueda = ref([])
const estudiante = ref(null)
const matriculas = ref([])
const matriculaSeleccionada = ref(null)

const processing = ref(false)

const formData = ref({
  tipo_pago: 'cuota',
  concepto: '',
  monto: '',
  metodo_pago: 'efectivo',
  numero_operacion: '',
  observaciones: ''
})

const cardData = ref({
  numero_tarjeta: '',
  titular: '',
  fecha_vencimiento: '',
  cvv: ''
})

const formularioValido = computed(() => {
  if (!matriculaSeleccionada.value) return false
  if (!formData.value.concepto || !formData.value.monto) return false

  if (formData.value.metodo_pago === 'tarjeta') {
    return cardData.value.numero_tarjeta && cardData.value.titular &&
           cardData.value.fecha_vencimiento && cardData.value.cvv
  }

  return true
})

const buscarEstudiante = async () => {
  if (!searchTerm.value || searchTerm.value.length < 3) {
    alert('Ingrese al menos 3 caracteres para buscar')
    return
  }

  searching.value = true
  try {
    // Buscar estudiante
    const response = await api.get('/students', {
      params: { search: searchTerm.value }
    })

    if (response.data.data && response.data.data.length > 0) {
      resultadosBusqueda.value = response.data.data
    } else {
      resultadosBusqueda.value = []
      alert('No se encontró ningún estudiante con ese criterio')
    }
  } catch (error) {
    console.error('Error en búsqueda:', error)
    alert('Error al buscar estudiante')
  } finally {
    searching.value = false
  }
}

const seleccionarEstudiante = async (est) => {
  estudiante.value = est

  try {
    // Buscar matrícula del año actual del estudiante
    const currentYear = new Date().getFullYear()
    const matriculasResp = await api.get('/enrollments', {
      params: {
        estudiante_id: est.id,
        año_escolar: currentYear
      }
    })

    // Filtrar solo la matrícula del año actual
    const matriculasData = matriculasResp.data.data || []
    matriculas.value = matriculasData.filter(m => m.año_escolar === currentYear)

    if (matriculas.value.length === 0) {
      alert(`El estudiante no tiene matrícula registrada para el año ${currentYear}`)
    }
  } catch (error) {
    console.error('Error al obtener matrículas:', error)
    alert('Error al obtener las matrículas del estudiante')
  }
}

const seleccionarMatricula = (matricula) => {
  matriculaSeleccionada.value = matricula

  // Pre-llenar datos si es matrícula
  if (formData.value.tipo_pago === 'matricula') {
    formData.value.concepto = `Matrícula ${matricula.año_escolar}`
    formData.value.monto = matricula.monto_total || ''
  }
}

const limpiarBusqueda = () => {
  searchTerm.value = ''
  resultadosBusqueda.value = []
  estudiante.value = null
  matriculas.value = []
  matriculaSeleccionada.value = null
  limpiarFormulario()
}

const limpiarFormulario = () => {
  formData.value = {
    tipo_pago: 'cuota',
    concepto: '',
    monto: '',
    metodo_pago: 'efectivo',
    numero_operacion: '',
    observaciones: ''
  }
  cardData.value = {
    numero_tarjeta: '',
    titular: '',
    fecha_vencimiento: '',
    cvv: ''
  }
}

const registrarPago = async () => {
  processing.value = true

  try {
    const paymentData = {
      matricula_id: matriculaSeleccionada.value.id,
      tipo_pago: formData.value.tipo_pago,
      concepto: formData.value.concepto,
      monto: parseFloat(formData.value.monto),
      metodo_pago: formData.value.metodo_pago,
      numero_operacion: formData.value.numero_operacion || null,
      observaciones: formData.value.observaciones || null
    }

    // Si es pago con tarjeta, incluir datos
    if (formData.value.metodo_pago === 'tarjeta') {
      paymentData.datos_tarjeta = {
        numero_tarjeta: cardData.value.numero_tarjeta.replace(/\s/g, ''),
        titular: cardData.value.titular,
        fecha_vencimiento: cardData.value.fecha_vencimiento,
        cvv: cardData.value.cvv
      }
    }

    const response = await paymentService.create(paymentData)

    if (response.data.success) {
      const resultado = response.data.data
      alert(resultado.mensaje || 'Pago registrado exitosamente')

      // Preguntar si desea registrar otro pago
      if (confirm('¿Desea registrar otro pago?')) {
        limpiarFormulario()
      } else {
        router.push('/finanzas/historial')
      }
    }
  } catch (error) {
    console.error('Error al registrar pago:', error)
    alert(error.response?.data?.message || 'Error al registrar el pago')
  } finally {
    processing.value = false
  }
}

// Formatters
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '')
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
  cardData.value.numero_tarjeta = formattedValue
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  cardData.value.fecha_vencimiento = value
}

const formatCVV = (event) => {
  cardData.value.cvv = event.target.value.replace(/\D/g, '')
}
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

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

/* Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-input-group {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Search Results */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

/* Student Card */
.student-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.student-selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
}

.badge-selected {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.student-detail {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

/* Matriculas List */
.matriculas-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.matricula-card {
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.matricula-card:hover {
  border-color: #667eea;
  background: white;
}

.matricula-selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
}

.matricula-codigo {
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.matricula-detail {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.matricula-estado {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.estado-activo {
  background: #d1fae5;
  color: #065f46;
}

.estado-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.estado-completado {
  background: #dbeafe;
  color: #1e40af;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.col-span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
}

/* Card Form Section */
.card-form-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 0.75rem;
  border: 2px solid #d1d5db;
}

/* Alerts */
.alert {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1;
  }

  .search-input-group {
    flex-direction: column;
  }

  .student-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

