import api from './api'

export default {
  // Obtener todas las configuraciones
  getAll(filters = {}) {
    return api.get('/config-año-escolar', { params: filters })
  },

  // Obtener configuración por ID
  getById(id) {
    return api.get(`/config-año-escolar/${id}`)
  },

  // Obtener configuración por año
  getByYear(year) {
    return api.get(`/config-año-escolar/year/${year}`)
  },

  // Obtener configuración activa
  getActive() {
    return api.get('/config-año-escolar/active')
  },

  // Crear nueva configuración
  create(configData) {
    return api.post('/config-año-escolar', configData)
  },

  // Actualizar configuración
  update(id, configData) {
    return api.put(`/config-año-escolar/${id}`, configData)
  },

  // Cambiar estado
  toggleEstado(id, estado) {
    return api.patch(`/config-año-escolar/${id}/estado`, { estado })
  },

  // Eliminar configuración
  delete(id) {
    return api.delete(`/config-año-escolar/${id}`)
  }
}
