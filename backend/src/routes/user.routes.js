const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Solo administradores y secretaria pueden ver usuarios
router.get('/', authorize(['administrador', 'secretaria']), UserController.list);
router.get('/:id', authorize(['administrador', 'secretaria']), UserController.getById);

// Solo administradores pueden crear y modificar usuarios
router.post('/', authorize(['administrador']), UserController.create);
router.put('/:id', authorize(['administrador']), UserController.update);
router.patch('/:id/estado', authorize(['administrador']), UserController.toggleEstado);
router.patch('/:id/password', authorize(['administrador']), UserController.changePassword);

// Gestión de permisos (solo administrador)
router.get('/:id/permisos', authorize(['administrador']), UserController.getPermisos);
router.put('/:id/permisos', authorize(['administrador']), UserController.updatePermisos);

module.exports = router;
