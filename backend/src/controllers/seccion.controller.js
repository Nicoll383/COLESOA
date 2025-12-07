const Seccion = require('../models/Seccion');

class SeccionController {
  // Crear nueva sección
  static async create(req, res) {
    try {
      const seccion = await Seccion.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Sección creada exitosamente',
        data: seccion
      });
    } catch (error) {
      console.error('Error al crear sección:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear sección'
      });
    }
  }

  // Obtener todas las secciones
  static async getAll(req, res) {
    try {
      const filters = {
        grado_id: req.query.grado_id,
        año_escolar: req.query.año_escolar,
        turno: req.query.turno,
        estado: req.query.estado,
        nivel: req.query.nivel
      };

      const secciones = await Seccion.findAll(filters);
      res.json({
        success: true,
        data: secciones,
        total: secciones.length
      });
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener secciones'
      });
    }
  }

  // Obtener sección por ID
  static async getById(req, res) {
    try {
      const seccion = await Seccion.findById(req.params.id);
      if (!seccion) {
        return res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
      }
      res.json({
        success: true,
        data: seccion
      });
    } catch (error) {
      console.error('Error al obtener sección:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener sección'
      });
    }
  }

  // Actualizar sección
  static async update(req, res) {
    try {
      const seccion = await Seccion.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Sección actualizada exitosamente',
        data: seccion
      });
    } catch (error) {
      console.error('Error al actualizar sección:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar sección'
      });
    }
  }

  // Eliminar sección
  static async delete(req, res) {
    try {
      await Seccion.delete(req.params.id);
      res.json({
        success: true,
        message: 'Sección eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar sección'
      });
    }
  }

  // Obtener estudiantes de una sección
  static async getEstudiantes(req, res) {
    try {
      const { id } = req.params;
      const { año_escolar } = req.query;

      if (!año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar el año escolar'
        });
      }

      const estudiantes = await Seccion.getEstudiantes(id, año_escolar);
      res.json({
        success: true,
        data: estudiantes
      });
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estudiantes'
      });
    }
  }

  // Obtener horario de una sección
  static async getHorario(req, res) {
    try {
      const { id } = req.params;
      const { año_escolar } = req.query;

      if (!año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar el año escolar'
        });
      }

      const horario = await Seccion.getHorario(id, año_escolar);
      res.json({
        success: true,
        data: horario
      });
    } catch (error) {
      console.error('Error al obtener horario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener horario'
      });
    }
  }

  // Agregar horario
  static async agregarHorario(req, res) {
    try {
      const horario = await Seccion.agregarHorario(req.body);
      res.status(201).json({
        success: true,
        message: 'Horario agregado exitosamente',
        data: horario
      });
    } catch (error) {
      console.error('Error al agregar horario:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al agregar horario'
      });
    }
  }

  // Eliminar horario
  static async eliminarHorario(req, res) {
    try {
      await Seccion.eliminarHorario(req.params.horario_id);
      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar horario'
      });
    }
  }
}

module.exports = SeccionController;
