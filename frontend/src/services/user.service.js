import api from './api'

export default {
  // Obtener todos los usuarios
  getAll(filters = {}) {
    return api.get('/users', { params: filters })
  },

  // Obtener usuario por ID
  getById(id) {
    return api.get(`/users/${id}`)
  },

  // Crear nuevo usuario
  create(userData) {
    return api.post('/users', userData)
  },

  // Actualizar usuario
  update(id, userData) {
    return api.put(`/users/${id}`, userData)
  },

  // Cambiar estado del usuario
  toggleEstado(id, estado) {
    return api.patch(`/users/${id}/estado`, { estado })
  },

  // Cambiar contraseña
  changePassword(id, newPassword) {
    return api.patch(`/users/${id}/password`, { newPassword })
  }
}
