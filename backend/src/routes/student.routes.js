const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/student.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { secretariaOrAdmin, adminOnly } = require('../middlewares/role.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los estudiantes (con filtros opcionales)
router.get('/', StudentController.getAll);

// Obtener estudiante por ID
router.get('/:id', StudentController.getById);

// Crear nuevo estudiante
router.post('/', secretariaOrAdmin, StudentController.create);

// Actualizar estudiante
router.put('/:id', secretariaOrAdmin, StudentController.update);

// Eliminar estudiante (solo admin)
router.delete('/:id', adminOnly, StudentController.delete);

// Validar si puede matricularse en un grado
router.post('/validar-matricula', secretariaOrAdmin, StudentController.validarMatricula);

// Verificar documentos obligatorios completos
router.get('/:id/verificar-documentos', secretariaOrAdmin, StudentController.verificarDocumentos);

// Subir documento
router.post('/documentos', StudentController.uploadMiddleware(), StudentController.subirDocumento);

// Agregar historial académico
router.post('/historial', secretariaOrAdmin, StudentController.agregarHistorial);

// Generar carnet de estudiante
router.get('/:id/carnet', StudentController.generateCarnet);

module.exports = router;
