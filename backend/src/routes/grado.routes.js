const express = require('express');
const router = express.Router();
const GradoController = require('../controllers/grado.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de grados
router.get('/', GradoController.getAll);
router.get('/:id', GradoController.getById);
router.post('/', authorize(['administrador']), GradoController.create);
router.put('/:id', authorize(['administrador']), GradoController.update);

// Secciones de un grado
router.get('/:id/secciones', GradoController.getSecciones);

module.exports = router;
