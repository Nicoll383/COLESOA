const express = require('express');
const router = express.Router();
const ReniecController = require('../controllers/reniec.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Consultar DNI
router.get('/dni/:dni', ReniecController.consultarDni);

module.exports = router;
