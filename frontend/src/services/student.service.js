import api from './api'

export default {
  // Obtener todos los estudiantes
  getAll(filters = {}) {
    return api.get('/students', { params: filters })
  },

  // Obtener estudiante por ID
  getById(id) {
    return api.get(`/students/${id}`)
  },

  // Crear nuevo estudiante
  create(studentData) {
    return api.post('/students', studentData)
  },

  // Actualizar estudiante
  update(id, studentData) {
    return api.put(`/students/${id}`, studentData)
  },

  // Eliminar estudiante
  delete(id) {
    return api.delete(`/students/${id}`)
  },

  // Validar si puede matricularse en un grado
  validarMatricula(estudianteId, gradoId) {
    return api.post('/students/validar-matricula', {
      estudianteId,
      gradoId
    })
  },

  // Verificar documentos completos
  verificarDocumentos(id) {
    return api.get(`/students/${id}/verificar-documentos`)
  },

  // Subir documento
  subirDocumento(formData) {
    return api.post('/students/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Agregar historial académico
  agregarHistorial(historialData) {
    return api.post('/students/historial', historialData)
  }
}
