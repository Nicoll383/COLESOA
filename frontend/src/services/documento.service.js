import api from './api'

class DocumentoService {
  // ========== ENDPOINTS PARA PADRES ==========

  /**
   * Obtener documentos de un estudiante específico (para padres)
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise} - Lista de documentos del estudiante
   */
  getDocumentosEstudiante(estudianteId) {
    return api.get(`/padre/hijos/${estudianteId}/documentos`)
  }

  /**
   * Subir un documento para un estudiante
   * Nota: El backend espera la ruta /padre/hijos/:estudianteId/documentos/:documentoId/upload
   * Pero DocumentosUpload.vue solo pasa documentoId, así que necesitamos obtener estudianteId del documento
   * @param {number} documentoId - ID del documento en documentos_estudiante
   * @param {File} file - Archivo a subir
   * @param {number} estudianteId - ID del estudiante (opcional, se puede inferir del documento)
   * @returns {Promise} - Respuesta del servidor
   */
  async subirDocumento(documentoId, file, estudianteId = null) {
    const formData = new FormData()
    formData.append('file', file)

    // Si no se proporciona estudianteId, intentamos obtenerlo del documento
    // Por ahora usamos un endpoint simplificado que solo necesita el documentoId
    // TODO: Ajustar backend para aceptar /documentos/:documentoId/upload
    if (estudianteId) {
      // NO configurar Content-Type manualmente, axios lo hace automáticamente con FormData
      return api.post(`/padre/hijos/${estudianteId}/documentos/${documentoId}/upload`, formData)
    } else {
      // Endpoint alternativo si no tenemos estudianteId
      return api.post(`/documentos/${documentoId}/upload`, formData)
    }
  }

  /**
   * Obtener seguimiento/historial de un documento
   * @param {number} documentoId - ID del documento
   * @returns {Promise} - Historial de cambios del documento
   */
  getSeguimiento(documentoId) {
    return api.get(`/documentos/${documentoId}/seguimiento`)
  }

  // ========== ENDPOINTS PARA SECRETARIA/ADMINISTRADOR ==========

  /**
   * Obtener todos los documentos pendientes de revisión
   * @returns {Promise} - Lista de documentos para revisar
   */
  getDocumentosPendientesRevision() {
    return api.get('/documentos/pendientes-revision')
  }

  /**
   * Cambiar estado de un documento (aprobar/rechazar)
   * @param {number} documentoId - ID del documento
   * @param {string} estado - Nuevo estado ('aceptado', 'rechazado', 'en_revision')
   * @param {string} observaciones - Observaciones opcionales
   * @returns {Promise} - Respuesta del servidor
   */
  cambiarEstado(documentoId, estado, observaciones = null) {
    return api.patch(`/documentos/${documentoId}/estado`, {
      estado,
      observaciones
    })
  }

  /**
   * Obtener estadísticas de documentos
   * @returns {Promise} - Estadísticas generales
   */
  getEstadisticas() {
    return api.get('/documentos/estadisticas')
  }

  // ========== ENDPOINTS GENERALES ==========

  /**
   * Obtener documentos requeridos del sistema
   * @returns {Promise} - Lista de tipos de documentos
   */
  getDocumentosRequeridos() {
    return api.get('/documentos/requeridos')
  }

  /**
   * Obtener documento por ID
   * @param {number} documentoId - ID del documento
   * @returns {Promise} - Información del documento
   */
  getDocumentoById(documentoId) {
    return api.get(`/documentos/${documentoId}`)
  }

  /**
   * Obtener resumen de documentos por matrícula
   * @param {number} matriculaId - ID de la matrícula
   * @returns {Promise} - Resumen de documentos
   */
  getResumenPorMatricula(matriculaId) {
    return api.get(`/documentos/resumen/matricula/${matriculaId}`)
  }

  /**
   * Construir URL completa para un archivo
   * @param {string} archivoUrl - URL relativa del archivo
   * @returns {string} - URL completa
   */
  getFileUrl(archivoUrl) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${baseUrl}${archivoUrl}`
  }
}

export default new DocumentoService()
