<template>
  <AppLayout>
    <div class="page-container">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Estudiantes</h1>
        <button @click="goToCreate" class="btn btn-primary">
          Nuevo Estudiante
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <h3 class="font-semibold mb-4">Filtros de Búsqueda</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label class="form-label">DNI</label>
            <input
              v-model="filters.dni"
              type="text"
              class="form-input"
              placeholder="Buscar por DNI"
              @input="loadStudents"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Nombres</label>
            <input
              v-model="filters.nombres"
              type="text"
              class="form-input"
              placeholder="Buscar por nombres"
              @input="loadStudents"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Apellidos</label>
            <input
              v-model="filters.apellidos"
              type="text"
              class="form-input"
              placeholder="Buscar por apellidos"
              @input="loadStudents"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" class="form-input" @change="loadStudents">
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="retirado">Retirado</option>
              <option value="trasladado">Trasladado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mensaje de carga/error -->
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando estudiantes...</p>
      </div>

      <div v-else-if="error" class="card text-center py-8 bg-red-50">
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadStudents" class="btn btn-primary mt-4">Reintentar</button>
      </div>

      <!-- Tabla de estudiantes -->
      <div v-else class="card overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left p-3">Código</th>
              <th class="text-left p-3">DNI</th>
              <th class="text-left p-3">Nombres</th>
              <th class="text-left p-3">Apellidos</th>
              <th class="text-left p-3">Género</th>
              <th class="text-left p-3">Estado</th>
              <th class="text-left p-3">Teléfono</th>
              <th class="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="students.length === 0">
              <td colspan="8" class="text-center p-8 text-gray-500">
                No se encontraron estudiantes
              </td>
            </tr>
            <tr v-for="student in students" :key="student.id" class="border-b hover:bg-gray-50">
              <td class="p-3">{{ student.codigo_estudiante }}</td>
              <td class="p-3">{{ student.dni }}</td>
              <td class="p-3">{{ student.nombres }}</td>
              <td class="p-3">{{ student.apellidos }}</td>
              <td class="p-3">{{ student.genero === 'M' ? 'Masculino' : 'Femenino' }}</td>
              <td class="p-3">
                <span
                  :class="{
                    'badge-success': student.estado === 'activo',
                    'badge-danger': student.estado === 'retirado',
                    'badge-warning': student.estado === 'trasladado'
                  }"
                  class="px-2 py-1 text-xs rounded"
                >
                  {{ student.estado }}
                </span>
              </td>
              <td class="p-3">{{ student.telefono || '-' }}</td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    @click="viewStudent(student.id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver
                  </button>
                  <button
                    @click="editStudent(student.id)"
                    class="text-green-600 hover:text-green-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    v-if="canDelete"
                    @click="confirmDelete(student)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
        <p class="mb-4">
          ¿Está seguro de eliminar al estudiante <strong>{{ studentToDelete?.nombres }} {{ studentToDelete?.apellidos }}</strong>?
        </p>
        <p class="text-sm text-red-600 mb-4">
          Esta acción no se puede deshacer. Se eliminarán todos los registros asociados.
        </p>
        <div class="flex gap-4 justify-end">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="deleteStudent" class="btn bg-red-600 text-white hover:bg-red-700">
            Eliminar
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
import studentService from '@/services/student.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const canDelete = computed(() => user.value?.rol === 'administrador')

const students = ref([])
const loading = ref(false)
const error = ref(null)
const filters = ref({
  dni: '',
  nombres: '',
  apellidos: '',
  estado: ''
})

const showDeleteModal = ref(false)
const studentToDelete = ref(null)

const loadStudents = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await studentService.getAll(filters.value)
    students.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar estudiantes'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const goToCreate = () => {
  router.push('/students/create')
}

const viewStudent = (id) => {
  router.push(`/students/${id}`)
}

const editStudent = (id) => {
  router.push(`/students/${id}/edit`)
}

const confirmDelete = (student) => {
  studentToDelete.value = student
  showDeleteModal.value = true
}

const deleteStudent = async () => {
  try {
    await studentService.delete(studentToDelete.value.id)
    showDeleteModal.value = false
    studentToDelete.value = null
    await loadStudents()
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar estudiante'
    console.error('Error:', err)
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.badge-success {
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-danger {
  background-color: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-warning {
  background-color: #f59e0b;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  border-collapse: collapse;
  width: 100%;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

tr:hover {
  background-color: #f9fafb;
}
</style>
