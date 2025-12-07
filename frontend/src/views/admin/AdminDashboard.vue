<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-lg font-bold text-white">SOA</span>
          </div>
          <h2 class="font-semibold text-gray-900">Panel de Administrador</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.nombre }} {{ user?.apellido }}</span>
          <button @click="handleLogout" class="btn btn-outline">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Dashboard - Administrador</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-blue-500 text-white">
          <h3 class="text-sm font-medium mb-2">Total Usuarios</h3>
          <p class="text-3xl font-bold">--</p>
        </div>
        <div class="card bg-green-500 text-white">
          <h3 class="text-sm font-medium mb-2">Estudiantes Activos</h3>
          <p class="text-3xl font-bold">--</p>
        </div>
        <div class="card bg-yellow-500 text-white">
          <h3 class="text-sm font-medium mb-2">Matrículas 2025</h3>
          <p class="text-3xl font-bold">--</p>
        </div>
        <div class="card bg-purple-500 text-white">
          <h3 class="text-sm font-medium mb-2">Docentes</h3>
          <p class="text-3xl font-bold">--</p>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Módulos Disponibles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Gestión de Usuarios</h3>
            <p class="text-sm text-gray-600">Administrar usuarios del sistema</p>
          </div>
          <div @click="goToStudents" class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Estudiantes</h3>
            <p class="text-sm text-gray-600">Ver y gestionar estudiantes</p>
          </div>
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Matrículas</h3>
            <p class="text-sm text-gray-600">Procesos de matrícula</p>
          </div>
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Pagos</h3>
            <p class="text-sm text-gray-600">Control financiero</p>
          </div>
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Reportes</h3>
            <p class="text-sm text-gray-600">Estadísticas e informes</p>
          </div>
          <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 class="font-medium mb-1">Configuración</h3>
            <p class="text-sm text-gray-600">Ajustes del sistema</p>
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

const goToStudents = () => {
  router.push('/students')
}
</script>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.border {
  border: 1px solid #e5e7eb;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
