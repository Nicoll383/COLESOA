<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Secciones</h1>
          <p class="page-subtitle">Administrar grados y secciones del año escolar</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          + Nueva Sección
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Año Escolar</label>
            <input
              v-model="filters.año_escolar"
              type="number"
              class="form-input"
              placeholder="2025"
              @change="loadSecciones"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Grado</label>
            <select v-model="filters.grado_id" @change="loadSecciones" class="form-input">
              <option value="">Todos los grados</option>
              <option v-for="grado in grados" :key="grado.id" :value="grado.id">
                {{ grado.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Turno</label>
            <select v-model="filters.turno" @change="loadSecciones" class="form-input">
              <option value="">Todos</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando secciones...</p>
      </div>

      <!-- Secciones agrupadas por grado -->
      <div v-else-if="seccionesPorGrado && Object.keys(seccionesPorGrado).length > 0" class="grados-container">
        <div v-for="(secciones, gradoNombre) in seccionesPorGrado" :key="gradoNombre" class="grado-section">
          <h2 class="grado-title">{{ gradoNombre }}</h2>
          <div class="secciones-grid">
            <div
              v-for="seccion in secciones"
              :key="seccion.id"
              class="seccion-card"
              :class="{
                'card-full': seccion.vacantes_disponibles === 0,
                'card-warning': seccion.vacantes_disponibles > 0 && seccion.vacantes_disponibles <= 5
              }"
            >
              <div class="card-header-seccion">
                <div class="seccion-name">
                  <h3>Sección {{ seccion.nombre }}</h3>
                  <span class="seccion-aula">{{ seccion.aula }}</span>
                </div>
                <div class="dropdown">
                  <button @click="toggleDropdown(seccion.id)" class="btn-icon">⋮</button>
                  <div v-if="activeDropdown === seccion.id" class="dropdown-menu">
                    <button @click="editSeccion(seccion)" class="dropdown-item">✏️ Editar</button>
                    <button @click="verEstudiantes(seccion)" class="dropdown-item">👥 Estudiantes</button>
                    <button
                      v-if="canDelete"
                      @click="deleteSeccion(seccion)"
                      class="dropdown-item text-red"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body-seccion">
                <div class="info-row">
                  <span class="info-icon">👨‍🏫</span>
                  <span class="info-text">
                    {{ seccion.docente_nombre ? `${seccion.docente_nombre} ${seccion.docente_apellido}` : 'Sin docente' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-icon">☀️</span>
                  <span class="info-text capitalize">{{ seccion.turno }}</span>
                </div>
                <div class="info-row">
                  <span class="info-icon">📅</span>
                  <span class="info-text">Año {{ seccion.año_escolar }}</span>
                </div>

                <div class="vacantes-section">
                  <div class="vacantes-header">
                    <span class="vacantes-label">Vacantes</span>
                    <span
                      class="vacantes-badge"
                      :class="{
                        'badge-success': seccion.vacantes_disponibles > 10,
                        'badge-warning': seccion.vacantes_disponibles > 0 && seccion.vacantes_disponibles <= 10,
                        'badge-danger': seccion.vacantes_disponibles === 0
                      }"
                    >
                      {{ seccion.vacantes_disponibles }} disponibles
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${(seccion.matriculados / seccion.capacidad) * 100}%` }"
                    ></div>
                  </div>
                  <div class="vacantes-text">
                    {{ seccion.matriculados }} / {{ seccion.capacidad }} matriculados
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">No hay secciones</h3>
        <p class="empty-text">Crea la primera sección para el año escolar {{ filters.año_escolar }}</p>
        <button @click="showCreateModal = true" class="btn btn-primary mt-4">
          + Crear Sección
        </button>
      </div>

      <!-- Modal Crear/Editar Sección -->
      <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">{{ editingSeccion ? 'Editar Sección' : 'Nueva Sección' }}</h3>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Grado <span class="required">*</span></label>
              <select v-model="formData.grado_id" class="form-input" :disabled="editingSeccion">
                <option value="">Seleccione grado...</option>
                <option v-for="grado in grados" :key="grado.id" :value="grado.id">
                  {{ grado.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Nombre Sección <span class="required">*</span></label>
              <input
                v-model="formData.nombre"
                type="text"
                class="form-input"
                placeholder="A, B, C..."
                maxlength="10"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Año Escolar <span class="required">*</span></label>
              <input
                v-model="formData.año_escolar"
                type="number"
                class="form-input"
                placeholder="2025"
                :disabled="editingSeccion"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Capacidad <span class="required">*</span></label>
              <input
                v-model="formData.capacidad"
                type="number"
                class="form-input"
                placeholder="30"
                min="1"
                max="50"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Turno <span class="required">*</span></label>
              <select v-model="formData.turno" class="form-input">
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Aula</label>
              <input
                v-model="formData.aula"
                type="text"
                class="form-input"
                placeholder="Aula 101"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Docente Tutor</label>
              <select v-model="formData.docente_id" class="form-input">
                <option value="">Sin asignar</option>
                <option v-for="docente in docentes" :key="docente.id" :value="docente.id">
                  {{ docente.nombre }} {{ docente.apellido }}
                </option>
              </select>
            </div>

            <div v-if="editingSeccion" class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="formData.estado" class="form-input">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div v-if="formError" class="alert alert-error">
            {{ formError }}
          </div>

          <div class="modal-actions">
            <button @click="closeModals" class="btn btn-outline">Cancelar</button>
            <button
              @click="saveSeccion"
              :disabled="saving"
              class="btn btn-primary"
            >
              {{ saving ? 'Guardando...' : (editingSeccion ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import seccionService from '@/services/seccion.service'
import gradoService from '@/services/grado.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const canDelete = computed(() => user.value?.rol === 'administrador')

const filters = ref({
  año_escolar: 2025,
  grado_id: '',
  turno: ''
})

const secciones = ref([])
const grados = ref([])
const docentes = ref([])
const loading = ref(false)
const activeDropdown = ref(null)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingSeccion = ref(null)
const saving = ref(false)
const formError = ref(null)

const formData = ref({
  grado_id: '',
  nombre: '',
  año_escolar: 2025,
  capacidad: 30,
  turno: 'mañana',
  aula: '',
  docente_id: '',
  estado: 'activo'
})

const seccionesPorGrado = computed(() => {
  const grouped = {}
  secciones.value.forEach(seccion => {
    const key = seccion.grado_nombre
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(seccion)
  })
  return grouped
})

const loadSecciones = async () => {
  loading.value = true
  try {
    const response = await seccionService.getAll(filters.value)
    secciones.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const loadGrados = async () => {
  try {
    const response = await gradoService.getAll({ estado: 'activo' })
    grados.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const loadDocentes = async () => {
  try {
    // Asumiendo que existe un endpoint para obtener usuarios docentes
    const response = await fetch('/api/users?rol=docente', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    docentes.value = data.data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const toggleDropdown = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const editSeccion = (seccion) => {
  editingSeccion.value = seccion
  formData.value = {
    grado_id: seccion.grado_id,
    nombre: seccion.nombre,
    año_escolar: seccion.año_escolar,
    capacidad: seccion.capacidad,
    turno: seccion.turno,
    aula: seccion.aula || '',
    docente_id: seccion.docente_id || '',
    estado: seccion.estado
  }
  showEditModal.value = true
  activeDropdown.value = null
}

const saveSeccion = async () => {
  formError.value = null

  if (!formData.value.grado_id || !formData.value.nombre || !formData.value.año_escolar) {
    formError.value = 'Por favor complete los campos requeridos'
    return
  }

  saving.value = true
  try {
    if (editingSeccion.value) {
      await seccionService.update(editingSeccion.value.id, formData.value)
    } else {
      await seccionService.create(formData.value)
    }
    closeModals()
    await loadSecciones()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error al guardar sección'
  } finally {
    saving.value = false
  }
}

const deleteSeccion = async (seccion) => {
  if (!confirm(`¿Está seguro de eliminar la sección ${seccion.nombre}?`)) return

  try {
    await seccionService.delete(seccion.id)
    await loadSecciones()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al eliminar sección')
  }
  activeDropdown.value = null
}

const verEstudiantes = (seccion) => {
  // Navegar a vista de estudiantes de la sección
  router.push(`/secciones/${seccion.id}/estudiantes?año=${seccion.año_escolar}`)
  activeDropdown.value = null
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSeccion.value = null
  formData.value = {
    grado_id: '',
    nombre: '',
    año_escolar: 2025,
    capacidad: 30,
    turno: 'mañana',
    aula: '',
    docente_id: '',
    estado: 'activo'
  }
  formError.value = null
}

onMounted(() => {
  loadGrados()
  loadDocentes()
  loadSecciones()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
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

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.grados-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.grado-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grado-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #667eea;
}

.secciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.seccion-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s;
}

.seccion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-full {
  border-color: #ef4444;
  background: #fef2f2;
}

.card-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.card-header-seccion {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seccion-name h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.seccion-aula {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.dropdown {
  position: relative;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  margin-top: 0.5rem;
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

.text-red {
  color: #dc2626;
}

.card-body-seccion {
  padding: 1.25rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #374151;
}

.info-icon {
  font-size: 1.25rem;
}

.info-text {
  font-size: 0.875rem;
}

.capitalize {
  text-transform: capitalize;
}

.vacantes-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.vacantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.vacantes-label {
  font-weight: 600;
  color: #111827;
}

.vacantes-badge {
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

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.vacantes-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #6b7280;
  margin: 0;
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
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-input {
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

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.mt-4 {
  margin-top: 1rem;
}

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-gray-600 {
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .secciones-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
