<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <h2 class="font-semibold text-gray-900">Portal de Padres</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.nombre }} {{ user?.apellido }}</span>
          <button @click="handleLogout" class="btn btn-outline">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Portal de Padres</h1>

      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Mis Hijos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Datos del Estudiante</h3>
            <p class="text-sm text-gray-600">Ver información</p>
          </div>
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Pagos</h3>
            <p class="text-sm text-gray-600">Consultar pagos</p>
          </div>
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

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
