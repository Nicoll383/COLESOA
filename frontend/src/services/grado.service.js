import api from './api'

export default {
  // Obtener todos los grados
  getAll(filters = {}) {
    return api.get('/grados', { params: filters })
  },

  // Obtener grado por ID
  getById(id) {
    return api.get(`/grados/${id}`)
  },

  // Crear grado
  create(gradoData) {
    return api.post('/grados', gradoData)
  },

  // Actualizar grado
  update(id, gradoData) {
    return api.put(`/grados/${id}`, gradoData)
  },

  // Obtener secciones de un grado
  getSecciones(id, año_escolar) {
    return api.get(`/grados/${id}/secciones`, {
      params: { año_escolar }
    })
  }
}
