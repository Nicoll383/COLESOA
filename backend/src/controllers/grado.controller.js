const Grado = require('../models/Grado');

class GradoController {
  // Crear nuevo grado
  static async create(req, res) {
    try {
      const grado = await Grado.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Grado creado exitosamente',
        data: grado
      });
    } catch (error) {
      console.error('Error al crear grado:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear grado'
      });
    }
  }

  // Obtener todos los grados
  static async getAll(req, res) {
    try {
      const filters = {
        nivel: req.query.nivel,
        estado: req.query.estado
      };

      const grados = await Grado.findAll(filters);
      res.json({
        success: true,
        data: grados,
        total: grados.length
      });
    } catch (error) {
      console.error('Error al obtener grados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grados'
      });
    }
  }

  // Obtener grado por ID
  static async getById(req, res) {
    try {
      const grado = await Grado.findById(req.params.id);
      if (!grado) {
        return res.status(404).json({
          success: false,
          message: 'Grado no encontrado'
        });
      }
      res.json({
        success: true,
        data: grado
      });
    } catch (error) {
      console.error('Error al obtener grado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grado'
      });
    }
  }

  // Actualizar grado
  static async update(req, res) {
    try {
      const grado = await Grado.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Grado actualizado exitosamente',
        data: grado
      });
    } catch (error) {
      console.error('Error al actualizar grado:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar grado'
      });
    }
  }

  // Obtener secciones de un grado
  static async getSecciones(req, res) {
    try {
      const { id } = req.params;
      const { año_escolar } = req.query;

      if (!año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar el año escolar'
        });
      }

      const secciones = await Grado.getSecciones(id, año_escolar);
      res.json({
        success: true,
        data: secciones
      });
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener secciones'
      });
    }
  }
}

module.exports = GradoController;
