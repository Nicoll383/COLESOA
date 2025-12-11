<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">👨‍👩‍👧‍👦 Mis Hijos</h1>
        <p class="page-subtitle">Información de estudiantes a cargo</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card text-center py-12">
        <div class="loading-spinner"></div>
        <p class="mt-4 text-gray-600">Cargando información...</p>
      </div>

      <!-- Hijos List -->
      <div v-else-if="hijos.length > 0" class="hijos-grid">
        <div
          v-for="hijo in hijos"
          :key="hijo.id"
          class="hijo-card"
        >
          <!-- Header con foto y datos básicos -->
          <div class="hijo-header">
            <div class="hijo-foto-container">
              <img
                v-if="hijo.foto_url"
                :src="getFotoUrl(hijo.foto_url)"
                :alt="`Foto de ${hijo.nombres}`"
                class="hijo-foto"
              />
              <div v-else class="hijo-foto-placeholder">
                {{ getIniciales(hijo.nombres, hijo.apellidos) }}
              </div>
            </div>
            <div class="hijo-info">
              <h3 class="hijo-nombre">{{ hijo.nombres }} {{ hijo.apellidos }}</h3>
              <p class="hijo-detalle">
                <span class="detalle-label">DNI:</span>
                <span class="detalle-value">{{ hijo.dni }}</span>
              </p>
              <p class="hijo-detalle">
                <span class="detalle-label">Código:</span>
                <span class="detalle-value">{{ hijo.codigo_estudiante }}</span>
              </p>
              <p v-if="hijo.grado_nombre" class="hijo-detalle">
                <span class="detalle-label">Grado:</span>
                <span class="detalle-value">{{ hijo.grado_nombre }} "{{ hijo.seccion_nombre }}"</span>
              </p>
            </div>
          </div>

          <!-- Estado de matrícula -->
          <div v-if="hijo.matricula_id" class="matricula-status">
            <div class="status-badge" :class="getEstadoMatriculaClass(hijo.estado_matricula)">
              {{ getEstadoMatriculaLabel(hijo.estado_matricula) }}
            </div>
            <p class="text-xs text-gray-500">
              Año Escolar: {{ hijo.año_escolar }}
            </p>
          </div>
          <div v-else class="matricula-status">
            <div class="status-badge badge-warning">
              Sin matrícula activa
            </div>
          </div>

          <!-- Estadísticas de cuotas -->
          <div v-if="hijo.matricula_id" class="stats-section">
            <h4 class="stats-title">💰 Cuotas</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ hijo.total_cuotas || 0 }}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-item stat-warning">
                <div class="stat-value">{{ hijo.cuotas_pendientes || 0 }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat-item stat-danger">
                <div class="stat-value">{{ hijo.cuotas_vencidas || 0 }}</div>
                <div class="stat-label">Vencidas</div>
              </div>
            </div>
            <div class="monto-info">
              <div class="monto-row">
                <span class="monto-label">Pendiente:</span>
                <span class="monto-value monto-pendiente">S/ {{ formatMonto(hijo.monto_pendiente) }}</span>
              </div>
              <div class="monto-row">
                <span class="monto-label">Pagado:</span>
                <span class="monto-value monto-pagado">S/ {{ formatMonto(hijo.monto_pagado) }}</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas de documentos -->
          <div class="stats-section">
            <h4 class="stats-title">📄 Documentos</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ hijo.documentos_totales || 0 }}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-item stat-warning">
                <div class="stat-value">{{ hijo.documentos_pendientes || 0 }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat-item stat-success">
                <div class="stat-value">{{ hijo.documentos_aprobados || 0 }}</div>
                <div class="stat-label">Aprobados</div>
              </div>
              <div class="stat-item stat-danger">
                <div class="stat-value">{{ hijo.documentos_rechazados || 0 }}</div>
                <div class="stat-label">Rechazados</div>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="hijo-actions">
            <button
              @click="verCuotas(hijo)"
              class="btn btn-outline"
              :disabled="!hijo.matricula_id"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ver Cuotas
            </button>
            <button
              @click="verDocumentos(hijo)"
              class="btn btn-primary"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Subir Documentos
            </button>
          </div>
        </div>
      </div>

      <!-- No hay hijos -->
      <div v-else class="card text-center py-12">
        <div class="empty-icon">👨‍👩‍👧‍👦</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay estudiantes a cargo</h3>
        <p class="text-gray-600">No se encontraron estudiantes vinculados a su cuenta</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()
const hijos = ref([])
const loading = ref(false)

// Cargar hijos del padre
const cargarHijos = async () => {
  loading.value = true
  try {
    const response = await api.get('/padre/hijos')
    if (response.data.success) {
      hijos.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar hijos:', error)
    alert('Error al cargar la información de los estudiantes')
  } finally {
    loading.value = false
  }
}

// Navegar a cuotas
const verCuotas = (hijo) => {
  router.push({
    name: 'padre-cuotas',
    query: { estudiante: hijo.id }
  })
}

// Navegar a documentos
const verDocumentos = (hijo) => {
  router.push({
    name: 'padre-documentos',
    query: { estudiante: hijo.id }
  })
}

// Obtener URL de foto
const getFotoUrl = (fotoUrl) => {
  if (!fotoUrl) return ''
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${fotoUrl}`
}

// Obtener iniciales para placeholder
const getIniciales = (nombres, apellidos) => {
  const primerNombre = nombres.split(' ')[0]
  const primerApellido = apellidos.split(' ')[0]
  return `${primerNombre.charAt(0)}${primerApellido.charAt(0)}`.toUpperCase()
}

// Formatear montos
const formatMonto = (monto) => {
  if (!monto) return '0.00'
  return parseFloat(monto).toFixed(2)
}

// Obtener clase de estado de matrícula
const getEstadoMatriculaClass = (estado) => {
  const classes = {
    activo: 'badge-success',
    completado: 'badge-success',
    pendiente: 'badge-warning',
    observado: 'badge-danger'
  }
  return classes[estado] || 'badge-info'
}

// Obtener label de estado de matrícula
const getEstadoMatriculaLabel = (estado) => {
  const labels = {
    activo: 'Activo',
    completado: 'Completado',
    pendiente: 'Pendiente',
    observado: 'Observado'
  }
  return labels[estado] || estado
}

onMounted(() => {
  cargarHijos()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
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

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.text-center {
  text-align: center;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-gray-600 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-500 {
  color: #9ca3af;
}

.text-xs {
  font-size: 0.75rem;
}

.text-xl {
  font-size: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

/* Loading Spinner */
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

/* Hijos Grid */
.hijos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.hijo-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.hijo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Hijo Header */
.hijo-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #e5e7eb;
}

.hijo-foto-container {
  flex-shrink: 0;
}

.hijo-foto {
  width: 5rem;
  height: 5rem;
  border-radius: 0.75rem;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.hijo-foto-placeholder {
  width: 5rem;
  height: 5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.hijo-info {
  flex: 1;
  min-width: 0;
}

.hijo-nombre {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.hijo-detalle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}

.detalle-label {
  font-weight: 500;
  color: #9ca3af;
}

.detalle-value {
  font-weight: 600;
  color: #374151;
  margin-left: 0.5rem;
}

/* Matrícula Status */
.matricula-status {
  margin-bottom: 1rem;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

/* Stats Section */
.stats-section {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.stats-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: white;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

.stat-item.stat-warning {
  border-color: #fbbf24;
  background: #fffbeb;
}

.stat-item.stat-danger {
  border-color: #ef4444;
  background: #fef2f2;
}

.stat-item.stat-success {
  border-color: #10b981;
  background: #ecfdf5;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.625rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}

/* Monto Info */
.monto-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.monto-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.375rem;
}

.monto-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.monto-value {
  font-size: 0.875rem;
  font-weight: 700;
}

.monto-pendiente {
  color: #dc2626;
}

.monto-pagado {
  color: #059669;
}

/* Actions */
.hijo-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
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

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Empty State */
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .hijos-grid {
    grid-template-columns: 1fr;
  }

  .hijo-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .hijo-actions {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
