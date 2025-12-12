<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">✅ Registrar Asistencia</h1>
          <p class="page-subtitle">Control de asistencia diaria - {{ fechaActual }}</p>
        </div>
        <button @click="guardarAsistencia" class="btn btn-primary">
          💾 Guardar Asistencia
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Grado y Sección</label>
            <select v-model="filtros.seccion" @change="cargarEstudiantes" class="filter-select">
              <option value="">Seleccionar sección...</option>
              <option v-for="seccion in secciones" :key="seccion.id" :value="seccion.id">
                {{ seccion.grado }} - Sección {{ seccion.nombre }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Fecha</label>
            <input v-model="filtros.fecha" type="date" class="filter-input" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Acción Rápida</label>
            <div class="quick-actions">
              <button @click="marcarTodos('presente')" class="btn-quick btn-presente">
                Todos Presentes
              </button>
              <button @click="marcarTodos('ausente')" class="btn-quick btn-ausente">
                Todos Ausentes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin sección seleccionada -->
      <div v-if="!filtros.seccion" class="card text-center py-12">
        <div class="empty-icon">👥</div>
        <h3 class="empty-title">Selecciona una sección</h3>
        <p class="empty-subtitle">Elige una sección para registrar la asistencia</p>
      </div>

      <!-- Registro de Asistencia -->
      <div v-else class="card">
        <div class="section-header">
          <h2 class="section-title">{{ getSeccionNombre(filtros.seccion) }} - {{ estudiantes.length }} estudiantes</h2>
          <div class="stats-quick">
            <span class="stat-quick stat-presente">✅ {{ contadorPresentes }}</span>
            <span class="stat-quick stat-tardanza">⏰ {{ contadorTardanzas }}</span>
            <span class="stat-quick stat-ausente">❌ {{ contadorAusentes }}</span>
          </div>
        </div>

        <div class="estudiantes-grid">
          <div
            v-for="estudiante in estudiantes"
            :key="estudiante.id"
            class="estudiante-card"
            :class="getEstudianteCardClass(estudiante.asistencia)"
          >
            <div class="estudiante-header">
              <div class="estudiante-avatar">{{ getIniciales(estudiante.nombre) }}</div>
              <div class="estudiante-info">
                <h4 class="estudiante-nombre">{{ estudiante.nombre }}</h4>
                <p class="estudiante-dni">DNI: {{ estudiante.dni }}</p>
              </div>
            </div>

            <div class="asistencia-opciones">
              <button
                @click="setAsistencia(estudiante, 'presente')"
                :class="['opcion-btn', { active: estudiante.asistencia === 'presente' }]"
                class="opcion-presente"
              >
                ✅ Presente
              </button>
              <button
                @click="setAsistencia(estudiante, 'tardanza')"
                :class="['opcion-btn', { active: estudiante.asistencia === 'tardanza' }]"
                class="opcion-tardanza"
              >
                ⏰ Tardanza
              </button>
              <button
                @click="setAsistencia(estudiante, 'ausente')"
                :class="['opcion-btn', { active: estudiante.asistencia === 'ausente' }]"
                class="opcion-ausente"
              >
                ❌ Ausente
              </button>
              <button
                @click="setAsistencia(estudiante, 'justificado')"
                :class="['opcion-btn', { active: estudiante.asistencia === 'justificado' }]"
                class="opcion-justificado"
              >
                📝 Justificado
              </button>
            </div>

            <div v-if="estudiante.asistencia !== 'presente' && estudiante.asistencia" class="observaciones-section">
              <textarea
                v-model="estudiante.observaciones"
                placeholder="Observaciones (opcional)..."
                class="obs-textarea"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="acciones-footer">
          <button @click="limpiarAsistencia" class="btn btn-outline">
            🗑️ Limpiar
          </button>
          <button @click="guardarAsistencia" class="btn btn-primary">
            💾 Guardar Asistencia
          </button>
        </div>
      </div>

      <!-- Toast -->
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
const secciones = ref([
  { id: 1, grado: '3° Secundaria', nombre: 'A' },
  { id: 2, grado: '4° Secundaria', nombre: 'B' },
  { id: 3, grado: '5° Secundaria', nombre: 'A' }
])

const filtros = ref({
  seccion: '',
  fecha: new Date().toISOString().split('T')[0]
})

const estudiantes = ref([])
const showToast = ref(false)
const toastMessage = ref('')

const estudiantesMock = {
  1: [
    { id: 1, nombre: 'Juan Pérez García', dni: '12345678', asistencia: '', observaciones: '' },
    { id: 2, nombre: 'María González López', dni: '23456789', asistencia: '', observaciones: '' },
    { id: 3, nombre: 'Carlos Ramírez Torres', dni: '34567890', asistencia: '', observaciones: '' },
    { id: 4, nombre: 'Ana Martínez Silva', dni: '45678901', asistencia: '', observaciones: '' },
    { id: 5, nombre: 'Luis Fernández Cruz', dni: '56789012', asistencia: '', observaciones: '' },
    { id: 6, nombre: 'Sofía Vargas Mendoza', dni: '67890123', asistencia: '', observaciones: '' }
  ],
  2: [
    { id: 7, nombre: 'Pedro Sánchez Flores', dni: '90123456', asistencia: '', observaciones: '' },
    { id: 8, nombre: 'Lucía Morales Vega', dni: '01234567', asistencia: '', observaciones: '' },
    { id: 9, nombre: 'Javier Núñez Gutiérrez', dni: '11223344', asistencia: '', observaciones: '' },
    { id: 10, nombre: 'Isabella Herrera Campos', dni: '22334455', asistencia: '', observaciones: '' }
  ],
  3: [
    { id: 11, nombre: 'Mateo Jiménez Ortiz', dni: '33445566', asistencia: '', observaciones: '' },
    { id: 12, nombre: 'Camila Ramos Paredes', dni: '44556677', asistencia: '', observaciones: '' },
    { id: 13, nombre: 'Sebastián Medina León', dni: '55667788', asistencia: '', observaciones: '' }
  ]
}

// Computed
const fechaActual = computed(() => {
  return new Date(filtros.value.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const contadorPresentes = computed(() => {
  return estudiantes.value.filter(e => e.asistencia === 'presente').length
})

const contadorTardanzas = computed(() => {
  return estudiantes.value.filter(e => e.asistencia === 'tardanza').length
})

const contadorAusentes = computed(() => {
  return estudiantes.value.filter(e => e.asistencia === 'ausente').length
})

// Methods
const cargarEstudiantes = () => {
  if (filtros.value.seccion) {
    estudiantes.value = JSON.parse(JSON.stringify(estudiantesMock[filtros.value.seccion] || []))
  } else {
    estudiantes.value = []
  }
}

const getSeccionNombre = (seccionId) => {
  const seccion = secciones.value.find(s => s.id == seccionId)
  return seccion ? `${seccion.grado} - Sección ${seccion.nombre}` : ''
}

const getIniciales = (nombre) => {
  const partes = nombre.split(' ')
  return partes.length >= 2 ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() : nombre.substring(0, 2).toUpperCase()
}

const setAsistencia = (estudiante, estado) => {
  estudiante.asistencia = estado
}

const marcarTodos = (estado) => {
  estudiantes.value.forEach(est => {
    est.asistencia = estado
  })
  mostrarToast(`Todos marcados como ${estado}`)
}

const limpiarAsistencia = () => {
  cargarEstudiantes()
  mostrarToast('Asistencia limpiada')
}

const guardarAsistencia = () => {
  if (!filtros.value.seccion) {
    mostrarToast('⚠️ Selecciona una sección')
    return
  }

  const sinRegistrar = estudiantes.value.filter(e => !e.asistencia).length
  if (sinRegistrar > 0) {
    mostrarToast(`⚠️ Faltan ${sinRegistrar} estudiantes por registrar`)
    return
  }

  mostrarToast('✅ Asistencia guardada exitosamente')
}

const getEstudianteCardClass = (asistencia) => {
  if (!asistencia) return ''
  return `card-${asistencia}`
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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

.filter-select,
.filter-input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-quick {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-presente {
  background: #d1fae5;
  color: #065f46;
}

.btn-ausente {
  background: #fee2e2;
  color: #991b1b;
}

.btn-quick:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stats-quick {
  display: flex;
  gap: 1rem;
}

.stat-quick {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.stat-presente {
  background: #d1fae5;
  color: #065f46;
}

.stat-tardanza {
  background: #fef3c7;
  color: #92400e;
}

.stat-ausente {
  background: #fee2e2;
  color: #991b1b;
}

.estudiantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.estudiante-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s;
}

.estudiante-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-presente {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.card-tardanza {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.card-ausente {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.card-justificado {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.estudiante-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.estudiante-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.estudiante-info {
  flex: 1;
}

.estudiante-nombre {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.estudiante-dni {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.asistencia-opciones {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.opcion-btn {
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.opcion-presente {
  color: #065f46;
}

.opcion-presente.active {
  background: #10b981;
  color: white;
  border-color: #059669;
}

.opcion-tardanza {
  color: #92400e;
}

.opcion-tardanza.active {
  background: #f59e0b;
  color: white;
  border-color: #d97706;
}

.opcion-ausente {
  color: #991b1b;
}

.opcion-ausente.active {
  background: #ef4444;
  color: white;
  border-color: #dc2626;
}

.opcion-justificado {
  color: #1e40af;
}

.opcion-justificado.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.opcion-btn:hover:not(.active) {
  transform: scale(1.05);
  border-color: currentColor;
}

.observaciones-section {
  margin-top: 0.75rem;
}

.obs-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  resize: vertical;
}

.obs-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.acciones-footer {
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

.text-center {
  text-align: center;
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

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .estudiantes-grid {
    grid-template-columns: 1fr;
  }

  .stats-quick {
    flex-wrap: wrap;
  }
}
</style>
