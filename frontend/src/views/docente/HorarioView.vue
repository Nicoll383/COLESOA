<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📅 Mi Horario</h1>
          <p class="page-subtitle">Horario de clases asignadas</p>
        </div>
        <div class="header-actions">
          <button @click="imprimirHorario" class="btn btn-outline">
            🖨️ Imprimir
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card text-center py-8">
        <div class="loading-spinner"></div>
        <p class="text-gray-600 mt-4">Cargando horario...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Horario -->
      <div v-else class="card">
        <h2 class="section-title">Horario Semanal</h2>

        <!-- Leyenda -->
        <div class="legend-section">
          <div class="legend-item">
            <div class="legend-dot legend-clase"></div>
            <span>Clase Regular</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-taller"></div>
            <span>Taller/Lab</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-evaluacion"></div>
            <span>Evaluación</span>
          </div>
        </div>

        <!-- Tabla de Horario -->
        <div class="schedule-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="hour-column">Hora</th>
                <th v-for="dia in dias" :key="dia">{{ dia }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bloque in bloques" :key="bloque.hora">
                <td class="hour-cell">
                  <div class="hour-range">{{ bloque.inicio }} - {{ bloque.fin }}</div>
                </td>
                <td v-for="dia in dias" :key="dia" class="schedule-cell">
                  <div
                    v-if="getClase(dia, bloque.hora)"
                    class="class-card"
                    :class="getClaseClass(getClase(dia, bloque.hora))"
                    @click="verDetalleClase(getClase(dia, bloque.hora))"
                  >
                    <div class="class-header">
                      <span class="class-name">{{ getClase(dia, bloque.hora).curso }}</span>
                      <span class="class-time">{{ bloque.inicio }}</span>
                    </div>
                    <div class="class-body">
                      <div class="class-info">
                        <span class="class-grado">{{ getClase(dia, bloque.hora).grado }}</span>
                        <span class="class-seccion">Sec. {{ getClase(dia, bloque.hora).seccion }}</span>
                      </div>
                      <div class="class-aula">
                        <span class="aula-icon">🚪</span>
                        <span>{{ getClase(dia, bloque.hora).aula }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-cell">-</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resumen del día actual -->
        <div v-if="clasesHoy.length > 0" class="today-summary">
          <h3 class="today-title">📌 Clases de Hoy ({{ diaActual }})</h3>
          <div class="today-cards">
            <div
              v-for="clase in clasesHoy"
              :key="`${clase.dia}-${clase.hora}`"
              class="today-card"
            >
              <div class="today-card-header">
                <span class="today-time">{{ getBloqueInicio(clase.hora) }}</span>
                <span class="today-status" :class="{ 'status-active': esClaseActual(clase) }">
                  {{ esClaseActual(clase) ? '🔴 En curso' : '⚪ Programada' }}
                </span>
              </div>
              <h4 class="today-curso">{{ clase.curso }}</h4>
              <p class="today-details">{{ clase.grado }} - Sección {{ clase.seccion }} - Aula {{ clase.aula }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Detalle -->
      <div v-if="showDetalle" class="modal-overlay" @click="showDetalle = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Detalle de la Clase</h3>
            <button @click="showDetalle = false" class="modal-close">✕</button>
          </div>

          <div class="modal-body" v-if="selectedClase">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Curso:</span>
                <span class="detail-value">{{ selectedClase.curso }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Grado y Sección:</span>
                <span class="detail-value">{{ selectedClase.grado }} - Sec. {{ selectedClase.seccion }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Día:</span>
                <span class="detail-value">{{ selectedClase.dia }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Horario:</span>
                <span class="detail-value">{{ getBloqueInicio(selectedClase.hora) }} - {{ getBloqueFin(selectedClase.hora) }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Aula:</span>
                <span class="detail-value">{{ selectedClase.aula }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">{{ getTipoLabel(selectedClase.tipo) }}</span>
              </div>

              <div class="detail-item full-width" v-if="selectedClase.observaciones">
                <span class="detail-label">Observaciones:</span>
                <span class="detail-value">{{ selectedClase.observaciones }}</span>
              </div>
            </div>

            <div class="modal-actions">
              <button @click="irAEstudiantes(selectedClase)" class="btn btn-primary">
                Ver Estudiantes
              </button>
              <button @click="irAAsistencia(selectedClase)" class="btn btn-success">
                Registrar Asistencia
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
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()

const loading = ref(false)
const error = ref(null)
const horario = ref([])
const showDetalle = ref(false)
const selectedClase = ref(null)

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const bloques = [
  { hora: 1, inicio: '08:00', fin: '08:45' },
  { hora: 2, inicio: '08:45', fin: '09:30' },
  { hora: 3, inicio: '09:30', fin: '10:15' },
  { hora: 4, inicio: '10:30', fin: '11:15' },
  { hora: 5, inicio: '11:15', fin: '12:00' },
  { hora: 6, inicio: '12:00', fin: '12:45' },
  { hora: 7, inicio: '14:00', fin: '14:45' },
  { hora: 8, inicio: '14:45', fin: '15:30' }
]

const diaActual = computed(() => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[new Date().getDay()]
})

const clasesHoy = computed(() => {
  return horario.value.filter(clase => clase.dia === diaActual.value)
})

const cargarHorario = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/docente/horario')

    if (response.data.success) {
      horario.value = response.data.data || []
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar el horario'
  } finally {
    loading.value = false
  }
}

const getClase = (dia, hora) => {
  return horario.value.find(c => c.dia === dia && c.hora === hora)
}

const getClaseClass = (clase) => {
  if (!clase) return ''

  const tipoClasses = {
    clase: 'class-regular',
    taller: 'class-taller',
    evaluacion: 'class-evaluacion'
  }

  return tipoClasses[clase.tipo] || 'class-regular'
}

const getBloqueInicio = (hora) => {
  const bloque = bloques.find(b => b.hora === hora)
  return bloque ? bloque.inicio : ''
}

const getBloqueFin = (hora) => {
  const bloque = bloques.find(b => b.hora === hora)
  return bloque ? bloque.fin : ''
}

const getTipoLabel = (tipo) => {
  const labels = {
    clase: 'Clase Regular',
    taller: 'Taller/Laboratorio',
    evaluacion: 'Evaluación'
  }
  return labels[tipo] || tipo
}

const esClaseActual = (clase) => {
  const now = new Date()
  const horaActual = now.getHours() * 60 + now.getMinutes()
  const bloque = bloques.find(b => b.hora === clase.hora)

  if (!bloque) return false

  const [horaInicio, minInicio] = bloque.inicio.split(':').map(Number)
  const [horaFin, minFin] = bloque.fin.split(':').map(Number)
  const inicio = horaInicio * 60 + minInicio
  const fin = horaFin * 60 + minFin

  return horaActual >= inicio && horaActual <= fin
}

const verDetalleClase = (clase) => {
  selectedClase.value = clase
  showDetalle.value = true
}

const irAEstudiantes = (clase) => {
  router.push({
    name: 'DocenteEstudiantes',
    query: { grado: clase.grado, seccion: clase.seccion }
  })
}

const irAAsistencia = (clase) => {
  router.push({
    name: 'DocenteAsistencia',
    query: { grado: clase.grado, seccion: clase.seccion, curso: clase.curso }
  })
}

const imprimirHorario = () => {
  window.print()
}

onMounted(() => {
  cargarHorario()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1600px;
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
  margin-top: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
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

/* Legend */
.legend-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
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
}

.legend-clase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.legend-taller {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.legend-evaluacion {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* Schedule Table */
.schedule-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.schedule-table thead th {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-align: center;
}

.hour-column {
  width: 100px;
}

.hour-cell {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  text-align: center;
  vertical-align: middle;
}

.hour-range {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.schedule-cell {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  vertical-align: top;
  min-height: 80px;
  position: relative;
}

.class-card {
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.class-regular {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.class-taller {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.class-evaluacion {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.class-name {
  font-size: 0.875rem;
  font-weight: 700;
}

.class-time {
  font-size: 0.75rem;
  opacity: 0.9;
}

.class-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.class-info {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.95;
}

.class-grado,
.class-seccion {
  font-size: 0.75rem;
}

.class-aula {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.aula-icon {
  font-size: 0.875rem;
}

.empty-cell {
  text-align: center;
  color: #d1d5db;
  padding: 1rem;
}

/* Today Summary */
.today-summary {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.today-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.today-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.today-card {
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.today-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.today-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.today-time {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
}

.today-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #e5e7eb;
  color: #6b7280;
}

.status-active {
  background: #fee2e2;
  color: #dc2626;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.today-curso {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.today-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

/* Loading */
.loading-spinner {
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mt-4 {
  margin-top: 1rem;
}

/* Print Styles */
@media print {
  .header-actions,
  .today-summary,
  .btn {
    display: none !important;
  }

  .class-card {
    break-inside: avoid;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .legend-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .schedule-container {
    overflow-x: scroll;
  }

  .today-cards {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
