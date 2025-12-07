<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Matrículas</h1>
          <p class="page-subtitle">Gestión de matrículas del año escolar</p>
        </div>
        <button @click="goToCreate" class="btn btn-primary">
          Nueva Matrícula
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <h3 class="font-semibold mb-4">Filtros</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label class="form-label">Año Escolar</label>
            <select v-model="filters.año_escolar" class="form-input" @change="loadEnrollments">
              <option value="">Todos</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" class="form-input" @change="loadEnrollments">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Código de Matrícula</label>
            <input
              v-model="filters.codigo_matricula"
              type="text"
              class="form-input"
              placeholder="MAT2025..."
              @input="loadEnrollments"
            />
          </div>
          <div class="form-group">
            <label class="form-label">DNI Estudiante</label>
            <input
              v-model="filters.estudiante_dni"
              type="text"
              class="form-input"
              placeholder="12345678"
              @input="loadEnrollments"
            />
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div v-if="loading" class="card text-center py-8">
        <p class="text-gray-600">Cargando matrículas...</p>
      </div>

      <div v-else-if="error" class="card text-center py-8 bg-red-50">
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadEnrollments" class="btn btn-primary mt-4">Reintentar</button>
      </div>

      <div v-else class="card overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left p-3">Código</th>
              <th class="text-left p-3">Estudiante</th>
              <th class="text-left p-3">DNI</th>
              <th class="text-left p-3">Grado/Sección</th>
              <th class="text-left p-3">Año</th>
              <th class="text-left p-3">Monto</th>
              <th class="text-left p-3">Estado</th>
              <th class="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="enrollments.length === 0">
              <td colspan="8" class="text-center p-8 text-gray-500">
                No se encontraron matrículas
              </td>
            </tr>
            <tr v-for="enrollment in enrollments" :key="enrollment.id" class="border-b hover:bg-gray-50">
              <td class="p-3 font-mono text-sm">{{ enrollment.codigo_matricula }}</td>
              <td class="p-3">{{ enrollment.estudiante_nombres }} {{ enrollment.estudiante_apellidos }}</td>
              <td class="p-3">{{ enrollment.estudiante_dni }}</td>
              <td class="p-3">{{ enrollment.grado_nombre }} - {{ enrollment.seccion_nombre }}</td>
              <td class="p-3">{{ enrollment.año_escolar }}</td>
              <td class="p-3 font-semibold">S/. {{ parseFloat(enrollment.monto_total).toFixed(2) }}</td>
              <td class="p-3">
                <span
                  :class="{
                    'badge-warning': enrollment.estado === 'pendiente',
                    'badge-success': enrollment.estado === 'pagada',
                    'badge-secondary': enrollment.estado === 'cancelada',
                    'badge-danger': enrollment.estado === 'anulada'
                  }"
                  class="px-2 py-1 text-xs rounded"
                >
                  {{ enrollment.estado }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    @click="viewEnrollment(enrollment.id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver
                  </button>
                  <button
                    v-if="enrollment.estado !== 'anulada' && canAnular"
                    @click="confirmAnular(enrollment)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Anular
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de anulación -->
    <div v-if="showAnularModal" class="modal-overlay" @click="showAnularModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold mb-4">Anular Matrícula</h3>
        <p class="mb-4">
          ¿Está seguro de anular la matrícula <strong>{{ enrollmentToAnular?.codigo_matricula }}</strong>?
        </p>
        <div class="form-group">
          <label class="form-label">Motivo de anulación</label>
          <textarea
            v-model="motivoAnulacion"
            class="form-input"
            rows="3"
            placeholder="Ingrese el motivo de la anulación..."
            required
          ></textarea>
        </div>
        <div class="flex gap-4 justify-end mt-4">
          <button @click="showAnularModal = false" class="btn btn-outline">
            Cancelar
          </button>
          <button
            @click="anularEnrollment"
            :disabled="!motivoAnulacion"
            class="btn bg-red-600 text-white hover:bg-red-700"
          >
            Anular Matrícula
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import enrollmentService from '@/services/enrollment.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const canAnular = computed(() => user.value?.rol === 'administrador')

const enrollments = ref([])
const loading = ref(false)
const error = ref(null)
const filters = ref({
  año_escolar: '2025',
  estado: '',
  codigo_matricula: '',
  estudiante_dni: ''
})

const showAnularModal = ref(false)
const enrollmentToAnular = ref(null)
const motivoAnulacion = ref('')

const loadEnrollments = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await enrollmentService.getAll(filters.value)
    enrollments.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar matrículas'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const goToCreate = () => {
  router.push('/enrollments/create')
}

const viewEnrollment = (id) => {
  router.push(`/enrollments/${id}`)
}

const confirmAnular = (enrollment) => {
  enrollmentToAnular.value = enrollment
  motivoAnulacion.value = ''
  showAnularModal.value = true
}

const anularEnrollment = async () => {
  try {
    await enrollmentService.anular(enrollmentToAnular.value.id, motivoAnulacion.value)
    showAnularModal.value = false
    enrollmentToAnular.value = null
    motivoAnulacion.value = ''
    await loadEnrollments()
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al anular matrícula'
    console.error('Error:', err)
  }
}

onMounted(() => {
  loadEnrollments()
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

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.badge-success {
  background-color: #10b981;
  color: white;
}

.badge-warning {
  background-color: #f59e0b;
  color: white;
}

.badge-secondary {
  background-color: #6b7280;
  color: white;
}

.badge-danger {
  background-color: #ef4444;
  color: white;
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

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}
</style>
