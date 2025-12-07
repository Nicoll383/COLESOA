const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { secretariaOrAdmin } = require('../middlewares/role.middleware');

// Placeholder controller
const enrollmentController = {
  list: (req, res) => res.json({ message: 'Listar matrículas' }),
  getById: (req, res) => res.json({ message: `Matrícula ${req.params.id}` }),
  create: (req, res) => res.json({ message: 'Crear matrícula' }),
  update: (req, res) => res.json({ message: `Actualizar matrícula ${req.params.id}` }),
  delete: (req, res) => res.json({ message: `Eliminar matrícula ${req.params.id}` })
};

router.use(verifyToken);

router.get('/', enrollmentController.list);
router.get('/:id', enrollmentController.getById);
router.post('/', secretariaOrAdmin, enrollmentController.create);
router.put('/:id', secretariaOrAdmin, enrollmentController.update);
router.delete('/:id', secretariaOrAdmin, enrollmentController.delete);

module.exports = router;
