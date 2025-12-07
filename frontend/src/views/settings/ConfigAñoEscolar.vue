<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Configuración de Años Escolares</h1>
          <p class="page-subtitle">Gestiona las configuraciones de cada periodo escolar</p>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          + Nuevo Año Escolar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Cargando configuraciones...</p>
      </div>

      <!-- Configurations List -->
      <div v-else class="configs-grid">
        <div
          v-for="config in configuraciones"
          :key="config.id"
          class="config-card"
          :class="{
            'config-active': config.estado === 'activo',
            'config-closed': config.estado === 'cerrado'
          }"
        >
          <div class="config-header">
            <div>
              <h3 class="config-year">Año Escolar {{ config.año_escolar }}</h3>
              <span
                class="status-badge"
                :class="{
                  'badge-success': config.estado === 'activo',
                  'badge-warning': config.estado === 'inactivo',
                  'badge-danger': config.estado === 'cerrado'
                }"
              >
                {{ config.estado.toUpperCase() }}
              </span>
            </div>
            <div class="config-actions">
              <button @click="editConfig(config)" class="btn-icon" title="Editar">
                ✏️
              </button>
              <button
                v-if="config.estado !== 'activo'"
                @click="activateConfig(config.id)"
                class="btn-icon"
                title="Activar"
              >
                ✅
              </button>
              <button
                v-if="config.estado === 'activo'"
                @click="closeConfig(config.id)"
                class="btn-icon"
                title="Cerrar"
              >
                🔒
              </button>
            </div>
          </div>

          <div class="config-content">
            <!-- Fechas -->
            <div class="config-section">
              <h4 class="section-title">📅 Periodo de Matrícula</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Inicio:</span>
                  <span class="info-value">{{ formatDate(config.fecha_inicio_matricula) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fin:</span>
                  <span class="info-value">{{ formatDate(config.fecha_fin_matricula) }}</span>
                </div>
              </div>
            </div>

            <!-- Costos -->
            <div class="config-section">
              <h4 class="section-title">💰 Costos</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Matrícula:</span>
                  <span class="info-value">S/. {{ formatMoney(config.costo_matricula) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Mensualidad:</span>
                  <span class="info-value">S/. {{ formatMoney(config.costo_mensualidad) }}</span>
                </div>
              </div>
            </div>

            <!-- Descuentos -->
            <div class="config-section">
              <h4 class="section-title">🎁 Descuentos</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Hermanos:</span>
                  <span class="info-value">{{ config.descuento_hermanos_porcentaje }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Pronto Pago:</span>
                  <span class="info-value">{{ config.descuento_pronto_pago_porcentaje }}%</span>
                </div>
              </div>
            </div>

            <!-- Niveles Activos -->
            <div class="config-section">
              <h4 class="section-title">🏫 Niveles Educativos</h4>
              <div class="nivel-badges">
                <span
                  v-for="nivel in config.niveles_activos"
                  :key="nivel"
                  class="nivel-badge"
                >
                  {{ nivel.charAt(0).toUpperCase() + nivel.slice(1) }}
                </span>
              </div>
            </div>

            <!-- Observaciones -->
            <div v-if="config.observaciones" class="config-section">
              <h4 class="section-title">📝 Observaciones</h4>
              <p class="observaciones-text">{{ config.observaciones }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="configuraciones.length === 0" class="empty-state">
          <p class="empty-icon">📚</p>
          <p class="empty-title">No hay configuraciones</p>
          <p class="empty-text">Crea la primera configuración de año escolar</p>
        </div>
      </div>

      <!-- Modal Create/Edit -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingConfig ? 'Editar Configuración' : 'Nueva Configuración' }}
            </h2>
            <button @click="closeModal" class="modal-close">×</button>
          </div>

          <div class="modal-body">
            <div v-if="formError" class="alert alert-error">{{ formError }}</div>

            <div class="form-grid">
              <!-- Año Escolar -->
              <div class="form-group">
                <label class="form-label required">Año Escolar</label>
                <input
                  v-model.number="formData.año_escolar"
                  type="number"
                  class="form-input"
                  :disabled="!!editingConfig"
                  min="2020"
                  max="2050"
                  placeholder="2025"
                />
              </div>

              <!-- Estado -->
              <div class="form-group">
                <label class="form-label">Estado</label>
                <select v-model="formData.estado" class="form-input">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              <!-- Fecha Inicio Matrícula -->
              <div class="form-group">
                <label class="form-label">Fecha Inicio Matrícula</label>
                <input
                  v-model="formData.fecha_inicio_matricula"
                  type="date"
                  class="form-input"
                />
              </div>

              <!-- Fecha Fin Matrícula -->
              <div class="form-group">
                <label class="form-label">Fecha Fin Matrícula</label>
                <input
                  v-model="formData.fecha_fin_matricula"
                  type="date"
                  class="form-input"
                />
              </div>

              <!-- Costo Matrícula -->
              <div class="form-group">
                <label class="form-label">Costo Matrícula (S/.)</label>
                <input
                  v-model.number="formData.costo_matricula"
                  type="number"
                  step="0.01"
                  class="form-input"
                  placeholder="500.00"
                />
              </div>

              <!-- Costo Mensualidad -->
              <div class="form-group">
                <label class="form-label">Costo Mensualidad (S/.)</label>
                <input
                  v-model.number="formData.costo_mensualidad"
                  type="number"
                  step="0.01"
                  class="form-input"
                  placeholder="350.00"
                />
              </div>

              <!-- Descuento Hermanos -->
              <div class="form-group">
                <label class="form-label">Descuento Hermanos (%)</label>
                <input
                  v-model.number="formData.descuento_hermanos_porcentaje"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input"
                  placeholder="10"
                />
              </div>

              <!-- Descuento Pronto Pago -->
              <div class="form-group">
                <label class="form-label">Descuento Pronto Pago (%)</label>
                <input
                  v-model.number="formData.descuento_pronto_pago_porcentaje"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input"
                  placeholder="5"
                />
              </div>
            </div>

            <!-- Niveles Activos -->
            <div class="form-group mt-4">
              <label class="form-label">Niveles Educativos Activos</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="inicial"
                    v-model="formData.niveles_activos"
                  />
                  <span>Inicial</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="primaria"
                    v-model="formData.niveles_activos"
                  />
                  <span>Primaria</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="secundaria"
                    v-model="formData.niveles_activos"
                  />
                  <span>Secundaria</span>
                </label>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="form-group mt-4">
              <label class="form-label">Observaciones</label>
              <textarea
                v-model="formData.observaciones"
                class="form-textarea"
                rows="3"
                placeholder="Notas adicionales..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-outline">Cancelar</button>
            <button @click="saveConfig" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import añoEscolarService from '@/services/año-escolar.service'
import AppLayout from '@/components/AppLayout.vue'

const configuraciones = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingConfig = ref(null)
const saving = ref(false)
const formError = ref(null)

const formData = ref({
  año_escolar: new Date().getFullYear(),
  fecha_inicio_matricula: '',
  fecha_fin_matricula: '',
  costo_matricula: 500.00,
  costo_mensualidad: 350.00,
  descuento_hermanos_porcentaje: 10,
  descuento_pronto_pago_porcentaje: 5,
  niveles_activos: ['inicial', 'primaria', 'secundaria'],
  estado: 'inactivo',
  observaciones: ''
})

const loadConfiguraciones = async () => {
  loading.value = true
  try {
    const response = await añoEscolarService.getAll()
    configuraciones.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingConfig.value = null
  formData.value = {
    año_escolar: new Date().getFullYear() + 1,
    fecha_inicio_matricula: '',
    fecha_fin_matricula: '',
    costo_matricula: 500.00,
    costo_mensualidad: 350.00,
    descuento_hermanos_porcentaje: 10,
    descuento_pronto_pago_porcentaje: 5,
    niveles_activos: ['inicial', 'primaria', 'secundaria'],
    estado: 'inactivo',
    observaciones: ''
  }
  showModal.value = true
}

const editConfig = (config) => {
  editingConfig.value = config
  formData.value = {
    año_escolar: config.año_escolar,
    fecha_inicio_matricula: config.fecha_inicio_matricula?.split('T')[0] || '',
    fecha_fin_matricula: config.fecha_fin_matricula?.split('T')[0] || '',
    costo_matricula: config.costo_matricula,
    costo_mensualidad: config.costo_mensualidad,
    descuento_hermanos_porcentaje: config.descuento_hermanos_porcentaje,
    descuento_pronto_pago_porcentaje: config.descuento_pronto_pago_porcentaje,
    niveles_activos: config.niveles_activos || [],
    estado: config.estado,
    observaciones: config.observaciones || ''
  }
  showModal.value = true
}

const saveConfig = async () => {
  formError.value = null

  if (!formData.value.año_escolar) {
    formError.value = 'El año escolar es requerido'
    return
  }

  saving.value = true
  try {
    if (editingConfig.value) {
      await añoEscolarService.update(editingConfig.value.id, formData.value)
    } else {
      await añoEscolarService.create(formData.value)
    }
    closeModal()
    await loadConfiguraciones()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error al guardar configuración'
    console.error('Error:', error)
  } finally {
    saving.value = false
  }
}

const activateConfig = async (id) => {
  if (!confirm('¿Desea activar esta configuración? Se desactivarán otros años escolares.')) {
    return
  }

  try {
    await añoEscolarService.toggleEstado(id, 'activo')
    await loadConfiguraciones()
  } catch (error) {
    console.error('Error:', error)
    alert('Error al activar configuración')
  }
}

const closeConfig = async (id) => {
  if (!confirm('¿Desea cerrar este año escolar? Esta acción es irreversible.')) {
    return
  }

  try {
    await añoEscolarService.toggleEstado(id, 'cerrado')
    await loadConfiguraciones()
  } catch (error) {
    console.error('Error:', error)
    alert('Error al cerrar año escolar')
  }
}

const closeModal = () => {
  showModal.value = false
  editingConfig.value = null
  formError.value = null
}

const formatDate = (date) => {
  if (!date) return 'No especificada'
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

onMounted(() => {
  loadConfiguraciones()
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
  color: #1a202c;
  margin: 0;
}

.page-subtitle {
  color: #718096;
  margin-top: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #718096;
}

.configs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 2rem;
}

.config-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.config-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.config-active {
  border-color: #48bb78;
  background: linear-gradient(to bottom, #f0fff4, white);
}

.config-closed {
  opacity: 0.7;
  background: #f7fafc;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.config-year {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.badge-warning {
  background: #fefcbf;
  color: #744210;
}

.badge-danger {
  background: #fed7d7;
  color: #742a2a;
}

.config-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #edf2f7;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.config-section {
  border-left: 3px solid #e2e8f0;
  padding-left: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.75rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #2d3748;
  font-weight: 600;
}

.nivel-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nivel-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.observaciones-text {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #718096;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  background: #f7fafc;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 600px;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #a0aec0;
  line-height: 1;
}

.modal-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
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
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.checkbox-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.mt-4 {
  margin-top: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}
</style>
