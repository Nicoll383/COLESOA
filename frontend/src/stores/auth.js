import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(email, password)

      user.value = response.data.user
      token.value = response.data.token

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)

      // Opcionalmente, verificar el token con el backend
      try {
        const response = await authService.getCurrentUser()
        user.value = response.data.user
      } catch (err) {
        // Si el token es inválido, hacer logout
        logout()
      }
    }
  }

  const hasRole = (role) => {
    return user.value?.rol === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user.value?.rol)
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole
  }
})
