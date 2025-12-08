<template>
  <AppLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Panel de Finanzas</h1>
          <p class="page-subtitle">Gestión de pagos y control financiero</p>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Ingresos del Mes</p>
            <p class="stat-value">S/. {{ stats.ingresosMes.toFixed(2) }}</p>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <p class="stat-label">Cuotas Pendientes</p>
            <p class="stat-value">{{ stats.cuotasPendientes }}</p>
            <p class="stat-subtext">S/. {{ stats.montoPendiente.toFixed(2) }}</p>
          </div>
        </div>

        <div class="stat-card stat-danger">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <p class="stat-label">Cuotas Vencidas</p>
            <p class="stat-value">{{ stats.cuotasVencidas }}</p>
            <p class="stat-subtext">S/. {{ stats.montoVencido.toFixed(2) }}</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-label">Pagos Completados</p>
            <p class="stat-value">{{ stats.pagosCompletados }}</p>
            <p class="stat-subtext">Este mes</p>
          </div>
        </div>
      </div>

      <!-- Módulos Principales -->
      <div class="modules-grid">
        <div @click="router.push('/payments')" class="module-card module-primary">
          <div class="module-icon">💳</div>
          <h3 class="module-title">Registrar Pago</h3>
          <p class="module-description">Nuevo registro de pago de matrícula o cuotas</p>
        </div>

        <div @click="router.push('/payments?estado=pendiente')" class="module-card module-warning">
          <div class="module-icon">📊</div>
          <h3 class="module-title">Deudas Pendientes</h3>
          <p class="module-description">Control de morosidad y cuotas por cobrar</p>
        </div>

        <div @click="router.push('/payments')" class="module-card module-info">
          <div class="module-icon">📜</div>
          <h3 class="module-title">Historial de Pagos</h3>
          <p class="module-description">Ver todos los pagos registrados</p>
        </div>

        <div @click="router.push('/reports')" class="module-card module-success">
          <div class="module-icon">📈</div>
          <h3 class="module-title">Reportes Financieros</h3>
          <p class="module-description">Informes e indicadores financieros</p>
        </div>
      </div>

      <!-- Pagos Recientes -->
      <div class="card">
        <h2 class="section-title">💵 Pagos Recientes</h2>

        <div v-if="loadingPayments" class="text-center py-8">
          <p class="text-gray-600">Cargando pagos...</p>
        </div>

        <div v-else-if="recentPayments.length > 0" class="payments-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Estudiante</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in recentPayments" :key="payment.id">
                <td>{{ formatDate(payment.fecha_pago || payment.created_at) }}</td>
                <td><code>{{ payment.codigo_pago }}</code></td>
                <td>{{ payment.estudiante_nombre }}</td>
                <td>{{ payment.concepto }}</td>
                <td class="amount">S/. {{ parseFloat(payment.monto).toFixed(2) }}</td>
                <td>
                  <span class="method-badge">{{ getMetodoLabel(payment.metodo_pago) }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="`status-${payment.estado}`">
                    {{ getEstadoLabel(payment.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">No hay pagos recientes</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/services/api'

const router = useRouter()

const loadingPayments = ref(false)
const recentPayments = ref([])
const stats = ref({
  ingresosMes: 0,
  cuotasPendientes: 0,
  montoPendiente: 0,
  cuotasVencidas: 0,
  montoVencido: 0,
  pagosCompletados: 0
})

const loadStats = async () => {
  try {
    const response = await api.get('/payments/estadisticas')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    // Usar datos de ejemplo en caso de error
  }
}

const loadRecentPayments = async () => {
  loadingPayments.value = true
  try {
    const response = await api.get('/payments', {
      params: {
        limit: 10,
        sort: '-created_at'
      }
    })
    if (response.data.success) {
      recentPayments.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
  } finally {
    loadingPayments.value = false
  }
}

const getMetodoLabel = (metodo) => {
  const labels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    deposito: 'Depósito',
    yape: 'Yape',
    plin: 'Plin'
  }
  return labels[metodo] || metodo
}

const getEstadoLabel = (estado) => {
  const labels = {
    completado: 'Completado',
    pendiente: 'Pendiente',
    vencido: 'Vencido',
    anulado: 'Anulado'
  }
  return labels[estado] || estado
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadStats()
  loadRecentPayments()
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid;
}

.stat-primary {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-color: #6366f1;
}

.stat-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.stat-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.stat-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-subtext {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Modules Grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.module-card {
  padding: 2rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border: 2px solid;
}

.module-primary {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-color: #667eea;
}

.module-warning {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-color: #f59e0b;
}

.module-info {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-color: #3b82f6;
}

.module-success {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-color: #10b981;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.2);
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.module-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.module-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Card */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

/* Payments Table */
.payments-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #e5e7eb;
}

tbody td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #111827;
}

tbody tr:hover {
  background: #f9fafb;
}

code {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.method-badge {
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-completado {
  background: #d1fae5;
  color: #065f46;
}

.status-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-vencido {
  background: #fee2e2;
  color: #991b1b;
}

.status-anulado {
  background: #f3f4f6;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  margin: 0;
}

.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-gray-600 {
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .payments-table {
    font-size: 0.75rem;
  }

  thead th,
  tbody td {
    padding: 0.5rem;
  }
}
</style>
