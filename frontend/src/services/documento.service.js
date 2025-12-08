import api from './api'

export default {
  // Obtener documentos requeridos
  getDocumentosRequeridos() {
    return api.get('/documentos/requeridos')
  },

  // Obtener documentos de un estudiante
  getDocumentosEstudiante(estudianteId, matriculaId = null) {
    const params = matriculaId ? { matricula_id: matriculaId } : {}
    return api.get(`/documentos/estudiante/${estudianteId}`, { params })
  },

  // Subir documento
  subirDocumento(documentoEstudianteId, archivo) {
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('documentoEstudianteId', documentoEstudianteId)

    return api.post('/documentos/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Cambiar estado del documento
  cambiarEstado(documentoId, estado, observaciones = null) {
    return api.patch(`/documentos/${documentoId}/estado`, {
      estado,
      observaciones
    })
  },

  // Obtener seguimiento de un documento
  getSeguimiento(documentoId) {
    return api.get(`/documentos/${documentoId}/seguimiento`)
  },

  // Obtener resumen por matrícula
  getResumenPorMatricula(matriculaId) {
    return api.get(`/documentos/resumen/matricula/${matriculaId}`)
  },

  // Obtener documentos pendientes de revisión
  getDocumentosPendientesRevision() {
    return api.get('/documentos/pendientes-revision')
  },

  // Obtener documento por ID
  getDocumentoById(documentoId) {
    return api.get(`/documentos/${documentoId}`)
  }
}
