const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { secretariaOrAdmin } = require('../middlewares/role.middleware');

// Placeholder controller
const studentController = {
  list: (req, res) => res.json({ message: 'Listar estudiantes' }),
  getById: (req, res) => res.json({ message: `Estudiante ${req.params.id}` }),
  create: (req, res) => res.json({ message: 'Crear estudiante' }),
  update: (req, res) => res.json({ message: `Actualizar estudiante ${req.params.id}` }),
  delete: (req, res) => res.json({ message: `Eliminar estudiante ${req.params.id}` })
};

router.use(verifyToken);

router.get('/', studentController.list);
router.get('/:id', studentController.getById);
router.post('/', secretariaOrAdmin, studentController.create);
router.put('/:id', secretariaOrAdmin, studentController.update);
router.delete('/:id', secretariaOrAdmin, studentController.delete);

module.exports = router;
