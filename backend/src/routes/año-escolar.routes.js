const express = require('express');
const router = express.Router();
const AñoEscolarController = require('../controllers/año-escolar.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas públicas (cualquier usuario autenticado)
router.get('/active', AñoEscolarController.getActive);
router.get('/year/:year', AñoEscolarController.getByYear);

// Rutas administrativas
router.get('/', authorize(['administrador', 'secretaria']), AñoEscolarController.getAll);
router.get('/:id', authorize(['administrador', 'secretaria']), AñoEscolarController.getById);
router.post('/', authorize(['administrador']), AñoEscolarController.create);
router.put('/:id', authorize(['administrador']), AñoEscolarController.update);
router.patch('/:id/estado', authorize(['administrador']), AñoEscolarController.toggleEstado);
router.delete('/:id', authorize(['administrador']), AñoEscolarController.delete);

module.exports = router;
