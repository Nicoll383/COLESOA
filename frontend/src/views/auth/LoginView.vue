<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="card max-w-md w-full p-8">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <div class="w-20 h-20 bg-primary rounded-xl mx-auto flex items-center justify-center">
            <span class="text-3xl font-bold text-white">SOA</span>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Colegio SOA</h1>
        <p class="text-gray-600">Sistema de Matrículas</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="usuario@colegiosoa.edu.pe"
            required
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label" for="password">Contraseña</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="••••••••"
            required
          />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <!-- Error general -->
        <div v-if="loginError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-error">
          {{ loginError }}
        </div>

        <!-- Botón de login -->
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Iniciar Sesión</span>
          <span v-else>Iniciando sesión...</span>
        </button>
      </form>

      <!-- Información adicional -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>¿Olvidaste tu contraseña? <a href="#" class="text-primary font-medium">Recuperar</a></p>
      </div>

      <!-- Usuarios de prueba (solo en desarrollo) -->
      <div v-if="isDevelopment" class="mt-8 p-4 bg-gray-50 rounded-lg">
        <p class="text-xs font-semibold text-gray-700 mb-2">Usuarios de prueba:</p>
        <div class="text-xs text-gray-600 space-y-1">
          <p><strong>Admin:</strong> admin@colegiosoa.edu.pe / Password123!</p>
          <p><strong>Secretaría:</strong> secretaria@colegiosoa.edu.pe / Password123!</p>
          <p><strong>Finanzas:</strong> finanzas@colegiosoa.edu.pe / Password123!</p>
          <p><strong>Docente:</strong> docente1@colegiosoa.edu.pe / Password123!</p>
          <p><strong>Padre:</strong> padre1@example.com / Password123!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: ''
})

const errors = ref({})
const loginError = ref(null)
const isLoading = ref(false)

const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development'
})

const validateForm = () => {
  errors.value = {}

  if (!formData.value.email) {
    errors.value.email = 'El correo es requerido'
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.value.email = 'El correo no es válido'
  }

  if (!formData.value.password) {
    errors.value.password = 'La contraseña es requerida'
  }

  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  loginError.value = null

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.login(formData.value.email, formData.value.password)

    // Redirigir según el rol
    const role = authStore.user.rol
    const dashboardRoutes = {
      'administrador': '/admin',
      'secretaria': '/secretaria',
      'finanzas': '/finanzas',
      'docente': '/docente',
      'padre': '/padre'
    }

    router.push(dashboardRoutes[role] || '/dashboard')
  } catch (error) {
    loginError.value = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
  } finally {
    isLoading.value = false
  }
}
</script>
