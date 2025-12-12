import api from './api'

export default {
  // Obtener todas las matrículas
  getAll(filters = {}) {
    return api.get('/enrollments', { params: filters })
  },

  // Obtener matrícula por ID
  getById(id) {
    return api.get(`/enrollments/${id}`)
  },

  // Crear nueva matrícula (preinscripción)
  create(enrollmentData) {
    return api.post('/enrollments', enrollmentData)
  },

  // Actualizar estado de matrícula
  updateEstado(id, estado, observaciones = null) {
    return api.patch(`/enrollments/${id}/estado`, {
      estado,
      observaciones
    })
  },

  // Anular matrícula
  anular(id, motivo) {
    return api.post(`/enrollments/${id}/anular`, { motivo })
  },

  // Confirmar matrícula (inicializar documentos y enviar credenciales)
  confirmar(id) {
    return api.post(`/enrollments/${id}/confirmar`)
  },

  // Obtener secciones con vacantes
  getSeccionesConVacantes(añoEscolar) {
    return api.get('/enrollments/secciones-vacantes', {
      params: { año_escolar: añoEscolar }
    })
  },

  // Obtener vacantes de una sección
  getVacantes(seccionId, añoEscolar) {
    return api.get('/enrollments/vacantes', {
      params: {
        seccion_id: seccionId,
        año_escolar: añoEscolar
      }
    })
  },

  // Validar si estudiante puede matricularse en un grado
  validarGrado(estudianteId, gradoId) {
    return api.get(`/enrollments/validar-grado/${estudianteId}/${gradoId}`)
  },

  // Descargar contrato en PDF
  descargarContrato(id) {
    return api.get(`/enrollments/${id}/contrato`, {
      responseType: 'blob'
    })
  },

  // Descargar comprobante en PDF
  descargarComprobante(id) {
    return api.get(`/enrollments/${id}/comprobante`, {
      responseType: 'blob'
    })
  },

  // Obtener credenciales de acceso
  getCredenciales(id) {
    return api.get(`/enrollments/${id}/credenciales`)
  }
}
