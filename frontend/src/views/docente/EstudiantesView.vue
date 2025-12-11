<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">👨‍🎓 Mis Estudiantes</h1>
        <p class="page-subtitle">Estudiantes a cargo en tus cursos</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">🔍 Buscar estudiante</label>
            <input
              v-model="filters.busqueda"
              type="text"
              placeholder="Nombre, apellido o DNI..."
              class="filter-input"
              @input="debouncedSearch"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">📚 Curso</label>
            <select v-model="filters.curso" class="filter-select">
              <option value="">Todos los cursos</option>
              <option v-for="curso in cursosDisponibles" :key="curso.id" :value="curso.id">
                {{ curso.nombre }} - {{ curso.grado }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">📊 Rendimiento</label>
            <select v-model="filters.rendimiento" class="filter-select">
              <option value="">Todos</option>
              <option value="excelente">Excelente (16-20)</option>
              <option value="bueno">Bueno (14-15)</option>
              <option value="regular">Regular (11-13)</option>
              <option value="bajo">Bajo (0-10)</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">📅 Asistencia</label>
            <select v-model="filters.asistencia" class="filter-select">
              <option value="">Todos</option>
              <option value="excelente">Excelente (≥95%)</option>
              <option value="buena">Buena (85-94%)</option>
              <option value="regular">Regular (70-84%)</option>
              <option value="baja">Baja (&lt;70%)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-grid mb-6">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            👥
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Estudiantes</div>
            <div class="stat-value">{{ estadisticas.total }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            ⭐
          </div>
          <div class="stat-content">
            <div class="stat-label">Promedio General</div>
            <div class="stat-value">{{ estadisticas.promedioGeneral.toFixed(1) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            📈
          </div>
          <div class="stat-content">
            <div class="stat-label">Rendimiento Alto</div>
            <div class="stat-value">{{ estadisticas.altoRendimiento }}</div>
            <div class="stat-detail">{{ ((estadisticas.altoRendimiento / estadisticas.total) * 100).toFixed(0) }}% del total</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-yellow-100 text-yellow-600">
            📅
          </div>
          <div class="stat-content">
            <div class="stat-label">Asistencia Promedio</div>
            <div class="stat-value">{{ estadisticas.asistenciaPromedio.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Lista de estudiantes -->
      <div class="card">
        <div class="section-header mb-4">
          <h2 class="section-title">Lista de Estudiantes</h2>
          <div class="section-actions">
            <button @click="cambiarVista('tarjetas')" :class="['btn-view', { active: vista === 'tarjetas' }]">
              📋 Tarjetas
            </button>
            <button @click="cambiarVista('tabla')" :class="['btn-view', { active: vista === 'tabla' }]">
              📊 Tabla
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="estudiantesFiltrados.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-title">No se encontraron estudiantes</p>
          <p class="empty-subtitle">Intenta ajustar los filtros de búsqueda</p>
        </div>

        <!-- Vista de tarjetas -->
        <div v-else-if="vista === 'tarjetas'" class="students-grid">
          <div
            v-for="estudiante in estudiantesPaginados"
            :key="estudiante.id"
            class="student-card"
            @click="verDetalleEstudiante(estudiante)"
          >
            <div class="student-header">
              <div class="student-avatar">
                {{ getIniciales(estudiante.nombre, estudiante.apellido) }}
              </div>
              <div class="student-info">
                <h3 class="student-name">{{ estudiante.nombre }} {{ estudiante.apellido }}</h3>
                <p class="student-detail">DNI: {{ estudiante.dni }}</p>
                <p class="student-detail">{{ estudiante.grado }} - {{ estudiante.seccion }}</p>
              </div>
            </div>

            <div class="student-stats">
              <div class="student-stat">
                <span class="stat-label">Promedio</span>
                <span :class="['stat-badge', getRendimientoClass(estudiante.promedio)]">
                  {{ estudiante.promedio.toFixed(1) }}
                </span>
              </div>
              <div class="student-stat">
                <span class="stat-label">Asistencia</span>
                <span :class="['stat-badge', getAsistenciaClass(estudiante.asistencia)]">
                  {{ estudiante.asistencia.toFixed(0) }}%
                </span>
              </div>
            </div>

            <div class="student-progress">
              <div class="progress-item">
                <div class="progress-label">
                  <span>Rendimiento</span>
                  <span class="progress-value">{{ estudiante.promedio.toFixed(1) }}/20</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(estudiante.promedio / 20) * 100}%`, backgroundColor: getRendimientoColor(estudiante.promedio) }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="student-footer">
              <span class="student-course">📚 {{ estudiante.curso }}</span>
              <button @click.stop="verDetalleEstudiante(estudiante)" class="btn-detail">
                Ver detalle →
              </button>
            </div>
          </div>
        </div>

        <!-- Vista de tabla -->
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>DNI</th>
                <th>Grado/Sección</th>
                <th>Curso</th>
                <th>Promedio</th>
                <th>Asistencia</th>
                <th>Comportamiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="estudiante in estudiantesPaginados"
                :key="estudiante.id"
                class="table-row"
              >
                <td>
                  <div class="student-cell">
                    <div class="student-avatar-small">
                      {{ getIniciales(estudiante.nombre, estudiante.apellido) }}
                    </div>
                    <div>
                      <div class="student-name-small">{{ estudiante.nombre }} {{ estudiante.apellido }}</div>
                      <div class="student-email">{{ estudiante.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ estudiante.dni }}</td>
                <td>{{ estudiante.grado }} - {{ estudiante.seccion }}</td>
                <td>{{ estudiante.curso }}</td>
                <td>
                  <span :class="['badge-promedio', getRendimientoClass(estudiante.promedio)]">
                    {{ estudiante.promedio.toFixed(1) }}
                  </span>
                </td>
                <td>
                  <span :class="['badge-asistencia', getAsistenciaClass(estudiante.asistencia)]">
                    {{ estudiante.asistencia.toFixed(0) }}%
                  </span>
                </td>
                <td>
                  <span :class="['badge-comportamiento', getComportamientoClass(estudiante.comportamiento)]">
                    {{ estudiante.comportamiento }}
                  </span>
                </td>
                <td>
                  <button
                    @click="verDetalleEstudiante(estudiante)"
                    class="btn-action"
                    title="Ver detalle"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="estudiantesFiltrados.length > 0" class="pagination">
          <button
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="btn-pagination"
          >
            ← Anterior
          </button>
          <div class="pagination-info">
            Página {{ paginaActual }} de {{ totalPaginas }} ({{ estudiantesFiltrados.length }} estudiantes)
          </div>
          <button
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="btn-pagination"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalle -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Detalle del Estudiante</h2>
          <button @click="cerrarModal" class="btn-close">✕</button>
        </div>

        <div v-if="estudianteSeleccionado" class="modal-body">
          <!-- Información personal -->
          <div class="detail-section">
            <div class="detail-header-student">
              <div class="student-avatar-large">
                {{ getIniciales(estudianteSeleccionado.nombre, estudianteSeleccionado.apellido) }}
              </div>
              <div>
                <h3 class="student-name-large">{{ estudianteSeleccionado.nombre }} {{ estudianteSeleccionado.apellido }}</h3>
                <p class="student-detail">DNI: {{ estudianteSeleccionado.dni }}</p>
                <p class="student-detail">{{ estudianteSeleccionado.grado }} - {{ estudianteSeleccionado.seccion }}</p>
                <p class="student-detail">📧 {{ estudianteSeleccionado.email }}</p>
              </div>
            </div>
          </div>

          <!-- Estadísticas generales -->
          <div class="detail-section">
            <h3 class="detail-subtitle">📊 Estadísticas Generales</h3>
            <div class="stats-grid-modal">
              <div class="stat-item">
                <span class="stat-label-modal">Promedio General</span>
                <span :class="['stat-value-modal', getRendimientoClass(estudianteSeleccionado.promedio)]">
                  {{ estudianteSeleccionado.promedio.toFixed(1) }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label-modal">Asistencia</span>
                <span :class="['stat-value-modal', getAsistenciaClass(estudianteSeleccionado.asistencia)]">
                  {{ estudianteSeleccionado.asistencia.toFixed(0) }}%
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label-modal">Comportamiento</span>
                <span :class="['stat-value-modal', getComportamientoClass(estudianteSeleccionado.comportamiento)]">
                  {{ estudianteSeleccionado.comportamiento }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label-modal">Tareas Entregadas</span>
                <span class="stat-value-modal">
                  {{ estudianteSeleccionado.tareasEntregadas }}/{{ estudianteSeleccionado.tareasTotal }}
                </span>
              </div>
            </div>
          </div>

          <!-- Notas por curso -->
          <div class="detail-section">
            <h3 class="detail-subtitle">📚 Notas por Curso</h3>
            <div class="notas-grid">
              <div
                v-for="nota in estudianteSeleccionado.notasPorCurso"
                :key="nota.curso"
                class="nota-item"
              >
                <div class="nota-curso">{{ nota.curso }}</div>
                <div class="nota-values">
                  <span class="nota-periodo">P1: {{ nota.periodo1 }}</span>
                  <span class="nota-periodo">P2: {{ nota.periodo2 }}</span>
                  <span class="nota-periodo">P3: {{ nota.periodo3 }}</span>
                  <span :class="['nota-promedio', getRendimientoClass(nota.promedio)]">
                    Prom: {{ nota.promedio.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Asistencia mensual -->
          <div class="detail-section">
            <h3 class="detail-subtitle">📅 Asistencia Mensual</h3>
            <div class="asistencia-grid">
              <div
                v-for="mes in estudianteSeleccionado.asistenciaMensual"
                :key="mes.mes"
                class="asistencia-item"
              >
                <div class="asistencia-mes">{{ mes.mes }}</div>
                <div class="asistencia-stats">
                  <span class="asistencia-valor presente">✓ {{ mes.presentes }}</span>
                  <span class="asistencia-valor tardanza">⏰ {{ mes.tardanzas }}</span>
                  <span class="asistencia-valor ausente">✗ {{ mes.ausentes }}</span>
                </div>
                <div class="asistencia-porcentaje" :class="getAsistenciaClass(mes.porcentaje)">
                  {{ mes.porcentaje.toFixed(0) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="detail-section">
            <h3 class="detail-subtitle">📝 Observaciones Recientes</h3>
            <div class="observaciones-list">
              <div
                v-for="obs in estudianteSeleccionado.observaciones"
                :key="obs.id"
                class="observacion-item"
              >
                <div class="observacion-header">
                  <span :class="['observacion-tipo', obs.tipo]">{{ obs.tipo }}</span>
                  <span class="observacion-fecha">{{ formatearFecha(obs.fecha) }}</span>
                </div>
                <p class="observacion-texto">{{ obs.texto }}</p>
                <p class="observacion-autor">Por: {{ obs.docente }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

// Estado
const loading = ref(false)
const vista = ref('tarjetas') // 'tarjetas' o 'tabla'
const mostrarModal = ref(false)
const estudianteSeleccionado = ref(null)

// Filtros
const filters = ref({
  busqueda: '',
  curso: '',
  rendimiento: '',
  asistencia: ''
})

// Paginación
const paginaActual = ref(1)
const porPagina = 12

// Datos
const estudiantes = ref([])
const cursosDisponibles = ref([])

// Datos de ejemplo
const datosEjemplo = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez García',
    dni: '12345678',
    email: 'juan.perez@estudiante.com',
    grado: '3ro Secundaria',
    seccion: 'A',
    curso: 'Matemáticas',
    promedio: 16.5,
    asistencia: 92.5,
    comportamiento: 'Excelente',
    tareasEntregadas: 18,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Matemáticas', periodo1: 16, periodo2: 17, periodo3: 17, promedio: 16.67 },
      { curso: 'Comunicación', periodo1: 15, periodo2: 16, periodo3: 16, promedio: 15.67 },
      { curso: 'Ciencias', periodo1: 17, periodo2: 18, periodo3: 17, promedio: 17.33 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 18, tardanzas: 2, ausentes: 1, porcentaje: 95.2 },
      { mes: 'Abril', presentes: 17, tardanzas: 1, ausentes: 2, porcentaje: 90.0 },
      { mes: 'Mayo', presentes: 19, tardanzas: 1, ausentes: 1, porcentaje: 90.5 }
    ],
    observaciones: [
      { id: 1, tipo: 'positiva', fecha: '2024-05-15', texto: 'Excelente participación en clase', docente: 'Prof. María López' },
      { id: 2, tipo: 'neutral', fecha: '2024-05-10', texto: 'Entregó tarea con retraso', docente: 'Prof. Carlos Ruiz' }
    ]
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'González López',
    dni: '23456789',
    email: 'maria.gonzalez@estudiante.com',
    grado: '3ro Secundaria',
    seccion: 'A',
    curso: 'Matemáticas',
    promedio: 18.2,
    asistencia: 97.0,
    comportamiento: 'Excelente',
    tareasEntregadas: 20,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Matemáticas', periodo1: 18, periodo2: 19, periodo3: 18, promedio: 18.33 },
      { curso: 'Comunicación', periodo1: 17, periodo2: 18, periodo3: 19, promedio: 18.00 },
      { curso: 'Ciencias', periodo1: 18, periodo2: 18, periodo3: 19, promedio: 18.33 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 20, tardanzas: 1, ausentes: 0, porcentaje: 100 },
      { mes: 'Abril', presentes: 19, tardanzas: 1, ausentes: 0, porcentaje: 95.0 },
      { mes: 'Mayo', presentes: 20, tardanzas: 0, ausentes: 1, porcentaje: 95.2 }
    ],
    observaciones: [
      { id: 1, tipo: 'positiva', fecha: '2024-05-18', texto: 'Estudiante destacada, siempre colaborativa', docente: 'Prof. María López' }
    ]
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Ramírez Torres',
    dni: '34567890',
    email: 'carlos.ramirez@estudiante.com',
    grado: '3ro Secundaria',
    seccion: 'B',
    curso: 'Física',
    promedio: 13.5,
    asistencia: 78.0,
    comportamiento: 'Regular',
    tareasEntregadas: 12,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Física', periodo1: 12, periodo2: 14, periodo3: 14, promedio: 13.33 },
      { curso: 'Química', periodo1: 13, periodo2: 13, periodo3: 14, promedio: 13.33 },
      { curso: 'Matemáticas', periodo1: 14, periodo2: 14, periodo3: 13, promedio: 13.67 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 15, tardanzas: 3, ausentes: 3, porcentaje: 71.4 },
      { mes: 'Abril', presentes: 16, tardanzas: 2, ausentes: 2, porcentaje: 80.0 },
      { mes: 'Mayo', presentes: 17, tardanzas: 2, ausentes: 2, porcentaje: 81.0 }
    ],
    observaciones: [
      { id: 1, tipo: 'negativa', fecha: '2024-05-12', texto: 'Frecuentes inasistencias', docente: 'Prof. Juan Díaz' },
      { id: 2, tipo: 'neutral', fecha: '2024-05-08', texto: 'Necesita mejorar entrega de tareas', docente: 'Prof. Ana Morales' }
    ]
  },
  {
    id: 4,
    nombre: 'Ana',
    apellido: 'Martínez Silva',
    dni: '45678901',
    email: 'ana.martinez@estudiante.com',
    grado: '4to Secundaria',
    seccion: 'A',
    curso: 'Historia',
    promedio: 15.8,
    asistencia: 88.5,
    comportamiento: 'Bueno',
    tareasEntregadas: 17,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Historia', periodo1: 15, periodo2: 16, periodo3: 16, promedio: 15.67 },
      { curso: 'Geografía', periodo1: 16, periodo2: 16, periodo3: 15, promedio: 15.67 },
      { curso: 'Educación Cívica', periodo1: 16, periodo2: 16, periodo3: 16, promedio: 16.00 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 18, tardanzas: 2, ausentes: 1, porcentaje: 85.7 },
      { mes: 'Abril', presentes: 18, tardanzas: 1, ausentes: 1, porcentaje: 90.0 },
      { mes: 'Mayo', presentes: 18, tardanzas: 2, ausentes: 1, porcentaje: 85.7 }
    ],
    observaciones: [
      { id: 1, tipo: 'positiva', fecha: '2024-05-16', texto: 'Buen desempeño en exposiciones', docente: 'Prof. Roberto Sánchez' }
    ]
  },
  {
    id: 5,
    nombre: 'Luis',
    apellido: 'Fernández Cruz',
    dni: '56789012',
    email: 'luis.fernandez@estudiante.com',
    grado: '5to Secundaria',
    seccion: 'A',
    curso: 'Literatura',
    promedio: 17.3,
    asistencia: 94.0,
    comportamiento: 'Excelente',
    tareasEntregadas: 19,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Literatura', periodo1: 17, periodo2: 18, periodo3: 17, promedio: 17.33 },
      { curso: 'Comunicación', periodo1: 17, periodo2: 17, periodo3: 18, promedio: 17.33 },
      { curso: 'Inglés', periodo1: 17, periodo2: 17, periodo3: 17, promedio: 17.00 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 19, tardanzas: 1, ausentes: 1, porcentaje: 90.5 },
      { mes: 'Abril', presentes: 19, tardanzas: 0, ausentes: 1, porcentaje: 95.0 },
      { mes: 'Mayo', presentes: 20, tardanzas: 1, ausentes: 0, porcentaje: 95.2 }
    ],
    observaciones: [
      { id: 1, tipo: 'positiva', fecha: '2024-05-14', texto: 'Excelente análisis literario', docente: 'Prof. Carmen Vega' }
    ]
  },
  {
    id: 6,
    nombre: 'Sofía',
    apellido: 'Vargas Mendoza',
    dni: '67890123',
    email: 'sofia.vargas@estudiante.com',
    grado: '3ro Secundaria',
    seccion: 'A',
    curso: 'Matemáticas',
    promedio: 14.2,
    asistencia: 85.0,
    comportamiento: 'Bueno',
    tareasEntregadas: 15,
    tareasTotal: 20,
    notasPorCurso: [
      { curso: 'Matemáticas', periodo1: 14, periodo2: 14, periodo3: 15, promedio: 14.33 },
      { curso: 'Física', periodo1: 13, periodo2: 14, periodo3: 15, promedio: 14.00 },
      { curso: 'Química', periodo1: 14, periodo2: 15, periodo3: 14, promedio: 14.33 }
    ],
    asistenciaMensual: [
      { mes: 'Marzo', presentes: 17, tardanzas: 2, ausentes: 2, porcentaje: 81.0 },
      { mes: 'Abril', presentes: 17, tardanzas: 2, ausentes: 1, porcentaje: 85.0 },
      { mes: 'Mayo', presentes: 18, tardanzas: 1, ausentes: 2, porcentaje: 85.7 }
    ],
    observaciones: [
      { id: 1, tipo: 'neutral', fecha: '2024-05-11', texto: 'Debe mejorar puntualidad', docente: 'Prof. María López' }
    ]
  }
]

// Computed
const estudiantesFiltrados = computed(() => {
  let resultado = estudiantes.value

  // Filtro de búsqueda
  if (filters.value.busqueda) {
    const busqueda = filters.value.busqueda.toLowerCase()
    resultado = resultado.filter(est =>
      est.nombre.toLowerCase().includes(busqueda) ||
      est.apellido.toLowerCase().includes(busqueda) ||
      est.dni.includes(busqueda)
    )
  }

  // Filtro de curso
  if (filters.value.curso) {
    resultado = resultado.filter(est => est.curso === filters.value.curso)
  }

  // Filtro de rendimiento
  if (filters.value.rendimiento) {
    resultado = resultado.filter(est => {
      const promedio = est.promedio
      switch (filters.value.rendimiento) {
        case 'excelente': return promedio >= 16
        case 'bueno': return promedio >= 14 && promedio < 16
        case 'regular': return promedio >= 11 && promedio < 14
        case 'bajo': return promedio < 11
        default: return true
      }
    })
  }

  // Filtro de asistencia
  if (filters.value.asistencia) {
    resultado = resultado.filter(est => {
      const asistencia = est.asistencia
      switch (filters.value.asistencia) {
        case 'excelente': return asistencia >= 95
        case 'buena': return asistencia >= 85 && asistencia < 95
        case 'regular': return asistencia >= 70 && asistencia < 85
        case 'baja': return asistencia < 70
        default: return true
      }
    })
  }

  return resultado
})

const estudiantesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  const fin = inicio + porPagina
  return estudiantesFiltrados.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(estudiantesFiltrados.value.length / porPagina)
})

const estadisticas = computed(() => {
  const total = estudiantes.value.length
  if (total === 0) {
    return {
      total: 0,
      promedioGeneral: 0,
      altoRendimiento: 0,
      asistenciaPromedio: 0
    }
  }

  const sumaPromedios = estudiantes.value.reduce((sum, est) => sum + est.promedio, 0)
  const sumaAsistencia = estudiantes.value.reduce((sum, est) => sum + est.asistencia, 0)
  const altoRendimiento = estudiantes.value.filter(est => est.promedio >= 16).length

  return {
    total,
    promedioGeneral: sumaPromedios / total,
    altoRendimiento,
    asistenciaPromedio: sumaAsistencia / total
  }
})

// Métodos
const cargarDatos = async () => {
  loading.value = true
  try {
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 500))
    estudiantes.value = datosEjemplo

    // Extraer cursos únicos
    const cursosUnicos = [...new Set(datosEjemplo.map(e => e.curso))]
    cursosDisponibles.value = cursosUnicos.map((nombre, index) => ({
      id: nombre,
      nombre: nombre,
      grado: datosEjemplo.find(e => e.curso === nombre)?.grado || ''
    }))
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    paginaActual.value = 1
  }, 300)
}

const cambiarVista = (nuevaVista) => {
  vista.value = nuevaVista
}

const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const verDetalleEstudiante = (estudiante) => {
  estudianteSeleccionado.value = estudiante
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  estudianteSeleccionado.value = null
}

const getIniciales = (nombre, apellido) => {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

const getRendimientoClass = (promedio) => {
  if (promedio >= 16) return 'excelente'
  if (promedio >= 14) return 'bueno'
  if (promedio >= 11) return 'regular'
  return 'bajo'
}

const getRendimientoColor = (promedio) => {
  if (promedio >= 16) return '#10b981'
  if (promedio >= 14) return '#3b82f6'
  if (promedio >= 11) return '#f59e0b'
  return '#ef4444'
}

const getAsistenciaClass = (asistencia) => {
  if (asistencia >= 95) return 'excelente'
  if (asistencia >= 85) return 'bueno'
  if (asistencia >= 70) return 'regular'
  return 'bajo'
}

const getComportamientoClass = (comportamiento) => {
  const comp = comportamiento.toLowerCase()
  if (comp === 'excelente') return 'excelente'
  if (comp === 'bueno') return 'bueno'
  if (comp === 'regular') return 'regular'
  return 'bajo'
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Lifecycle
onMounted(() => {
  cargarDatos()
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

.mb-6 {
  margin-bottom: 1.5rem;
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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

.filter-input,
.filter-select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.stat-detail {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #f9fafb;
}

.btn-view.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: #6b7280;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.student-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.student-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.student-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.student-detail {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.125rem 0;
}

.student-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.student-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-stat .stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.stat-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

.stat-badge.excelente {
  background: #d1fae5;
  color: #065f46;
}

.stat-badge.bueno {
  background: #dbeafe;
  color: #1e40af;
}

.stat-badge.regular {
  background: #fef3c7;
  color: #92400e;
}

.stat-badge.bajo {
  background: #fee2e2;
  color: #991b1b;
}

.student-progress {
  margin-bottom: 1rem;
}

.progress-item {
  margin-bottom: 0.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-value {
  font-weight: 600;
  color: #111827;
}

.progress-bar {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.student-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.student-course {
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-detail {
  padding: 0.375rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-detail:hover {
  background: #2563eb;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem;
  background: #f9fafb;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:hover {
  background: #f9fafb;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar-small {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.student-name-small {
  font-weight: 600;
  color: #111827;
}

.student-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.badge-promedio,
.badge-asistencia,
.badge-comportamiento {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.badge-promedio.excelente,
.badge-asistencia.excelente,
.badge-comportamiento.excelente {
  background: #d1fae5;
  color: #065f46;
}

.badge-promedio.bueno,
.badge-asistencia.bueno,
.badge-comportamiento.bueno {
  background: #dbeafe;
  color: #1e40af;
}

.badge-promedio.regular,
.badge-asistencia.regular,
.badge-comportamiento.regular {
  background: #fef3c7;
  color: #92400e;
}

.badge-promedio.bajo,
.badge-asistencia.bajo,
.badge-comportamiento.bajo {
  background: #fee2e2;
  color: #991b1b;
}

.btn-action {
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-action:hover {
  background: #e5e7eb;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
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
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.btn-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-header-student {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.student-avatar-large {
  width: 5rem;
  height: 5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
  flex-shrink: 0;
}

.student-name-large {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.detail-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.stats-grid-modal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label-modal {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value-modal {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-value-modal.excelente {
  color: #065f46;
}

.stat-value-modal.bueno {
  color: #1e40af;
}

.stat-value-modal.regular {
  color: #92400e;
}

.stat-value-modal.bajo {
  color: #991b1b;
}

.notas-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nota-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nota-curso {
  font-weight: 600;
  color: #111827;
  flex: 1;
  min-width: 150px;
}

.nota-values {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nota-periodo {
  font-size: 0.875rem;
  color: #6b7280;
}

.nota-promedio {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.nota-promedio.excelente {
  background: #d1fae5;
  color: #065f46;
}

.nota-promedio.bueno {
  background: #dbeafe;
  color: #1e40af;
}

.nota-promedio.regular {
  background: #fef3c7;
  color: #92400e;
}

.nota-promedio.bajo {
  background: #fee2e2;
  color: #991b1b;
}

.asistencia-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.asistencia-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.asistencia-mes {
  font-weight: 600;
  color: #111827;
  min-width: 80px;
}

.asistencia-stats {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.asistencia-valor {
  font-size: 0.875rem;
}

.asistencia-valor.presente {
  color: #065f46;
}

.asistencia-valor.tardanza {
  color: #92400e;
}

.asistencia-valor.ausente {
  color: #991b1b;
}

.asistencia-porcentaje {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.asistencia-porcentaje.excelente {
  background: #d1fae5;
  color: #065f46;
}

.asistencia-porcentaje.bueno {
  background: #dbeafe;
  color: #1e40af;
}

.asistencia-porcentaje.regular {
  background: #fef3c7;
  color: #92400e;
}

.asistencia-porcentaje.bajo {
  background: #fee2e2;
  color: #991b1b;
}

.observaciones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.observacion-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 3px solid #e5e7eb;
}

.observacion-item:has(.observacion-tipo.positiva) {
  border-left-color: #10b981;
}

.observacion-item:has(.observacion-tipo.negativa) {
  border-left-color: #ef4444;
}

.observacion-item:has(.observacion-tipo.neutral) {
  border-left-color: #f59e0b;
}

.observacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.observacion-tipo {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.observacion-tipo.positiva {
  background: #d1fae5;
  color: #065f46;
}

.observacion-tipo.negativa {
  background: #fee2e2;
  color: #991b1b;
}

.observacion-tipo.neutral {
  background: #fef3c7;
  color: #92400e;
}

.observacion-fecha {
  font-size: 0.75rem;
  color: #6b7280;
}

.observacion-texto {
  color: #374151;
  margin: 0.5rem 0;
}

.observacion-autor {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Utility classes */
.bg-blue-100 { background: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-green-100 { background: #d1fae5; }
.text-green-600 { color: #059669; }
.bg-purple-100 { background: #e9d5ff; }
.text-purple-600 { color: #9333ea; }
.bg-yellow-100 { background: #fef3c7; }
.text-yellow-600 { color: #d97706; }

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-container {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 800px;
  }
}
</style>
