const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/estudiantes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten JPG, PNG y PDF'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

class StudentController {
  // Crear nuevo estudiante
  static async create(req, res) {
    try {
      const studentData = req.body;

      // Validaciones básicas
      if (!studentData.nombres || !studentData.apellidos || !studentData.dni || !studentData.fecha_nacimiento) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: nombres, apellidos, DNI, fecha_nacimiento'
        });
      }

      // Validar DNI (8 dígitos para Perú)
      if (!/^\d{8}$/.test(studentData.dni)) {
        return res.status(400).json({
          success: false,
          message: 'El DNI debe tener 8 dígitos'
        });
      }

      // Validar información médica obligatoria
      if (studentData.informacion_medica) {
        if (!studentData.informacion_medica.contacto_emergencia_nombre ||
            !studentData.informacion_medica.contacto_emergencia_telefono) {
          return res.status(400).json({
            success: false,
            message: 'Debe proporcionar contacto de emergencia (nombre y teléfono)'
          });
        }
      }

      const result = await Student.create(studentData);

      res.status(201).json({
        success: true,
        message: 'Estudiante creado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear estudiante:', error);

      if (error.message === 'Ya existe un estudiante con ese DNI') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear estudiante',
        error: error.message
      });
    }
  }

  // Obtener todos los estudiantes
  static async getAll(req, res) {
    try {
      const filters = {
        dni: req.query.dni,
        nombres: req.query.nombres,
        apellidos: req.query.apellidos,
        estado: req.query.estado,
        genero: req.query.genero,
        limit: req.query.limit
      };

      const students = await Student.findAll(filters);

      res.json({
        success: true,
        data: students,
        total: students.length
      });
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estudiantes',
        error: error.message
      });
    }
  }

  // Obtener estudiante por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estudiante',
        error: error.message
      });
    }
  }

  // Actualizar estudiante
  static async update(req, res) {
    try {
      const { id } = req.params;
      const studentData = req.body;

      // Verificar que el estudiante existe
      const existing = await Student.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      await Student.update(id, studentData);

      res.json({
        success: true,
        message: 'Estudiante actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estudiante',
        error: error.message
      });
    }
  }

  // Eliminar estudiante
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el estudiante existe
      const existing = await Student.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      await Student.delete(id);

      res.json({
        success: true,
        message: 'Estudiante eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar estudiante',
        error: error.message
      });
    }
  }

  // Validar si puede matricularse en un grado
  static async validarMatricula(req, res) {
    try {
      const { estudianteId, gradoId } = req.body;

      if (!estudianteId || !gradoId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere estudianteId y gradoId'
        });
      }

      const validacion = await Student.validarGradoMatricula(estudianteId, gradoId);

      res.json({
        success: true,
        data: validacion
      });
    } catch (error) {
      console.error('Error al validar matrícula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar matrícula',
        error: error.message
      });
    }
  }

  // Verificar documentos obligatorios
  static async verificarDocumentos(req, res) {
    try {
      const { id } = req.params;

      const verificacion = await Student.verificarDocumentosCompletos(id);

      res.json({
        success: true,
        data: verificacion
      });
    } catch (error) {
      console.error('Error al verificar documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar documentos',
        error: error.message
      });
    }
  }

  // Subir documento
  static async subirDocumento(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha enviado ningún archivo'
        });
      }

      const { estudianteId, tipoDocumento, esObligatorio } = req.body;

      if (!estudianteId || !tipoDocumento) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere estudianteId y tipoDocumento'
        });
      }

      const documentoData = {
        estudiante_id: estudianteId,
        tipo_documento: tipoDocumento,
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.path,
        tamaño_bytes: req.file.size,
        mime_type: req.file.mimetype,
        es_obligatorio: esObligatorio === 'true',
        estado_verificacion: 'pendiente',
        subido_por: req.user ? req.user.id : null
      };

      const documentoId = await Student.agregarDocumento(documentoData);

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: {
          id: documentoId,
          nombre_archivo: req.file.originalname,
          ruta_archivo: req.file.path
        }
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

  // Agregar historial académico
  static async agregarHistorial(req, res) {
    try {
      const historialData = req.body;

      if (!historialData.estudiante_id || !historialData.año_escolar ||
          !historialData.grado_id || !historialData.estado_año) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: estudiante_id, año_escolar, grado_id, estado_año'
        });
      }

      const historialId = await Student.agregarHistorialAcademico(historialData);

      res.status(201).json({
        success: true,
        message: 'Historial académico agregado exitosamente',
        data: { id: historialId }
      });
    } catch (error) {
      console.error('Error al agregar historial:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un registro para este estudiante en ese año escolar'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al agregar historial académico',
        error: error.message
      });
    }
  }

  // Middleware de multer
  static uploadMiddleware() {
    return upload.single('documento');
  }
}

module.exports = StudentController;
