import api from './api'

const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  register(userData) {
    return api.post('/auth/register', userData)
  },

  getCurrentUser() {
    return api.get('/auth/me')
  },

  refreshToken() {
    return api.post('/auth/refresh')
  },

  logout() {
    return api.post('/auth/logout')
  }
}

export default authService
