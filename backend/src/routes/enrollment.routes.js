const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/enrollment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { secretariaOrAdmin, adminOnly } = require('../middlewares/role.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Validar si estudiante puede matricularse en un grado
router.get('/validar-grado/:estudianteId/:gradoId', EnrollmentController.validarGrado);

// Consultar secciones con vacantes
router.get('/secciones-vacantes', EnrollmentController.getSeccionesConVacantes);

// Consultar vacantes de una sección específica
router.get('/vacantes', EnrollmentController.getVacantes);

// Obtener todas las matrículas
router.get('/', EnrollmentController.getAll);

// Obtener matrícula por ID
router.get('/:id', EnrollmentController.getById);

// Crear nueva matrícula (preinscripción)
router.post('/', secretariaOrAdmin, EnrollmentController.create);

// Actualizar estado de matrícula
router.patch('/:id/estado', secretariaOrAdmin, EnrollmentController.updateEstado);

// Confirmar matrícula (inicializa documentos y envía credenciales)
router.post('/:id/confirmar', secretariaOrAdmin, EnrollmentController.confirmarMatricula);

// Anular matrícula
router.post('/:id/anular', adminOnly, EnrollmentController.anular);

// Generar contrato en PDF
router.get('/:id/contrato', EnrollmentController.generarContrato);

// Generar comprobante en PDF
router.get('/:id/comprobante', EnrollmentController.generarComprobante);

// Obtener credenciales de acceso
router.get('/:id/credenciales', secretariaOrAdmin, EnrollmentController.getCredenciales);

module.exports = router;
