import api from './api'

export default {
  // Obtener todos los cursos
  getAll(filters = {}) {
    return api.get('/cursos', { params: filters })
  },

  // Obtener curso por ID
  getById(id) {
    return api.get(`/cursos/${id}`)
  },

  // Crear curso
  create(cursoData) {
    return api.post('/cursos', cursoData)
  },

  // Actualizar curso
  update(id, cursoData) {
    return api.put(`/cursos/${id}`, cursoData)
  },

  // Eliminar curso
  delete(id) {
    return api.delete(`/cursos/${id}`)
  },

  // Asignar curso a sección
  asignarASeccion(data) {
    return api.post('/cursos/asignar', data)
  },

  // Obtener cursos de una sección
  getCursosBySeccion(seccion_id, año_escolar) {
    return api.get('/cursos/seccion/cursos', {
      params: { seccion_id, año_escolar }
    })
  },

  // Obtener secciones que tienen un curso
  getSeccionesByCurso(curso_id, año_escolar) {
    return api.get('/cursos/curso/secciones', {
      params: { curso_id, año_escolar }
    })
  },

  // Remover curso de sección
  removerDeSeccion(asignacion_id) {
    return api.delete(`/cursos/asignar/${asignacion_id}`)
  },

  // Actualizar docente de un curso
  actualizarDocente(asignacion_id, docente_id) {
    return api.patch(`/cursos/asignar/${asignacion_id}/docente`, { docente_id })
  }
}
