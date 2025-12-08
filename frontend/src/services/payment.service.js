import api from './api'

export default {
  // Listar pagos
  getAll(filters = {}) {
    return api.get('/payments', { params: filters })
  },

  // Obtener pago por ID
  getById(id) {
    return api.get(`/payments/${id}`)
  },

  // Crear nuevo pago
  create(paymentData) {
    return api.post('/payments', paymentData)
  },

  // Actualizar estado del pago
  updateEstado(id, estado, observaciones = null) {
    return api.patch(`/payments/${id}/estado`, {
      estado,
      observaciones
    })
  },

  // Obtener pagos pendientes de una matrícula
  getPagosPendientes(matriculaId) {
    return api.get(`/payments/matricula/${matriculaId}/pendientes`)
  },

  // Obtener total pagado de una matrícula
  getTotalPagado(matriculaId) {
    return api.get(`/payments/matricula/${matriculaId}/total`)
  }
}
