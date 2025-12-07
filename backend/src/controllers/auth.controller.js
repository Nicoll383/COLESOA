const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generar JWT token
 */
const generateToken = (userId, userRole) => {
  return jwt.sign(
    { userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Login
 */
const login = async (req, res) => {
  try {
    // Validar request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id, user.rol);

    // Responder
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: true,
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * Register (solo para desarrollo o creación por admin)
 */
const register = async (req, res) => {
  try {
    // Validar request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { email, password, nombre, apellido, rol, telefono, dni } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const userId = await User.create({
      email,
      password,
      nombre,
      apellido,
      rol,
      telefono,
      dni
    });

    // Generar token
    const token = generateToken(userId, rol);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: userId,
          email,
          nombre,
          apellido,
          rol
        }
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      error: true,
      message: 'Error al registrar usuario'
    });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({
      error: true,
      message: 'Error al obtener información del usuario'
    });
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const newToken = generateToken(req.user.id, req.user.rol);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({
      error: true,
      message: 'Error al refrescar token'
    });
  }
};

/**
 * Logout (opcional)
 */
const logout = async (req, res) => {
  try {
    // Aquí podrías invalidar el token en MongoDB si lo deseas
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: true,
      message: 'Error al cerrar sesión'
    });
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  refreshToken,
  logout
};
