<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">Colegio SOA</h2>
            <p class="text-sm text-gray-600">Sistema de Matrículas</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="font-medium text-gray-900">{{ user?.nombre }} {{ user?.apellido }}</p>
            <p class="text-sm text-gray-600">{{ roleLabel }}</p>
          </div>
          <button @click="handleLogout" class="btn btn-outline">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <div class="card">
        <h1 class="text-2xl font-bold mb-4">Bienvenido, {{ user?.nombre }}</h1>
        <p class="text-gray-600 mb-6">Este es tu panel principal.</p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            Accede a tu panel específico desde el menú de navegación.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const roleLabel = computed(() => {
  const labels = {
    'administrador': 'Administrador',
    'secretaria': 'Secretaría',
    'finanzas': 'Finanzas',
    'docente': 'Docente',
    'padre': 'Padre/Apoderado'
  }
  return labels[user.value?.rol] || ''
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
