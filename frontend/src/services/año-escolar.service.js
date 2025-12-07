import api from './api'

export default {
  // Obtener todas las configuraciones
  getAll(filters = {}) {
    return api.get('/school-year-config', { params: filters })
  },

  // Obtener configuración por ID
  getById(id) {
    return api.get(`/school-year-config/${id}`)
  },

  // Obtener configuración por año
  getByYear(year) {
    return api.get(`/school-year-config/year/${year}`)
  },

  // Obtener configuración activa
  getActive() {
    return api.get('/school-year-config/active')
  },

  // Crear nueva configuración
  create(configData) {
    return api.post('/school-year-config', configData)
  },

  // Actualizar configuración
  update(id, configData) {
    return api.put(`/school-year-config/${id}`, configData)
  },

  // Cambiar estado
  toggleEstado(id, estado) {
    return api.patch(`/school-year-config/${id}/estado`, { estado })
  },

  // Eliminar configuración
  delete(id) {
    return api.delete(`/school-year-config/${id}`)
  }
}
