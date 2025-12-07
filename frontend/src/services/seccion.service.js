import api from './api'

export default {
  // Obtener todas las secciones
  getAll(filters = {}) {
    return api.get('/secciones', { params: filters })
  },

  // Obtener sección por ID
  getById(id) {
    return api.get(`/secciones/${id}`)
  },

  // Crear sección
  create(seccionData) {
    return api.post('/secciones', seccionData)
  },

  // Actualizar sección
  update(id, seccionData) {
    return api.put(`/secciones/${id}`, seccionData)
  },

  // Eliminar sección
  delete(id) {
    return api.delete(`/secciones/${id}`)
  },

  // Obtener estudiantes de una sección
  getEstudiantes(id, año_escolar) {
    return api.get(`/secciones/${id}/estudiantes`, {
      params: { año_escolar }
    })
  },

  // Obtener horario de una sección
  getHorario(id, año_escolar) {
    return api.get(`/secciones/${id}/horario`, {
      params: { año_escolar }
    })
  },

  // Agregar horario
  agregarHorario(horarioData) {
    return api.post('/secciones/horarios', horarioData)
  },

  // Eliminar horario
  eliminarHorario(horario_id) {
    return api.delete(`/secciones/horarios/${horario_id}`)
  }
}
