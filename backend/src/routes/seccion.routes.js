const express = require('express');
const router = express.Router();
const SeccionController = require('../controllers/seccion.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de secciones
router.get('/', SeccionController.getAll);
router.get('/:id', SeccionController.getById);
router.post('/', authorize(['administrador', 'secretaria']), SeccionController.create);
router.put('/:id', authorize(['administrador', 'secretaria']), SeccionController.update);
router.delete('/:id', authorize(['administrador']), SeccionController.delete);

// Estudiantes y horarios de una sección
router.get('/:id/estudiantes', SeccionController.getEstudiantes);
router.get('/:id/horario', SeccionController.getHorario);

// Gestión de horarios
router.post('/horarios', authorize(['administrador', 'secretaria']), SeccionController.agregarHorario);
router.delete('/horarios/:horario_id', authorize(['administrador', 'secretaria']), SeccionController.eliminarHorario);

module.exports = router;
