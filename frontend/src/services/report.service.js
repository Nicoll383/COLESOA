import api from './api'

export default {
  // Dashboard general
  getDashboard(año_escolar) {
    return api.get('/reports/dashboard', {
      params: { año_escolar }
    })
  },

  // Estudiantes matriculados
  getEstudiantesMatriculados(año_escolar) {
    return api.get('/reports/estudiantes-matriculados', {
      params: { año_escolar }
    })
  },

  // Vacantes disponibles
  getVacantesDisponibles(año_escolar) {
    return api.get('/reports/vacantes-disponibles', {
      params: { año_escolar }
    })
  },

  // Reporte de pagos
  getPagos(filters = {}) {
    return api.get('/reports/pagos', {
      params: filters
    })
  },

  // Pagos pendientes
  getPagosPendientes(año_escolar) {
    return api.get('/reports/pagos-pendientes', {
      params: { año_escolar }
    })
  },

  // Estadísticas comparativas
  getEstadisticasComparativas() {
    return api.get('/reports/estadisticas-comparativas')
  }
}
