<template>
  <div class="docentes-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">👨‍🏫 Gestión de Docentes</h1>
        <p class="page-subtitle">Administra la información de los profesores del colegio</p>
      </div>
      <button @click="$router.push('/docentes/nuevo')" class="btn btn-primary">
        <span>➕</span> Nuevo Docente
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-grid">
        <div class="form-group">
          <label>🔍 Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nombre, DNI, email..."
            class="form-control"
            @input="debouncedSearch"
          />
        </div>

        <div class="form-group">
          <label>📊 Estado</label>
          <select v-model="filters.estado" @change="loadDocentes" class="form-control">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="licencia">En Licencia</option>
          </select>
        </div>

        <div class="form-group">
          <label>📚 Especialidad</label>
          <select v-model="filters.especialidad" @change="loadDocentes" class="form-control">
            <option value="">Todas</option>
            <option value="Matemática">Matemática</option>
            <option value="Comunicación">Comunicación</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Inglés">Inglés</option>
            <option value="Educación Física">Educación Física</option>
            <option value="Arte">Arte</option>
            <option value="Religión">Religión</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando docentes...</p>
    </div>

    <!-- Lista de Docentes -->
    <div v-else-if="docentes.length > 0" class="docentes-grid">
      <div
        v-for="docente in docentes"
        :key="docente.id"
        class="docente-card"
        @click="viewDocente(docente.id)"
      >
        <div class="docente-header">
          <div class="docente-avatar">
            <img
              v-if="docente.foto_url"
              :src="docente.foto_url"
              :alt="docente.nombre"
            />
            <span v-else class="avatar-placeholder">👨‍🏫</span>
          </div>
          <div class="docente-info">
            <h3 class="docente-name">{{ docente.nombre }} {{ docente.apellido }}</h3>
            <p class="docente-dni">DNI: {{ docente.dni }}</p>
          </div>
          <span :class="['status-badge', `status-${docente.estado}`]">
            {{ getEstadoLabel(docente.estado) }}
          </span>
        </div>

        <div class="docente-body">
          <div class="info-row">
            <span class="info-label">📚 Especialidad:</span>
            <span class="info-value">{{ docente.especialidad || 'No especificada' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📧 Email:</span>
            <span class="info-value">{{ docente.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📱 Teléfono:</span>
            <span class="info-value">{{ docente.telefono || 'No registrado' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Fecha de Ingreso:</span>
            <span class="info-value">{{ formatDate(docente.fecha_ingreso) }}</span>
          </div>
        </div>

        <div class="docente-footer">
          <button @click.stop="editDocente(docente.id)" class="btn-edit">
            ✏️ Editar
          </button>
          <button @click.stop="toggleEstado(docente)" class="btn-toggle">
            {{ docente.estado === 'activo' ? '🔴 Desactivar' : '🟢 Activar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="empty-icon">👨‍🏫</span>
      <h3>No se encontraron docentes</h3>
      <p>No hay docentes que coincidan con los filtros seleccionados</p>
      <button @click="clearFilters" class="btn btn-secondary">Limpiar Filtros</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const docentes = ref([])
const loading = ref(false)
const filters = ref({
  search: '',
  estado: '',
  especialidad: ''
})

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDocentes()
  }, 500)
}

const loadDocentes = async () => {
  loading.value = true
  try {
    // TODO: Implementar llamada API real
    // const response = await docenteService.getAll(filters.value)
    // docentes.value = response.data

    // Datos de prueba
    await new Promise(resolve => setTimeout(resolve, 500))
    docentes.value = [
      {
        id: 1,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        dni: '45678901',
        email: 'carlos.rodriguez@colegio.com',
        telefono: '987654321',
        especialidad: 'Matemática',
        estado: 'activo',
        fecha_ingreso: '2020-03-15',
        foto_url: null
      },
      {
        id: 2,
        nombre: 'Ana',
        apellido: 'García',
        dni: '56789012',
        email: 'ana.garcia@colegio.com',
        telefono: '987654322',
        especialidad: 'Comunicación',
        estado: 'activo',
        fecha_ingreso: '2019-02-10',
        foto_url: null
      }
    ]
  } catch (error) {
    console.error('Error al cargar docentes:', error)
    alert('Error al cargar la lista de docentes')
  } finally {
    loading.value = false
  }
}

const viewDocente = (id) => {
  router.push(`/docentes/${id}`)
}

const editDocente = (id) => {
  router.push(`/docentes/${id}/editar`)
}

const toggleEstado = async (docente) => {
  const nuevoEstado = docente.estado === 'activo' ? 'inactivo' : 'activo'
  if (confirm(`¿Está seguro de ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} a este docente?`)) {
    try {
      // TODO: Implementar llamada API real
      // await docenteService.updateEstado(docente.id, nuevoEstado)
      docente.estado = nuevoEstado
      alert('Estado actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error al actualizar el estado del docente')
    }
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    estado: '',
    especialidad: ''
  }
  loadDocentes()
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
  return new Date(date).toLocaleDateString('es-PE')
}

onMounted(() => {
  loadDocentes()
})
</script>

<style scoped>
.docentes-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 5px 0 0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #2563eb;
}

.filters-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-control {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
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

.docentes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.docente-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.docente-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.docente-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.docente-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.docente-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 24px;
}

.docente-info {
  flex: 1;
}

.docente-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.docente-dni {
  font-size: 13px;
  color: #6b7280;
  margin: 3px 0 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
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

.docente-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #1f2937;
}

.docente-footer {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.btn-edit,
.btn-toggle {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #eff6ff;
  color: #1e40af;
}

.btn-edit:hover {
  background: #dbeafe;
}

.btn-toggle {
  background: #f3f4f6;
  color: #374151;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #1f2937;
  margin: 0 0 10px;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 20px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
