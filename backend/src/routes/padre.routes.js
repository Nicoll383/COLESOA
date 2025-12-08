const express = require('express');
const router = express.Router();
const PadreController = require('../controllers/padre.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de padre
router.use(authenticateToken);
router.use(authorize(['padre']));

// Obtener todos los hijos del padre autenticado
router.get('/hijos', PadreController.getHijos);

// Obtener cuotas de un hijo específico
router.get('/hijos/:estudianteId/cuotas', PadreController.getCuotasHijo);

// Registrar pago de una cuota
router.post('/cuotas/:cuotaId/pagar', PadreController.registrarPagoCuota);

module.exports = router;
