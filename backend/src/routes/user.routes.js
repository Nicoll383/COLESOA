const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

// Placeholder controller
const userController = {
  list: (req, res) => res.json({ message: 'Listar usuarios' }),
  getById: (req, res) => res.json({ message: `Usuario ${req.params.id}` }),
  create: (req, res) => res.json({ message: 'Crear usuario' }),
  update: (req, res) => res.json({ message: `Actualizar usuario ${req.params.id}` }),
  delete: (req, res) => res.json({ message: `Eliminar usuario ${req.params.id}` })
};

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo administradores pueden gestionar usuarios
router.get('/', adminOnly, userController.list);
router.get('/:id', adminOnly, userController.getById);
router.post('/', adminOnly, userController.create);
router.put('/:id', adminOnly, userController.update);
router.delete('/:id', adminOnly, userController.delete);

module.exports = router;
