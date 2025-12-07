/**
 * Definición de roles del sistema
 * Colegio SOA - Sistema de Matrículas
 */

const ROLES = {
  ADMINISTRADOR: 'administrador',
  SECRETARIA: 'secretaria',
  FINANZAS: 'finanzas',
  DOCENTE: 'docente',
  PADRE: 'padre'
};

const PERMISSIONS = {
  // Administrador - Control total
  [ROLES.ADMINISTRADOR]: [
    'users:*',
    'students:*',
    'enrollments:*',
    'payments:*',
    'reports:*',
    'settings:*',
    'teachers:*',
    'courses:*',
    'grades:*'
  ],

  // Secretaría - Gestión de matrículas y estudiantes
  [ROLES.SECRETARIA]: [
    'students:create',
    'students:read',
    'students:update',
    'enrollments:create',
    'enrollments:read',
    'enrollments:update',
    'documents:upload',
    'documents:read',
    'grades:read',
    'reports:enrollment'
  ],

  // Finanzas - Control de pagos
  [ROLES.FINANZAS]: [
    'payments:create',
    'payments:read',
    'payments:update',
    'payments:delete',
    'invoices:create',
    'invoices:read',
    'students:read',
    'enrollments:read',
    'reports:financial'
  ],

  // Docente - Consulta de estudiantes y horarios
  [ROLES.DOCENTE]: [
    'students:read',
    'courses:read',
    'grades:read',
    'schedules:read',
    'attendance:create',
    'attendance:read'
  ],

  // Padre - Gestión de sus hijos
  [ROLES.PADRE]: [
    'students:read:own',
    'enrollments:create:own',
    'enrollments:read:own',
    'payments:read:own',
    'documents:read:own',
    'documents:upload:own',
    'grades:read:own'
  ]
};

// Descripciones de roles
const ROLE_DESCRIPTIONS = {
  [ROLES.ADMINISTRADOR]: 'Administrador del sistema con acceso completo',
  [ROLES.SECRETARIA]: 'Personal de secretaría y gestión escolar',
  [ROLES.FINANZAS]: 'Departamento de finanzas y tesorería',
  [ROLES.DOCENTE]: 'Docente del colegio',
  [ROLES.PADRE]: 'Padre de familia o apoderado'
};

// Helper function para verificar permisos
const hasPermission = (userRole, permission) => {
  if (!PERMISSIONS[userRole]) {
    return false;
  }

  // Check wildcard permission
  if (PERMISSIONS[userRole].includes(`${permission.split(':')[0]}:*`)) {
    return true;
  }

  // Check specific permission
  return PERMISSIONS[userRole].includes(permission);
};

// Verificar si un rol puede acceder a un recurso
const canAccess = (userRole, resource, action, isOwn = false) => {
  const permission = isOwn ? `${resource}:${action}:own` : `${resource}:${action}`;
  return hasPermission(userRole, permission);
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  hasPermission,
  canAccess
};
