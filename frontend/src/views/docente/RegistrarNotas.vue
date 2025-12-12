<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📝 Registrar Notas</h1>
        <p class="page-subtitle">Registro y actualización de calificaciones</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Curso</label>
            <select v-model="filtros.curso" @change="cargarEstudiantes" class="filter-select">
              <option value="">Seleccionar curso...</option>
              <option v-for="curso in cursos" :key="curso.id" :value="curso.id">
                {{ curso.nombre }} - {{ curso.grado }} {{ curso.seccion }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Período</label>
            <select v-model="filtros.periodo" class="filter-select">
              <option value="1">1er Bimestre</option>
              <option value="2">2do Bimestre</option>
              <option value="3">3er Bimestre</option>
              <option value="4">4to Bimestre</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Tipo de Evaluación</label>
            <select v-model="filtros.tipoEvaluacion" class="filter-select">
              <option value="examen">Examen</option>
              <option value="practica">Práctica</option>
              <option value="tarea">Tarea</option>
              <option value="participacion">Participación</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estado cuando no hay curso seleccionado -->
      <div v-if="!filtros.curso" class="card text-center py-12">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">Selecciona un curso</h3>
        <p class="empty-subtitle">Elige un curso para comenzar a registrar notas</p>
      </div>

      <!-- Tabla de Notas -->
      <div v-else class="card">
        <div class="section-header">
          <h2 class="section-title">Registro de Notas - {{ getCursoNombre(filtros.curso) }}</h2>
          <button @click="guardarNotas" class="btn btn-primary">
            💾 Guardar Notas
          </button>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">Total Estudiantes:</span>
            <span class="stat-value">{{ estudiantes.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Promedio General:</span>
            <span class="stat-value">{{ promedioGeneral.toFixed(1) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Aprobados:</span>
            <span class="stat-value text-success">{{ estudiantesAprobados }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Desaprobados:</span>
            <span class="stat-value text-danger">{{ estudiantesDesaprobados }}</span>
          </div>
        </div>

        <!-- Tabla -->
        <div class="table-container">
          <table class="notas-table">
            <thead>
              <tr>
                <th class="sticky-col">#</th>
                <th class="sticky-col">Estudiante</th>
                <th>DNI</th>
                <th>Nota Actual</th>
                <th>Nueva Nota</th>
                <th>Observaciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(estudiante, index) in estudiantes" :key="estudiante.id">
                <td class="sticky-col text-center">{{ index + 1 }}</td>
                <td class="sticky-col">
                  <div class="estudiante-cell">
                    <div class="estudiante-avatar">{{ getIniciales(estudiante.nombre) }}</div>
                    <span>{{ estudiante.nombre }}</span>
                  </div>
                </td>
                <td>{{ estudiante.dni }}</td>
                <td class="text-center">
                  <span :class="['nota-badge', getNotaClass(estudiante.notaActual)]">
                    {{ estudiante.notaActual || '-' }}
                  </span>
                </td>
                <td>
                  <input
                    v-model.number="estudiante.nuevaNota"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    class="nota-input"
                    :class="{ 'nota-modified': estudiante.nuevaNota !== estudiante.notaActual }"
                    @input="validarNota(estudiante)"
                  />
                </td>
                <td>
                  <input
                    v-model="estudiante.observaciones"
                    type="text"
                    class="obs-input"
                    placeholder="Opcional..."
                    maxlength="200"
                  />
                </td>
                <td class="text-center">
                  <span v-if="estudiante.nuevaNota" :class="['estado-badge', getEstadoClass(estudiante.nuevaNota)]">
                    {{ getEstadoLabel(estudiante.nuevaNota) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Acciones de lote -->
        <div class="bulk-actions">
          <button @click="limpiarNotas" class="btn btn-outline">
            🗑️ Limpiar Cambios
          </button>
          <button @click="guardarNotas" class="btn btn-primary">
            💾 Guardar Notas
          </button>
        </div>
      </div>

      <!-- Toast de confirmación -->
      <div v-if="showToast" class="toast">
        <span class="toast-icon">✅</span>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

// DATOS MOCK
const cursos = ref([
  { id: 1, nombre: 'Matemáticas', grado: '3°', seccion: 'A' },
  { id: 2, nombre: 'Física', grado: '4°', seccion: 'B' },
  { id: 3, nombre: 'Álgebra', grado: '5°', seccion: 'A' }
])

const filtros = ref({
  curso: '',
  periodo: '1',
  tipoEvaluacion: 'examen'
})

const estudiantes = ref([])
const showToast = ref(false)
const toastMessage = ref('')

// Datos mock de estudiantes
const estudiantesMock = {
  1: [ // Matemáticas 3° A
    { id: 1, nombre: 'Juan Pérez García', dni: '12345678', notaActual: 16, nuevaNota: 16, observaciones: '' },
    { id: 2, nombre: 'María González López', dni: '23456789', notaActual: 18, nuevaNota: 18, observaciones: '' },
    { id: 3, nombre: 'Carlos Ramírez Torres', dni: '34567890', notaActual: 13, nuevaNota: 13, observaciones: '' },
    { id: 4, nombre: 'Ana Martínez Silva', dni: '45678901', notaActual: 15, nuevaNota: 15, observaciones: '' },
    { id: 5, nombre: 'Luis Fernández Cruz', dni: '56789012', notaActual: 17, nuevaNota: 17, observaciones: '' },
    { id: 6, nombre: 'Sofía Vargas Mendoza', dni: '67890123', notaActual: 14, nuevaNota: 14, observaciones: '' },
    { id: 7, nombre: 'Diego Castro Ruiz', dni: '78901234', notaActual: 12, nuevaNota: 12, observaciones: '' },
    { id: 8, nombre: 'Valentina Rojas Díaz', dni: '89012345', notaActual: 19, nuevaNota: 19, observaciones: '' }
  ],
  2: [ // Física 4° B
    { id: 9, nombre: 'Pedro Sánchez Flores', dni: '90123456', notaActual: 15, nuevaNota: 15, observaciones: '' },
    { id: 10, nombre: 'Lucía Morales Vega', dni: '01234567', notaActual: 17, nuevaNota: 17, observaciones: '' },
    { id: 11, nombre: 'Javier Núñez Gutiérrez', dni: '11223344', notaActual: 14, nuevaNota: 14, observaciones: '' },
    { id: 12, nombre: 'Isabella Herrera Campos', dni: '22334455', notaActual: 16, nuevaNota: 16, observaciones: '' }
  ],
  3: [ // Álgebra 5° A
    { id: 13, nombre: 'Mateo Jiménez Ortiz', dni: '33445566', notaActual: 18, nuevaNota: 18, observaciones: '' },
    { id: 14, nombre: 'Camila Ramos Paredes', dni: '44556677', notaActual: 17, nuevaNota: 17, observaciones: '' },
    { id: 15, nombre: 'Sebastián Medina León', dni: '55667788', notaActual: 16, nuevaNota: 16, observaciones: '' }
  ]
}

// Computed
const promedioGeneral = computed(() => {
  if (estudiantes.value.length === 0) return 0
  const suma = estudiantes.value.reduce((acc, est) => acc + (est.nuevaNota || est.notaActual || 0), 0)
  return suma / estudiantes.value.length
})

const estudiantesAprobados = computed(() => {
  return estudiantes.value.filter(est => (est.nuevaNota || est.notaActual) >= 11).length
})

const estudiantesDesaprobados = computed(() => {
  return estudiantes.value.filter(est => (est.nuevaNota || est.notaActual) < 11).length
})

// Methods
const cargarEstudiantes = () => {
  if (filtros.value.curso) {
    estudiantes.value = JSON.parse(JSON.stringify(estudiantesMock[filtros.value.curso] || []))
  } else {
    estudiantes.value = []
  }
}

const getCursoNombre = (cursoId) => {
  const curso = cursos.value.find(c => c.id == cursoId)
  return curso ? `${curso.nombre} ${curso.grado} ${curso.seccion}` : ''
}

const getIniciales = (nombre) => {
  const partes = nombre.split(' ')
  return partes.length >= 2 ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() : nombre.substring(0, 2).toUpperCase()
}

const getNotaClass = (nota) => {
  if (!nota) return 'nota-none'
  if (nota >= 16) return 'nota-excelente'
  if (nota >= 14) return 'nota-bueno'
  if (nota >= 11) return 'nota-regular'
  return 'nota-desaprobado'
}

const getEstadoClass = (nota) => {
  if (nota >= 11) return 'estado-aprobado'
  return 'estado-desaprobado'
}

const getEstadoLabel = (nota) => {
  return nota >= 11 ? 'Aprobado' : 'Desaprobado'
}

const validarNota = (estudiante) => {
  if (estudiante.nuevaNota < 0) estudiante.nuevaNota = 0
  if (estudiante.nuevaNota > 20) estudiante.nuevaNota = 20
}

const limpiarNotas = () => {
  cargarEstudiantes()
  mostrarToast('Cambios descartados')
}

const guardarNotas = () => {
  // Simular guardado
  mostrarToast('✅ Notas guardadas exitosamente')

  // Actualizar notas actuales
  estudiantes.value.forEach(est => {
    if (est.nuevaNota !== undefined) {
      est.notaActual = est.nuevaNota
    }
  })
}

const mostrarToast = (mensaje) => {
  toastMessage.value = mensaje
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1600px;
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

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.text-success {
  color: #10b981;
}

.text-danger {
  color: #ef4444;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.notas-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.notas-table th {
  text-align: left;
  padding: 0.75rem;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.notas-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.sticky-col {
  position: sticky;
  left: 0;
  background: white;
  z-index: 10;
}

.sticky-col:first-child {
  left: 0;
}

.sticky-col:nth-child(2) {
  left: 50px;
}

.text-center {
  text-align: center;
}

.estudiante-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estudiante-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.nota-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-block;
}

.nota-excelente {
  background: #d1fae5;
  color: #065f46;
}

.nota-bueno {
  background: #dbeafe;
  color: #1e40af;
}

.nota-regular {
  background: #fef3c7;
  color: #92400e;
}

.nota-desaprobado {
  background: #fee2e2;
  color: #991b1b;
}

.nota-none {
  background: #f3f4f6;
  color: #6b7280;
}

.nota-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
}

.nota-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.nota-modified {
  border-color: #10b981;
  background: #ecfdf5;
}

.obs-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.obs-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.estado-aprobado {
  background: #d1fae5;
  color: #065f46;
}

.estado-desaprobado {
  background: #fee2e2;
  color: #991b1b;
}

.bulk-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: #6b7280;
  margin: 0;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  font-size: 1.25rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
  }

  .table-container {
    overflow-x: scroll;
  }

  .notas-table {
    min-width: 800px;
  }
}
</style>
