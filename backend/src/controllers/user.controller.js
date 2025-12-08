const User = require('../models/User');

class UserController {
  // Listar usuarios
  static async list(req, res) {
    try {
      const filters = {
        rol: req.query.rol,
        estado: req.query.estado
      };

      const users = await User.list(filters);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar usuarios',
        error: error.message
      });
    }
  }

  // Obtener usuario por ID
  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  // Crear nuevo usuario
  static async create(req, res) {
    try {
      const { email, password, nombre, apellido, rol, telefono, dni } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: email, password, nombre, apellido, rol'
        });
      }

      // Validar que el email no esté en uso
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      const userId = await User.create(req.body);
      const newUser = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: newUser
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico o DNI ya está registrado'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
        error: error.message
      });
    }
  }

  // Actualizar usuario
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, telefono, dni, estado, rol } = req.body;

      // Verificar que el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No permitir que el usuario se desactive a sí mismo
      if (req.user.id === parseInt(id) && estado === 'inactivo') {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
      }

      const updateData = { nombre, apellido, telefono, dni, estado };

      // Solo permitir cambiar rol si es administrador
      if (rol && req.user.rol === 'administrador') {
        updateData.rol = rol;
      }

      const updated = await User.update(id, updateData);

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el usuario'
        });
      }

      const updatedUser = await User.findById(id);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'El DNI ya está registrado'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  }

  // Cambiar contraseña
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const updated = await User.changePassword(id, newPassword);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }

  // Cambiar estado (activar/desactivar)
  static async toggleEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "activo" o "inactivo"'
        });
      }

      // No permitir que el usuario se desactive a sí mismo
      if (req.user.id === parseInt(id) && estado === 'inactivo') {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
      }

      const updated = await User.update(id, { estado });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const updatedUser = await User.findById(id);

      res.json({
        success: true,
        message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedUser
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del usuario',
        error: error.message
      });
    }
  }

  // Obtener permisos de un usuario
  static async getPermisos(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const permisos = await User.getPermisos(id);

      res.json({
        success: true,
        data: {
          usuario_id: id,
          rol: user.rol,
          permisos: permisos
        }
      });
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener permisos',
        error: error.message
      });
    }
  }

  // Actualizar permisos de un usuario
  static async updatePermisos(req, res) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;

      // Verificar que el usuario existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No permitir modificar permisos del administrador principal
      if (user.email === 'admin@colegiosoa.edu.pe') {
        return res.status(403).json({
          success: false,
          message: 'No se pueden modificar los permisos del administrador principal'
        });
      }

      // Validar estructura de permisos
      if (!permisos || typeof permisos !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Los permisos deben ser un objeto válido'
        });
      }

      const updated = await User.updatePermisos(id, permisos);

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No se pudieron actualizar los permisos'
        });
      }

      const updatedPermisos = await User.getPermisos(id);

      res.json({
        success: true,
        message: 'Permisos actualizados exitosamente',
        data: {
          usuario_id: id,
          permisos: updatedPermisos
        }
      });
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar permisos',
        error: error.message
      });
    }
  }
}

module.exports = UserController;
