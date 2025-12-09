<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-subtitle">Administra usuarios del sistema</p>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-input"
              placeholder="Buscar por nombre o email..."
              @input="searchUsers"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Rol</label>
            <select v-model="filters.rol" @change="loadUsers" class="form-input">
              <option value="">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="secretaria">Secretaria</option>
              <option value="finanzas">Finanzas</option>
              <option value="docente">Docente</option>
              <option value="padre">Padre</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" @change="loadUsers" class="form-input">
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">&nbsp;</label>
            <button @click="clearFilters" class="btn btn-outline">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Cargando usuarios...</p>
      </div>

      <!-- Users Table -->
      <div v-else class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>DNI</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">{{ getInitials(user) }}</div>
                    <strong>{{ user.nombre }} {{ user.apellido }}</strong>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.dni || '-' }}</td>
                <td>
                  <span
                    class="role-badge"
                    :class="`role-${user.rol}`"
                  >
                    {{ getRolLabel(user.rol) }}
                  </span>
                </td>
                <td>{{ user.telefono || '-' }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="{
                      'badge-success': user.estado === 'activo',
                      'badge-danger': user.estado === 'inactivo'
                    }"
                  >
                    {{ user.estado }}
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button
                      @click="editUser(user)"
                      class="btn-action"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      @click="openPermissionsModal(user)"
                      class="btn-action"
                      title="Permisos"
                    >
                      🔐
                    </button>
                    <button
                      @click="openPasswordModal(user)"
                      class="btn-action"
                      title="Cambiar contraseña"
                    >
                      🔑
                    </button>
                    <button
                      v-if="user.estado === 'activo'"
                      @click="toggleUserEstado(user, 'inactivo')"
                      class="btn-action"
                      title="Desactivar"
                    >
                      🚫
                    </button>
                    <button
                      v-else
                      @click="toggleUserEstado(user, 'activo')"
                      class="btn-action"
                      title="Activar"
                    >
                      ✅
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <p class="empty-icon">👥</p>
          <p class="empty-title">No se encontraron usuarios</p>
          <p class="empty-text">
            {{ filters.search || filters.rol || filters.estado
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Crea el primer usuario para comenzar' }}
          </p>
        </div>
      </div>

      <!-- Modal Create/Edit User -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content modal-medium">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h2>
            <button type="button" @click="closeModal" class="modal-close">×</button>
          </div>

          <div class="modal-body">
            <div v-if="formError" class="alert alert-error">{{ formError }}</div>

            <div class="form-grid">
              <!-- Nombre -->
              <div class="form-group">
                <label class="form-label required">Nombre</label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  class="form-input"
                  placeholder="Juan"
                />
              </div>

              <!-- Apellido -->
              <div class="form-group">
                <label class="form-label required">Apellido</label>
                <input
                  v-model="formData.apellido"
                  type="text"
                  class="form-input"
                  placeholder="Pérez"
                />
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label required">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  :disabled="!!editingUser"
                  placeholder="usuario@colegio.edu.pe"
                />
              </div>

              <!-- DNI -->
              <div class="form-group">
                <label class="form-label">DNI</label>
                <input
                  v-model="formData.dni"
                  type="text"
                  class="form-input"
                  maxlength="8"
                  placeholder="12345678"
                />
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input
                  v-model="formData.telefono"
                  type="text"
                  class="form-input"
                  placeholder="987654321"
                />
              </div>

              <!-- Rol -->
              <div class="form-group">
                <label class="form-label required">Rol</label>
                <select v-model="formData.rol" class="form-input">
                  <option value="">Seleccione un rol</option>
                  <option value="administrador">Administrador</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="docente">Docente</option>
                  <option value="padre">Padre</option>
                </select>
              </div>

              <!-- Contraseña (solo al crear) -->
              <div v-if="!editingUser" class="form-group">
                <label class="form-label required">Contraseña</label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="form-input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <!-- Estado (solo al editar) -->
              <div v-if="editingUser" class="form-group">
                <label class="form-label">Estado</label>
                <select v-model="formData.estado" class="form-input">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-outline">Cancelar</button>
            <button type="button" @click="saveUser" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Change Password -->
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
        <div class="modal-content modal-small">
          <div class="modal-header">
            <h2 class="modal-title">Cambiar Contraseña</h2>
            <button @click="closePasswordModal" class="modal-close">×</button>
          </div>

          <div class="modal-body">
            <div v-if="passwordError" class="alert alert-error">{{ passwordError }}</div>

            <p class="mb-4">
              Cambiar contraseña para: <strong>{{ selectedUser?.nombre }} {{ selectedUser?.apellido }}</strong>
            </p>

            <div class="form-group">
              <label class="form-label required">Nueva Contraseña</label>
              <input
                v-model="newPassword"
                type="password"
                class="form-input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div class="form-group">
              <label class="form-label required">Confirmar Contraseña</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="form-input"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closePasswordModal" class="btn btn-outline">Cancelar</button>
            <button @click="changePassword" :disabled="changingPassword" class="btn btn-primary">
              {{ changingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Permissions -->
      <div v-if="showPermissionsModal" class="modal-overlay" @click.self="closePermissionsModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2 class="modal-title">Gestionar Permisos</h2>
            <button @click="closePermissionsModal" class="modal-close">×</button>
          </div>

          <div class="modal-body">
            <div v-if="permissionsError" class="alert alert-error">{{ permissionsError }}</div>

            <p class="mb-4">
              Configurar permisos para: <strong>{{ selectedUser?.nombre }} {{ selectedUser?.apellido }}</strong>
              <span class="role-badge ml-2" :class="`role-${selectedUser?.rol}`">
                {{ getRolLabel(selectedUser?.rol) }}
              </span>
            </p>

            <div v-if="loadingPermissions" class="text-center py-4">
              <p class="text-gray-600">Cargando permisos...</p>
            </div>

            <div v-else class="permissions-grid">
              <!-- Estudiantes -->
              <div class="permission-module">
                <h4 class="module-title">👥 Estudiantes</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.estudiantes.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.estudiantes.crear" />
                    <span>Crear</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.estudiantes.editar" />
                    <span>Editar</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.estudiantes.eliminar" />
                    <span>Eliminar</span>
                  </label>
                </div>
              </div>

              <!-- Matrículas -->
              <div class="permission-module">
                <h4 class="module-title">📝 Matrículas</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.matriculas.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.matriculas.crear" />
                    <span>Crear</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.matriculas.editar" />
                    <span>Editar</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.matriculas.eliminar" />
                    <span>Eliminar</span>
                  </label>
                </div>
              </div>

              <!-- Pagos -->
              <div class="permission-module">
                <h4 class="module-title">💰 Pagos</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.pagos.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.pagos.crear" />
                    <span>Crear</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.pagos.editar" />
                    <span>Editar</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.pagos.eliminar" />
                    <span>Eliminar</span>
                  </label>
                </div>
              </div>

              <!-- Documentos -->
              <div class="permission-module">
                <h4 class="module-title">📄 Documentos</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.documentos.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.documentos.aprobar" />
                    <span>Aprobar</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.documentos.rechazar" />
                    <span>Rechazar</span>
                  </label>
                </div>
              </div>

              <!-- Reportes -->
              <div class="permission-module">
                <h4 class="module-title">📊 Reportes</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.reportes.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.reportes.exportar" />
                    <span>Exportar</span>
                  </label>
                </div>
              </div>

              <!-- Usuarios -->
              <div class="permission-module">
                <h4 class="module-title">👤 Usuarios</h4>
                <div class="permission-checks">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.usuarios.ver" />
                    <span>Ver</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.usuarios.crear" />
                    <span>Crear</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.usuarios.editar" />
                    <span>Editar</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="userPermisos.usuarios.eliminar" />
                    <span>Eliminar</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closePermissionsModal" class="btn btn-outline">Cancelar</button>
            <button @click="savePermissions" :disabled="savingPermissions" class="btn btn-primary">
              {{ savingPermissions ? 'Guardando...' : 'Guardar Permisos' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import userService from '@/services/user.service'
import AppLayout from '@/components/AppLayout.vue'

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const showPasswordModal = ref(false)
const editingUser = ref(null)
const selectedUser = ref(null)
const saving = ref(false)
const changingPassword = ref(false)
const formError = ref(null)
const passwordError = ref(null)

const filters = ref({
  search: '',
  rol: '',
  estado: ''
})

const formData = ref({
  nombre: '',
  apellido: '',
  email: '',
  dni: '',
  telefono: '',
  rol: '',
  password: '',
  estado: 'activo'
})

const newPassword = ref('')
const confirmPassword = ref('')

// Permissions modal
const showPermissionsModal = ref(false)
const loadingPermissions = ref(false)
const savingPermissions = ref(false)
const permissionsError = ref(null)
const userPermisos = ref({
  estudiantes: { ver: false, crear: false, editar: false, eliminar: false },
  matriculas: { ver: false, crear: false, editar: false, eliminar: false },
  pagos: { ver: false, crear: false, editar: false, eliminar: false },
  documentos: { ver: false, aprobar: false, rechazar: false },
  reportes: { ver: false, exportar: false },
  usuarios: { ver: false, crear: false, editar: false, eliminar: false }
})

const filteredUsers = computed(() => {
  let result = [...users.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(user =>
      user.nombre.toLowerCase().includes(search) ||
      user.apellido.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  return result
})

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.rol) params.rol = filters.value.rol
    if (filters.value.estado) params.estado = filters.value.estado

    const response = await userService.getAll(params)
    users.value = response.data.data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  // La búsqueda se hace en el computed filteredUsers
}

const clearFilters = () => {
  filters.value = {
    search: '',
    rol: '',
    estado: ''
  }
  loadUsers()
}

const openCreateModal = () => {
  editingUser.value = null
  formData.value = {
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    rol: '',
    password: '',
    estado: 'activo'
  }
  showModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  formData.value = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    dni: user.dni || '',
    telefono: user.telefono || '',
    rol: user.rol,
    password: '',
    estado: user.estado
  }
  showModal.value = true
}

const saveUser = async () => {
  formError.value = null

  // Validaciones
  if (!formData.value.nombre || !formData.value.apellido || !formData.value.email || !formData.value.rol) {
    formError.value = 'Por favor complete todos los campos obligatorios'
    return
  }

  if (!editingUser.value && (!formData.value.password || formData.value.password.length < 6)) {
    formError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  saving.value = true
  try {
    if (editingUser.value) {
      await userService.update(editingUser.value.id, formData.value)
    } else {
      await userService.create(formData.value)
    }
    closeModal()
    await loadUsers()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Error al guardar usuario'
    console.error('Error:', error)
  } finally {
    saving.value = false
  }
}

const openPasswordModal = (user) => {
  selectedUser.value = user
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordModal.value = true
}

const changePassword = async () => {
  passwordError.value = null

  if (!newPassword.value || newPassword.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas no coinciden'
    return
  }

  changingPassword.value = true
  try {
    await userService.changePassword(selectedUser.value.id, newPassword.value)
    closePasswordModal()
    alert('Contraseña cambiada exitosamente')
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'Error al cambiar contraseña'
    console.error('Error:', error)
  } finally {
    changingPassword.value = false
  }
}

const toggleUserEstado = async (user, nuevoEstado) => {
  const mensaje = nuevoEstado === 'activo'
    ? '¿Desea activar este usuario?'
    : '¿Desea desactivar este usuario?'

  if (!confirm(mensaje)) return

  try {
    await userService.toggleEstado(user.id, nuevoEstado)
    await loadUsers()
  } catch (error) {
    console.error('Error:', error)
    alert(error.response?.data?.message || 'Error al cambiar estado del usuario')
  }
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
  formError.value = null
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUser.value = null
  passwordError.value = null
}

const openPermissionsModal = async (user) => {
  selectedUser.value = user
  showPermissionsModal.value = true
  loadingPermissions.value = true
  permissionsError.value = null

  try {
    const response = await userService.getPermisos(user.id)
    userPermisos.value = response.data.data.permisos
  } catch (error) {
    permissionsError.value = error.response?.data?.message || 'Error al cargar permisos'
    console.error('Error:', error)
  } finally {
    loadingPermissions.value = false
  }
}

const closePermissionsModal = () => {
  showPermissionsModal.value = false
  selectedUser.value = null
  permissionsError.value = null
  userPermisos.value = {
    estudiantes: { ver: false, crear: false, editar: false, eliminar: false },
    matriculas: { ver: false, crear: false, editar: false, eliminar: false },
    pagos: { ver: false, crear: false, editar: false, eliminar: false },
    documentos: { ver: false, aprobar: false, rechazar: false },
    reportes: { ver: false, exportar: false },
    usuarios: { ver: false, crear: false, editar: false, eliminar: false }
  }
}

const savePermissions = async () => {
  permissionsError.value = null
  savingPermissions.value = true

  try {
    await userService.updatePermisos(selectedUser.value.id, userPermisos.value)
    closePermissionsModal()
    alert('Permisos actualizados exitosamente')
  } catch (error) {
    permissionsError.value = error.response?.data?.message || 'Error al actualizar permisos'
    console.error('Error:', error)
  } finally {
    savingPermissions.value = false
  }
}

const getInitials = (user) => {
  return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
}

const getRolLabel = (rol) => {
  const labels = {
    administrador: 'Administrador',
    secretaria: 'Secretaria',
    finanzas: 'Finanzas',
    docente: 'Docente',
    padre: 'Padre'
  }
  return labels[rol] || rol
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.page-subtitle {
  color: #718096;
  margin-top: 0.5rem;
}

.filters-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #718096;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tbody tr:hover {
  background: #f7fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-administrador {
  background: #fed7d7;
  color: #742a2a;
}

.role-secretaria {
  background: #c6f6d5;
  color: #22543d;
}

.role-finanzas {
  background: #fefcbf;
  color: #744210;
}

.role-docente {
  background: #bee3f8;
  color: #2c5282;
}

.role-padre {
  background: #e9d8fd;
  color: #44337a;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.badge-danger {
  background: #fed7d7;
  color: #742a2a;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-action:hover {
  background: #edf2f7;
}

.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #718096;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  background: #f7fafc;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.modal-small {
  max-width: 450px;
}

.modal-medium {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #a0aec0;
  line-height: 1;
}

.modal-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

/* Permissions Modal */
.modal-large {
  max-width: 800px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.permission-module {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.permission-module:hover {
  border-color: #667eea;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.module-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permission-checks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #edf2f7;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-label span {
  font-size: 0.9375rem;
  color: #4a5568;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.text-gray-600 {
  color: #718096;
}
</style>
