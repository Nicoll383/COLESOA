const Documento = require('../models/Documento');
const emailService = require('../services/email.service');
const path = require('path');
const fs = require('fs').promises;

class DocumentoController {
  // Obtener documentos requeridos
  static async getDocumentosRequeridos(req, res) {
    try {
      const documentos = await Documento.getDocumentosRequeridos();

      res.json({
        success: true,
        data: documentos
      });
    } catch (error) {
      console.error('Error al obtener documentos requeridos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener documentos requeridos',
        error: error.message
      });
    }
  }

  // Obtener documentos de un estudiante
  static async getDocumentosEstudiante(req, res) {
    try {
      const { estudianteId } = req.params;
      const { matricula_id } = req.query;

      const documentos = await Documento.getDocumentosEstudiante(
        estudianteId,
        matricula_id
      );

      res.json({
        success: true,
        data: documentos
      });
    } catch (error) {
      console.error('Error al obtener documentos del estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener documentos del estudiante',
        error: error.message
      });
    }
  }

  // Subir documento
  static async subirDocumento(req, res) {
    try {
      if (!req.files || !req.files.archivo) {
        return res.status(400).json({
          success: false,
          message: 'No se ha enviado ningún archivo'
        });
      }

      const { documentoEstudianteId } = req.body;
      const archivo = req.files.archivo;

      // Validar tipo de archivo
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileExtension = path.extname(archivo.name).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG'
        });
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (archivo.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido de 5MB'
        });
      }

      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads/documentos');
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileName = `${documentoEstudianteId}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Guardar archivo
      await archivo.mv(filePath);

      // Actualizar en base de datos
      const archivoUrl = `/uploads/documentos/${fileName}`;
      const documento = await Documento.subirDocumento({
        documentoEstudianteId,
        archivoUrl,
        nombreArchivo: archivo.name
      });

      res.json({
        success: true,
        message: 'Documento subido exitosamente',
        data: documento
      });
    } catch (error) {
      console.error('Error al subir documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir documento',
        error: error.message
      });
    }
  }

  // Cambiar estado del documento (para secretaria)
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
      }

      const estadosValidos = ['pendiente', 'enviado', 'en_revision', 'aceptado', 'rechazado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const documento = await Documento.cambiarEstado(
        id,
        estado,
        req.user.id,
        observaciones
      );

      // Enviar notificación por email si el documento fue aceptado o rechazado
      if (estado === 'aceptado' || estado === 'rechazado') {
        try {
          // Obtener información adicional para el email
          const documentoDetalle = await Documento.getDocumentosEstudiante(
            documento.estudiante_id
          );

          const docInfo = documentoDetalle.find(d => d.id === parseInt(id));

          if (docInfo && docInfo.padre_email) {
            await emailService.enviarNotificacionDocumento({
              email: docInfo.padre_email,
              nombrePadre: `${docInfo.padre_nombre} ${docInfo.padre_apellido}`,
              nombreEstudiante: `${docInfo.estudiante_nombre} ${docInfo.estudiante_apellido}`,
              nombreDocumento: docInfo.nombre,
              estado: estado,
              observaciones: observaciones || ''
            });
          }
        } catch (emailError) {
          console.error('Error al enviar notificación por email:', emailError);
          // No falla la operación si el email falla
        }
      }

      res.json({
        success: true,
        message: 'Estado del documento actualizado',
        data: documento
      });
    } catch (error) {
      console.error('Error al cambiar estado del documento:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del documento',
        error: error.message
      });
    }
  }

  // Obtener seguimiento de un documento
  static async getSeguimiento(req, res) {
    try {
      const { id } = req.params;

      const seguimiento = await Documento.getSeguimiento(id);

      res.json({
        success: true,
        data: seguimiento
      });
    } catch (error) {
      console.error('Error al obtener seguimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener seguimiento',
        error: error.message
      });
    }
  }

  // Obtener resumen de documentos por matrícula
  static async getResumenPorMatricula(req, res) {
    try {
      const { matriculaId } = req.params;

      const resumen = await Documento.getResumenPorMatricula(matriculaId);

      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen de documentos',
        error: error.message
      });
    }
  }

  // Obtener documentos pendientes de revisión (para secretaria)
  static async getDocumentosPendientesRevision(req, res) {
    try {
      const documentos = await Documento.getDocumentosPendientesRevision();

      res.json({
        success: true,
        data: documentos
      });
    } catch (error) {
      console.error('Error al obtener documentos pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener documentos pendientes de revisión',
        error: error.message
      });
    }
  }

  // Obtener documento por ID
  static async getDocumentoById(req, res) {
    try {
      const { id } = req.params;

      const documento = await Documento.getDocumentoById(id);

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      res.json({
        success: true,
        data: documento
      });
    } catch (error) {
      console.error('Error al obtener documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener documento',
        error: error.message
      });
    }
  }
}

module.exports = DocumentoController;
