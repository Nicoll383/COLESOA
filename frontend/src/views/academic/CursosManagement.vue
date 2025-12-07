<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Cursos</h1>
          <p class="page-subtitle">Administrar cursos y asignaciones a secciones</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          + Nuevo Curso
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-input"
              placeholder="Nombre o código del curso..."
              @input="loadCursos"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Nivel</label>
            <select v-model="filters.nivel" @change="loadCursos" class="form-input">
              <option value="">Todos</option>
              <option value="primaria">Primaria</option>
              <option value="inicial">Inicial</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" @change="loadCursos" class="form-input">
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando cursos...</p>
      </div>

      <!-- Cursos Grid -->
      <div v-else-if="cursos.length > 0" class="cursos-grid">
        <div
          v-for="curso in cursos"
          :key="curso.id"
          class="curso-card"
          :style="{ borderLeftColor: curso.color }"
        >
          <div class="curso-header">
            <div class="curso-color" :style="{ backgroundColor: curso.color }"></div>
            <div class="curso-info">
              <h3 class="curso-nombre">{{ curso.nombre }}</h3>
              <span class="curso-codigo">{{ curso.codigo }}</span>
            </div>
            <div class="dropdown">
              <button @click="toggleDropdown(curso.id)" class="btn-icon-small">⋮</button>
              <div v-if="activeDropdown === curso.id" class="dropdown-menu">
                <button @click="editCurso(curso)" class="dropdown-item">✏️ Editar</button>
                <button @click="asignarCurso(curso)" class="dropdown-item">➕ Asignar a Sección</button>
                <button
                  v-if="canDelete"
                  @click="deleteCurso(curso)"
                  class="dropdown-item text-red"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>

          <div class="curso-body">
            <p v-if="curso.descripcion" class="curso-descripcion">{{ curso.descripcion }}</p>

            <div class="curso-meta">
              <div class="meta-item">
                <span class="meta-icon">📚</span>
                <span class="meta-text capitalize">{{ curso.nivel }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <span class="meta-text">{{ curso.horas_semanales }}h/semana</span>
              </div>
              <div class="meta-item">
                <span
                  class="status-badge"
                  :class="curso.estado === 'activo' ? 'badge-active' : 'badge-inactive'"
                >
                  {{ curso.estado === 'activo' ? '✓ Activo' : '✗ Inactivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📖</div>
        <h3 class="empty-title">No hay cursos</h3>
        <p class="empty-text">Crea el primer curso para comenzar</p>
        <button @click="showCreateModal = true" class="btn btn-primary mt-4">
          + Crear Curso
        </button>
      </div>

      <!-- Modal Crear/Editar Curso -->
      <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">{{ editingCurso ? 'Editar Curso' : 'Nuevo Curso' }}</h3>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Código <span class="required">*</span></label>
              <input
                v-model="formData.codigo"
                type="text"
                class="form-input"
                placeholder="MAT-P, COM-P..."
                maxlength="20"
                :disabled="editingCurso"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Nombre <span class="required">*</span></label>
              <input
                v-model="formData.nombre"
                type="text"
                class="form-input"
                placeholder="Matemática, Comunicación..."
                maxlength="100"
              />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Descripción</label>
              <textarea
                v-model="formData.descripcion"
                class="form-input"
                rows="3"
                placeholder="Descripción del curso..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Nivel <span class="required">*</span></label>
              <select v-model="formData.nivel" class="form-input">
                <option value="primaria">Primaria</option>
                <option value="inicial">Inicial</option>
                <option value="secundaria">Secundaria</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Horas Semanales <span class="required">*</span></label>
              <input
                v-model="formData.horas_semanales"
                type="number"
                class="form-input"
                min="1"
                max="10"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Color</label>
              <div class="color-picker">
                <input
                  v-model="formData.color"
                  type="color"
                  class="color-input"
                />
                <span class="color-value">{{ formData.color }}</span>
              </div>
            </div>

            <div v-if="editingCurso" class="form-group">
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
              @click="saveCurso"
              :disabled="saving"
              class="btn btn-primary"
            >
              {{ saving ? 'Guardando...' : (editingCurso ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Asignar Curso a Sección -->
      <div v-if="showAsignarModal" class="modal-overlay" @click="showAsignarModal = false">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Asignar Curso a Sección</h3>
          <p class="modal-subtitle">
            <strong>{{ selectedCurso?.nombre }}</strong> ({{ selectedCurso?.codigo }})
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Año Escolar <span class="required">*</span></label>
              <input
                v-model="asignarData.año_escolar"
                type="number"
                class="form-input"
                placeholder="2025"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Sección <span class="required">*</span></label>
              <select v-model="asignarData.seccion_id" class="form-input">
                <option value="">Seleccione sección...</option>
                <option v-for="seccion in seccionesDisponibles" :key="seccion.id" :value="seccion.id">
                  {{ seccion.grado_nombre }} - Sección {{ seccion.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group full-width">
              <label class="form-label">Docente (opcional)</label>
              <select v-model="asignarData.docente_id" class="form-input">
                <option value="">Sin asignar</option>
                <option v-for="docente in docentes" :key="docente.id" :value="docente.id">
                  {{ docente.nombre }} {{ docente.apellido }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="asignarError" class="alert alert-error">
            {{ asignarError }}
          </div>

          <div class="modal-actions">
            <button @click="showAsignarModal = false" class="btn btn-outline">Cancelar</button>
            <button
              @click="saveAsignacion"
              :disabled="asignando"
              class="btn btn-primary"
            >
              {{ asignando ? 'Asignando...' : 'Asignar Curso' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import cursoService from '@/services/curso.service'
import seccionService from '@/services/seccion.service'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const canDelete = computed(() => user.value?.rol === 'administrador')

const filters = ref({
  search: '',
  nivel: '',
  estado: ''
})

const cursos = ref([])
const seccionesDisponibles = ref([])
const docentes = ref([])
const loading = ref(false)
const activeDropdown = ref(null)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showAsignarModal = ref(false)
const editingCurso = ref(null)
const selectedCurso = ref(null)
const saving = ref(false)
const asignando = ref(false)
const formError = ref(null)
const asignarError = ref(null)

const formData = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  nivel: 'primaria',
  horas_semanales: 2,
  color: '#667eea',
  estado: 'activo'
})

const asignarData = ref({
  seccion_id: '',
  año_escolar: 2025,
  docente_id: ''
})

const loadCursos = async () => {
  loading.value = true
  try {
    const response = await cursoService.getAll(filters.value)
    cursos.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const loadSecciones = async () => {
  try {
    const response = await seccionService.getAll({ año_escolar: 2025, estado: 'activo' })
    seccionesDisponibles.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const loadDocentes = async () => {
  try {
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

const editCurso = (curso) => {
  editingCurso.value = curso
  formData.value = {
    codigo: curso.codigo,
    nombre: curso.nombre,
    descripcion: curso.descripcion || '',
    nivel: curso.nivel,
    horas_semanales: curso.horas_semanales,
    color: curso.color,
    estado: curso.estado
  }
  showEditModal.value = true
  activeDropdown.value = null
}

const asignarCurso = (curso) => {
  selectedCurso.value = curso
  asignarData.value = {
    seccion_id: '',
    año_escolar: 2025,
    docente_id: ''
  }
  showAsignarModal.value = true
  activeDropdown.value = null
}

const saveCurso = async () => {
  formError.value = null

  if (!formData.value.codigo || !formData.value.nombre) {
    formError.value = 'Por favor complete los campos requeridos'
    return
  }

  saving.value = true
  try {
    if (editingCurso.value) {
      await cursoService.update(editingCurso.value.id, formData.value)
    } else {
      await cursoService.create(formData.value)
    }
    closeModals()
    await loadCursos()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error al guardar curso'
  } finally {
    saving.value = false
  }
}

const saveAsignacion = async () => {
  asignarError.value = null

  if (!asignarData.value.seccion_id || !asignarData.value.año_escolar) {
    asignarError.value = 'Por favor complete los campos requeridos'
    return
  }

  asignando.value = true
  try {
    await cursoService.asignarASeccion({
      curso_id: selectedCurso.value.id,
      seccion_id: asignarData.value.seccion_id,
      año_escolar: asignarData.value.año_escolar,
      docente_id: asignarData.value.docente_id || null
    })
    showAsignarModal.value = false
    selectedCurso.value = null
  } catch (error) {
    asignarError.value = error.response?.data?.message || 'Error al asignar curso'
  } finally {
    asignando.value = false
  }
}

const deleteCurso = async (curso) => {
  if (!confirm(`¿Está seguro de eliminar el curso ${curso.nombre}?`)) return

  try {
    await cursoService.delete(curso.id)
    await loadCursos()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al eliminar curso')
  }
  activeDropdown.value = null
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCurso.value = null
  formData.value = {
    codigo: '',
    nombre: '',
    descripcion: '',
    nivel: 'primaria',
    horas_semanales: 2,
    color: '#667eea',
    estado: 'activo'
  }
  formError.value = null
}

onMounted(() => {
  loadCursos()
  loadSecciones()
  loadDocentes()
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
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.curso-card {
  background: white;
  border-radius: 1rem;
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.curso-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.curso-color {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.curso-info {
  flex: 1;
}

.curso-nombre {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.curso-codigo {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-family: 'Courier New', monospace;
}

.dropdown {
  position: relative;
}

.btn-icon-small {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon-small:hover {
  background: #e5e7eb;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 180px;
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

.text-red {
  color: #dc2626;
}

.curso-body {
  padding: 1.25rem;
}

.curso-descripcion {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.curso-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1rem;
}

.meta-text {
  font-size: 0.875rem;
  color: #374151;
}

.capitalize {
  text-transform: capitalize;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-active {
  background: #10b981;
  color: white;
}

.badge-inactive {
  background: #6b7280;
  color: white;
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
  margin: 0 0 0.5rem 0;
}

.modal-subtitle {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
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

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
}

.color-value {
  font-family: 'Courier New', monospace;
  color: #6b7280;
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

  .cursos-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .curso-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
