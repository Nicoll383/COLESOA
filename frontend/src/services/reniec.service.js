import api from './api'

export default {
  // Consultar DNI en RENIEC
  consultarDni(dni) {
    return api.get(`/reniec/dni/${dni}`)
  }
}
