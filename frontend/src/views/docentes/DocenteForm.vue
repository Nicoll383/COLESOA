<template>
  <div class="docente-form-container">
    <div class="form-header">
      <button @click="$router.back()" class="btn-back">← Volver</button>
      <h1 class="page-title">{{ isEdit ? '✏️ Editar Docente' : '➕ Nuevo Docente' }}</h1>
    </div>

    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <!-- Información Personal -->
        <div class="form-section">
          <h2 class="section-title">👤 Información Personal</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.nombre" type="text" required class="form-control" />
            </div>

            <div class="form-group">
              <label>Apellido *</label>
              <input v-model="form.apellido" type="text" required class="form-control" />
            </div>

            <div class="form-group">
              <label>DNI *</label>
              <input v-model="form.dni" type="text" required pattern="[0-9]{8}" class="form-control" />
            </div>

            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input v-model="form.fecha_nacimiento" type="date" class="form-control" />
            </div>
          </div>
        </div>

        <!-- Contacto -->
        <div class="form-section">
          <h2 class="section-title">📧 Información de Contacto</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="form.email" type="email" required class="form-control" />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.telefono" type="tel" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>Dirección</label>
              <input v-model="form.direccion" type="text" class="form-control" />
            </div>
          </div>
        </div>

        <!-- Información Profesional -->
        <div class="form-section">
          <h2 class="section-title">📚 Información Profesional</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Especialidad *</label>
              <select v-model="form.especialidad" required class="form-control">
                <option value="">Seleccione...</option>
                <option>Matemática</option>
                <option>Comunicación</option>
                <option>Ciencias</option>
                <option>Inglés</option>
                <option>Educación Física</option>
                <option>Arte</option>
                <option>Religión</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de Ingreso</label>
              <input v-model="form.fecha_ingreso" type="date" class="form-control" />
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.estado" class="form-control">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="licencia">En Licencia</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Título Profesional</label>
            <input v-model="form.titulo" type="text" class="form-control" />
          </div>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Docente') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  email: '',
  telefono: '',
  direccion: '',
  especialidad: '',
  fecha_ingreso: new Date().toISOString().split('T')[0],
  estado: 'activo',
  titulo: ''
})

const loadDocente = async () => {
  if (!isEdit.value) return

  try {
    // TODO: Implementar llamada API real
    // const response = await docenteService.getById(route.params.id)
    // form.value = response.data

    // Datos de prueba
    form.value = {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      dni: '45678901',
      fecha_nacimiento: '1985-06-15',
      email: 'carlos.rodriguez@colegio.com',
      telefono: '987654321',
      direccion: 'Av. Los Educadores 123',
      especialidad: 'Matemática',
      fecha_ingreso: '2020-03-15',
      estado: 'activo',
      titulo: 'Licenciado en Matemática'
    }
  } catch (error) {
    console.error('Error al cargar docente:', error)
    alert('Error al cargar los datos del docente')
    router.back()
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      // TODO: Implementar llamada API real
      // await docenteService.update(route.params.id, form.value)
      alert('Docente actualizado exitosamente')
    } else {
      // TODO: Implementar llamada API real
      // await docenteService.create(form.value)
      alert('Docente creado exitosamente')
    }
    router.push('/docentes')
  } catch (error) {
    console.error('Error al guardar docente:', error)
    alert('Error al guardar el docente')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadDocente()
  }
})
</script>

<style scoped>
.docente-form-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 30px;
}

.btn-back {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
}

.btn-back:hover {
  background: #e5e7eb;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 10px 24px;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
