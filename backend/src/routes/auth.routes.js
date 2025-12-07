const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  authController.login
);

// Register (solo para desarrollo o admin)
router.post('/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('rol').isIn(['administrador', 'secretaria', 'finanzas', 'docente', 'padre']).withMessage('Rol inválido')
  ],
  authController.register
);

// Get current user info
router.get('/me', verifyToken, authController.getCurrentUser);

// Refresh token
router.post('/refresh', verifyToken, authController.refreshToken);

// Logout (opcional - para invalidar token en MongoDB)
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
