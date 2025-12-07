const Curso = require('../models/Curso');

class CursoController {
  // Crear nuevo curso
  static async create(req, res) {
    try {
      const curso = await Curso.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: curso
      });
    } catch (error) {
      console.error('Error al crear curso:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear curso'
      });
    }
  }

  // Obtener todos los cursos
  static async getAll(req, res) {
    try {
      const filters = {
        nivel: req.query.nivel,
        grado_id: req.query.grado_id,
        estado: req.query.estado,
        search: req.query.search
      };

      const cursos = await Curso.findAll(filters);
      res.json({
        success: true,
        data: cursos,
        total: cursos.length
      });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cursos'
      });
    }
  }

  // Obtener curso por ID
  static async getById(req, res) {
    try {
      const curso = await Curso.findById(req.params.id);
      if (!curso) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }
      res.json({
        success: true,
        data: curso
      });
    } catch (error) {
      console.error('Error al obtener curso:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener curso'
      });
    }
  }

  // Actualizar curso
  static async update(req, res) {
    try {
      const curso = await Curso.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Curso actualizado exitosamente',
        data: curso
      });
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar curso'
      });
    }
  }

  // Eliminar curso
  static async delete(req, res) {
    try {
      await Curso.delete(req.params.id);
      res.json({
        success: true,
        message: 'Curso eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar curso'
      });
    }
  }

  // Asignar curso a sección
  static async asignarASeccion(req, res) {
    try {
      const asignacion = await Curso.asignarASeccion(req.body);
      res.status(201).json({
        success: true,
        message: 'Curso asignado a sección exitosamente',
        data: asignacion
      });
    } catch (error) {
      console.error('Error al asignar curso:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al asignar curso'
      });
    }
  }

  // Obtener cursos de una sección
  static async getCursosBySeccion(req, res) {
    try {
      const { seccion_id, año_escolar } = req.query;
      if (!seccion_id || !año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar seccion_id y año_escolar'
        });
      }

      const cursos = await Curso.getCursosBySeccion(seccion_id, año_escolar);
      res.json({
        success: true,
        data: cursos
      });
    } catch (error) {
      console.error('Error al obtener cursos de sección:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cursos'
      });
    }
  }

  // Obtener secciones que tienen un curso
  static async getSeccionesByCurso(req, res) {
    try {
      const { curso_id, año_escolar } = req.query;
      if (!curso_id || !año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar curso_id y año_escolar'
        });
      }

      const secciones = await Curso.getSeccionesByCurso(curso_id, año_escolar);
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

  // Remover curso de sección
  static async removerDeSeccion(req, res) {
    try {
      await Curso.removerDeSeccion(req.params.asignacion_id);
      res.json({
        success: true,
        message: 'Curso removido de sección exitosamente'
      });
    } catch (error) {
      console.error('Error al remover curso:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al remover curso'
      });
    }
  }

  // Actualizar docente de curso
  static async actualizarDocente(req, res) {
    try {
      const { asignacion_id } = req.params;
      const { docente_id } = req.body;

      await Curso.actualizarDocente(asignacion_id, docente_id);
      res.json({
        success: true,
        message: 'Docente actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar docente:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar docente'
      });
    }
  }
}

module.exports = CursoController;
