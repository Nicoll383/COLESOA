<template>
  <div class="docente-detail-container">
    <div class="page-header">
      <button @click="$router.back()" class="btn-back">← Volver</button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del docente...</p>
    </div>

    <div v-else-if="docente" class="detail-card">
      <!-- Header del docente -->
      <div class="docente-header">
        <div class="docente-avatar-large">
          <img
            v-if="docente.foto_url"
            :src="docente.foto_url"
            :alt="docente.nombre"
          />
          <span v-else class="avatar-placeholder">👨‍🏫</span>
        </div>
        <div class="docente-header-info">
          <h1 class="docente-name">{{ docente.nombre }} {{ docente.apellido }}</h1>
          <p class="docente-specialty">{{ docente.especialidad }}</p>
          <span :class="['status-badge', `status-${docente.estado}`]">
            {{ getEstadoLabel(docente.estado) }}
          </span>
        </div>
        <div class="header-actions">
          <button @click="editDocente" class="btn btn-primary">
            ✏️ Editar
          </button>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="info-section">
        <h2 class="section-title">👤 Información Personal</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">DNI</span>
            <span class="info-value">{{ docente.dni }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha de Nacimiento</span>
            <span class="info-value">{{ formatDate(docente.fecha_nacimiento) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Edad</span>
            <span class="info-value">{{ calculateAge(docente.fecha_nacimiento) }} años</span>
          </div>
        </div>
      </div>

      <!-- Información de Contacto -->
      <div class="info-section">
        <h2 class="section-title">📧 Información de Contacto</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">{{ docente.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Teléfono</span>
            <span class="info-value">{{ docente.telefono || 'No registrado' }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">Dirección</span>
            <span class="info-value">{{ docente.direccion || 'No registrada' }}</span>
          </div>
        </div>
      </div>

      <!-- Información Profesional -->
      <div class="info-section">
        <h2 class="section-title">📚 Información Profesional</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Especialidad</span>
            <span class="info-value">{{ docente.especialidad }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Título Profesional</span>
            <span class="info-value">{{ docente.titulo || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha de Ingreso</span>
            <span class="info-value">{{ formatDate(docente.fecha_ingreso) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Antigüedad</span>
            <span class="info-value">{{ calculateYears(docente.fecha_ingreso) }} años</span>
          </div>
        </div>
      </div>

      <!-- Cursos asignados (placeholder) -->
      <div class="info-section">
        <h2 class="section-title">📖 Cursos Asignados</h2>
        <p class="empty-message">Funcionalidad en desarrollo...</p>
      </div>

      <!-- Horario (placeholder) -->
      <div class="info-section">
        <h2 class="section-title">🕐 Horario</h2>
        <p class="empty-message">Funcionalidad en desarrollo...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const docente = ref(null)
const loading = ref(false)

const loadDocente = async () => {
  loading.value = true
  try {
    // TODO: Implementar llamada API real
    // const response = await docenteService.getById(route.params.id)
    // docente.value = response.data

    // Datos de prueba
    await new Promise(resolve => setTimeout(resolve, 500))
    docente.value = {
      id: route.params.id,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      dni: '45678901',
      fecha_nacimiento: '1985-06-15',
      email: 'carlos.rodriguez@colegio.com',
      telefono: '987654321',
      direccion: 'Av. Los Educadores 123, San Miguel',
      especialidad: 'Matemática',
      titulo: 'Licenciado en Matemática - Universidad Nacional Mayor de San Marcos',
      fecha_ingreso: '2020-03-15',
      estado: 'activo',
      foto_url: null
    }
  } catch (error) {
    console.error('Error al cargar docente:', error)
    alert('Error al cargar los datos del docente')
    router.back()
  } finally {
    loading.value = false
  }
}

const editDocente = () => {
  router.push(`/docentes/${route.params.id}/editar`)
}

const getEstadoLabel = (estado) => {
  const labels = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    licencia: 'En Licencia'
  }
  return labels[estado] || estado
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (birthDate) => {
  if (!birthDate) return '-'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const calculateYears = (startDate) => {
  if (!startDate) return '-'
  const today = new Date()
  const start = new Date(startDate)
  let years = today.getFullYear() - start.getFullYear()
  const monthDiff = today.getMonth() - start.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) {
    years--
  }
  return years
}

onMounted(() => {
  loadDocente()
})
</script>

<style scoped>
.docente-detail-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.btn-back {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-back:hover {
  background: #e5e7eb;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.docente-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 30px;
}

.docente-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.docente-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 48px;
}

.docente-header-info {
  flex: 1;
}

.docente-name {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 5px;
}

.docente-specialty {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 10px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-activo {
  background: #d1fae5;
  color: #065f46;
}

.status-inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.status-licencia {
  background: #fef3c7;
  color: #92400e;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.info-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
}

.empty-message {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}
</style>
