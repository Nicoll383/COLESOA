const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar pagos (admin, secretaria, finanzas pueden ver todos; padre solo los suyos)
router.get(
  '/',
  authorize(['administrador', 'secretaria', 'finanzas', 'padre']),
  PaymentController.list
);

// Obtener pago por ID
router.get(
  '/:id',
  authorize(['administrador', 'secretaria', 'finanzas', 'padre']),
  PaymentController.getById
);

// Crear nuevo pago (admin, secretaria, finanzas)
router.post(
  '/',
  authorize(['administrador', 'secretaria', 'finanzas']),
  PaymentController.create
);

// Actualizar estado del pago (admin, finanzas)
router.patch(
  '/:id/estado',
  authorize(['administrador', 'finanzas']),
  PaymentController.updateEstado
);

// Obtener pagos pendientes de una matrícula
router.get(
  '/matricula/:matriculaId/pendientes',
  authorize(['administrador', 'secretaria', 'finanzas', 'padre']),
  PaymentController.getPagosPendientes
);

// Obtener total pagado de una matrícula
router.get(
  '/matricula/:matriculaId/total',
  authorize(['administrador', 'secretaria', 'finanzas', 'padre']),
  PaymentController.getTotalPagado
);

module.exports = router;
