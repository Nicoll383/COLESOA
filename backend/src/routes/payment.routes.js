const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { finanzasOrAdmin } = require('../middlewares/role.middleware');

// Placeholder controller
const paymentController = {
  list: (req, res) => res.json({ message: 'Listar pagos' }),
  getById: (req, res) => res.json({ message: `Pago ${req.params.id}` }),
  create: (req, res) => res.json({ message: 'Registrar pago' }),
  update: (req, res) => res.json({ message: `Actualizar pago ${req.params.id}` }),
  delete: (req, res) => res.json({ message: `Eliminar pago ${req.params.id}` })
};

router.use(verifyToken);

router.get('/', paymentController.list);
router.get('/:id', paymentController.getById);
router.post('/', finanzasOrAdmin, paymentController.create);
router.put('/:id', finanzasOrAdmin, paymentController.update);
router.delete('/:id', finanzasOrAdmin, paymentController.delete);

module.exports = router;
