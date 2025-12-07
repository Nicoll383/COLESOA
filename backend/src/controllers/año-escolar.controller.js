const AñoEscolar = require('../models/AñoEscolar');

class AñoEscolarController {
  // Crear nueva configuración
  static async create(req, res) {
    try {
      const config = await AñoEscolar.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Configuración creada exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error al crear configuración:', error);
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al crear configuración',
        error: error.message
      });
    }
  }

  // Obtener todas las configuraciones
  static async getAll(req, res) {
    try {
      const filters = {
        estado: req.query.estado,
        año_escolar: req.query.año_escolar
      };
      const configs = await AñoEscolar.findAll(filters);
      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuraciones',
        error: error.message
      });
    }
  }

  // Obtener configuración por ID
  static async getById(req, res) {
    try {
      const config = await AñoEscolar.findById(req.params.id);
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración',
        error: error.message
      });
    }
  }

  // Obtener configuración por año
  static async getByYear(req, res) {
    try {
      const config = await AñoEscolar.findByYear(req.params.year);
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'No existe configuración para este año escolar'
        });
      }
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración',
        error: error.message
      });
    }
  }

  // Obtener configuración activa
  static async getActive(req, res) {
    try {
      const config = await AñoEscolar.getActiveConfig();
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración activa',
        error: error.message
      });
    }
  }

  // Actualizar configuración
  static async update(req, res) {
    try {
      const config = await AñoEscolar.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración',
        error: error.message
      });
    }
  }

  // Cambiar estado
  static async toggleEstado(req, res) {
    try {
      const { estado } = req.body;
      if (!['activo', 'inactivo', 'cerrado'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const config = await AñoEscolar.toggleEstado(req.params.id, estado);
      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado',
        error: error.message
      });
    }
  }

  // Eliminar configuración
  static async delete(req, res) {
    try {
      await AñoEscolar.delete(req.params.id);
      res.json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al eliminar configuración',
        error: error.message
      });
    }
  }
}

module.exports = AñoEscolarController;
