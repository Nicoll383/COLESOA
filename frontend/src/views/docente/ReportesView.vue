<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Reportes</h1>
          <p class="page-subtitle">Reportes académicos y de rendimiento</p>
        </div>
        <button @click="exportarReporte" class="btn btn-primary">
          📥 Exportar Reporte
        </button>
      </div>

      <!-- Tipos de Reportes -->
      <div class="reportes-grid">
        <div
          v-for="reporte in tiposReportes"
          :key="reporte.id"
          @click="seleccionarReporte(reporte)"
          class="reporte-card"
          :class="{ active: reporteSeleccionado?.id === reporte.id }"
        >
          <div class="reporte-icon">{{ reporte.icon }}</div>
          <h3 class="reporte-title">{{ reporte.titulo }}</h3>
          <p class="reporte-desc">{{ reporte.descripcion }}</p>
          <div class="reporte-badge">{{ reporte.tipo }}</div>
        </div>
      </div>

      <!-- Filtros del Reporte Seleccionado -->
      <div v-if="reporteSeleccionado" class="card">
        <h2 class="section-title">{{ reporteSeleccionado.titulo }} - Filtros</h2>

        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Período</label>
            <select v-model="filtros.periodo" class="filter-select">
              <option value="bimestre1">1er Bimestre</option>
              <option value="bimestre2">2do Bimestre</option>
              <option value="bimestre3">3er Bimestre</option>
              <option value="bimestre4">4to Bimestre</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Grado/Sección</label>
            <select v-model="filtros.seccion" class="filter-select">
              <option value="todas">Todas mis secciones</option>
              <option value="3A">3° Secundaria - A</option>
              <option value="4B">4° Secundaria - B</option>
              <option value="5A">5° Secundaria - A</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Formato</label>
            <select v-model="filtros.formato" class="filter-select">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button @click="generarReporte" class="btn btn-success mt-4">
          📊 Generar Reporte
        </button>
      </div>

      <!-- Vista Previa del Reporte -->
      <div v-if="reporteGenerado" class="card mt-6">
        <h2 class="section-title">Vista Previa - {{ reporteGenerado.titulo }}</h2>

        <!-- Estadísticas Generales -->
        <div class="stats-preview">
          <div v-for="stat in reporteGenerado.stats" :key="stat.label" class="stat-preview-item">
            <div class="stat-preview-label">{{ stat.label }}</div>
            <div class="stat-preview-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          </div>
        </div>

        <!-- Gráficos y Datos -->
        <div class="charts-container">
          <!-- Gráfico de Barras Simulado -->
          <div class="chart-box">
            <h4 class="chart-title">Distribución de Calificaciones</h4>
            <div class="bar-chart">
              <div v-for="(bar, index) in chartData" :key="index" class="bar-item">
                <div class="bar" :style="{ height: bar.value + '%', backgroundColor: bar.color }"></div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>

          <!-- Lista de Datos -->
          <div class="chart-box">
            <h4 class="chart-title">Rendimiento por Estudiante</h4>
            <div class="data-table-preview">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Promedio</th>
                    <th>Asistencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="est in reporteGenerado.estudiantes" :key="est.id">
                    <td>{{ est.nombre }}</td>
                    <td :class="getPromedioClass(est.promedio)">{{ est.promedio }}</td>
                    <td>{{ est.asistencia }}%</td>
                    <td>
                      <span :class="['estado-badge', est.promedio >= 11 ? 'aprobado' : 'desaprobado']">
                        {{ est.promedio >= 11 ? 'Aprobado' : 'Desaprobado' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="observaciones-reporte">
          <h4 class="obs-title">Observaciones y Recomendaciones</h4>
          <ul class="obs-list">
            <li v-for="(obs, index) in reporteGenerado.observaciones" :key="index">{{ obs }}</li>
          </ul>
        </div>

        <div class="reporte-actions">
          <button @click="descargarReporte" class="btn btn-primary">
            📥 Descargar Reporte
          </button>
          <button @click="imprimirReporte" class="btn btn-outline">
            🖨️ Imprimir
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
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

// DATOS MOCK
const tiposReportes = ref([
  {
    id: 1,
    icon: '📈',
    titulo: 'Rendimiento Académico',
    descripcion: 'Análisis completo del rendimiento de los estudiantes',
    tipo: 'Académico'
  },
  {
    id: 2,
    icon: '📅',
    titulo: 'Reporte de Asistencia',
    descripcion: 'Estadísticas detalladas de asistencia',
    tipo: 'Asistencia'
  },
  {
    id: 3,
    icon: '📝',
    titulo: 'Evaluaciones Pendientes',
    descripcion: 'Listado de evaluaciones sin calificar',
    tipo: 'Evaluaciones'
  },
  {
    id: 4,
    icon: '⭐',
    titulo: 'Estudiantes Destacados',
    descripcion: 'Top 10 de estudiantes con mejor rendimiento',
    tipo: 'Reconocimiento'
  },
  {
    id: 5,
    icon: '⚠️',
    titulo: 'Estudiantes en Riesgo',
    descripcion: 'Identificación de estudiantes que necesitan apoyo',
    tipo: 'Alerta'
  },
  {
    id: 6,
    icon: '📊',
    titulo: 'Comparativo por Curso',
    descripcion: 'Comparación de rendimiento entre diferentes cursos',
    tipo: 'Comparativo'
  }
])

const reporteSeleccionado = ref(null)
const reporteGenerado = ref(null)
const showToast = ref(false)
const toastMessage = ref('')

const filtros = ref({
  periodo: 'bimestre1',
  seccion: 'todas',
  formato: 'pdf'
})

const chartData = ref([
  { label: '18-20', value: 85, color: '#10b981' },
  { label: '16-17', value: 70, color: #3b82f6' },
  { label: '14-15', value: 55, color: '#6366f1' },
  { label: '11-13', value: 40, color: '#f59e0b' },
  { label: '0-10', value: 20, color: '#ef4444' }
])

// Methods
const seleccionarReporte = (reporte) => {
  reporteSeleccionado.value = reporte
  reporteGenerado.value = null
}

const generarReporte = () => {
  // Simular generación de reporte
  setTimeout(() => {
    reporteGenerado.value = {
      titulo: reporteSeleccionado.value.titulo,
      stats: [
        { label: 'Total Estudiantes', value: '125', color: '#3b82f6' },
        { label: 'Promedio General', value: '15.8', color: '#10b981' },
        { label: 'Aprobados', value: '98', color: '#10b981' },
        { label: 'Desaprobados', value: '27', color: '#ef4444' },
        { label: 'Asistencia Promedio', value: '92%', color: '#6366f1' }
      ],
      estudiantes: [
        { id: 1, nombre: 'Juan Pérez García', promedio: 18.5, asistencia: 95 },
        { id: 2, nombre: 'María González López', promedio: 17.8, asistencia: 98 },
        { id: 3, nombre: 'Carlos Ramírez Torres', promedio: 16.2, asistencia: 90 },
        { id: 4, nombre: 'Ana Martínez Silva', promedio: 15.5, asistencia: 92 },
        { id: 5, nombre: 'Luis Fernández Cruz', promedio: 14.8, asistencia: 88 },
        { id: 6, nombre: 'Sofía Vargas Mendoza', promedio: 13.2, asistencia: 85 },
        { id: 7, nombre: 'Diego Castro Ruiz', promedio: 10.5, asistencia: 78 }
      ],
      observaciones: [
        'El 78% de los estudiantes mantiene un rendimiento sobre 14 puntos',
        'La asistencia general ha mejorado un 5% respecto al bimestre anterior',
        'Se recomienda refuerzo académico para 27 estudiantes con promedio menor a 11',
        'Los estudiantes con mejor asistencia también presentan mejor rendimiento académico'
      ]
    }

    mostrarToast('✅ Reporte generado exitosamente')
  }, 800)
}

const exportarReporte = () => {
  mostrarToast('📥 Exportando reporte...')
  setTimeout(() => {
    mostrarToast('✅ Reporte exportado')
  }, 1500)
}

const descargarReporte = () => {
  mostrarToast(`📥 Descargando reporte en formato ${filtros.value.formato.toUpperCase()}...`)
}

const imprimirReporte = () => {
  window.print()
}

const getPromedioClass = (promedio) => {
  if (promedio >= 18) return 'promedio-excelente'
  if (promedio >= 16) return 'promedio-muy-bueno'
  if (promedio >= 14) return 'promedio-bueno'
  if (promedio >= 11) return 'promedio-regular'
  return 'promedio-bajo'
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

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.reporte-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.reporte-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.reporte-card.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.reporte-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reporte-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.reporte-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.reporte-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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

.filter-select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.btn-success {
  background: #10b981;
  color: white;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-bottom: 1.5rem;
}

.stats-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.stat-preview-item {
  text-align: center;
}

.stat-preview-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-preview-value {
  font-size: 2rem;
  font-weight: 700;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-box {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 0.5rem;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar {
  width: 100%;
  min-height: 20px;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.3s;
}

.bar-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.data-table-preview {
  max-height: 300px;
  overflow-y: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-table th {
  text-align: left;
  padding: 0.75rem;
  background: white;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
}

.preview-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.promedio-excelente { color: #059669; font-weight: 700; }
.promedio-muy-bueno { color: #10b981; font-weight: 700; }
.promedio-bueno { color: #3b82f6; font-weight: 600; }
.promedio-regular { color: #f59e0b; font-weight: 600; }
.promedio-bajo { color: #ef4444; font-weight: 700; }

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.estado-badge.aprobado {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.desaprobado {
  background: #fee2e2;
  color: #991b1b;
}

.observaciones-reporte {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.obs-title {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 1rem 0;
}

.obs-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #78350f;
}

.obs-list li {
  margin-bottom: 0.5rem;
}

.reporte-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

  .reportes-grid {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .stats-preview {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
