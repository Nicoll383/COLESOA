import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000
  // NO configurar Content-Type aquí, se configura en el interceptor
})

// Request interceptor - agregar token y configurar headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('=== AXIOS INTERCEPTOR DEBUG ===')
    console.log('URL:', config.url)
    console.log('Method:', config.method)
    console.log('config.data:', config.data)
    console.log('config.data instanceof FormData:', config.data instanceof FormData)

    // Si es FormData, eliminar cualquier Content-Type para que axios lo configure automáticamente
    if (config.data instanceof FormData) {
      console.log('✓ Detectado FormData - eliminando Content-Type header')
      delete config.headers['Content-Type']
    } else {
      // Solo configurar Content-Type como JSON si NO es FormData
      console.log('✗ NO es FormData - configurando Content-Type como JSON')
      config.headers['Content-Type'] = 'application/json'
    }

    console.log('Headers finales:', config.headers)
    console.log('==============================')

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
