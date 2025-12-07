const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Dashboard general
router.get('/dashboard', ReportController.dashboard);

// Reportes específicos
router.get('/estudiantes-matriculados', ReportController.estudiantesMatriculados);
router.get('/estudiantes-por-curso', ReportController.estudiantesPorCurso);
router.get('/vacantes-disponibles', ReportController.vacantesDisponibles);
router.get('/pagos', ReportController.pagos);
router.get('/pagos-pendientes', ReportController.pagosPendientes);
router.get('/estadisticas-comparativas', ReportController.estadisticasComparativas);

module.exports = router;
