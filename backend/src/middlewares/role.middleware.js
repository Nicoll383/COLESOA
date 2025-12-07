const { ROLES, canAccess } = require('../config/roles');

/**
 * Middleware para verificar roles
 * @param {Array} allowedRoles - Array de roles permitidos
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * @param {String} resource - Recurso (ej: 'students', 'payments')
 * @param {String} action - Acción (ej: 'create', 'read', 'update', 'delete')
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no autenticado'
      });
    }

    const userRole = req.user.rol;
    const isOwn = req.params.id && req.user.id === parseInt(req.params.id);

    if (!canAccess(userRole, resource, action, isOwn)) {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware solo para administradores
 */
const adminOnly = checkRole([ROLES.ADMINISTRADOR]);

/**
 * Middleware para secretaría y administradores
 */
const secretariaOrAdmin = checkRole([ROLES.ADMINISTRADOR, ROLES.SECRETARIA]);

/**
 * Middleware para finanzas y administradores
 */
const finanzasOrAdmin = checkRole([ROLES.ADMINISTRADOR, ROLES.FINANZAS]);

module.exports = {
  checkRole,
  checkPermission,
  adminOnly,
  secretariaOrAdmin,
  finanzasOrAdmin
};
