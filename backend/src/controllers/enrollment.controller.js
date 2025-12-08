const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Documento = require('../models/Documento');
const User = require('../models/User');
const Payment = require('../models/Payment');
const emailService = require('../services/email.service');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class EnrollmentController {
  // Crear nueva matrícula (preinscripción)
  static async create(req, res) {
    try {
      const enrollmentData = {
        ...req.body,
        created_by: req.user?.id
      };

      const result = await Enrollment.create(enrollmentData);

      res.status(201).json({
        success: true,
        message: 'Matrícula creada exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear matrícula:', error);

      // Mensajes de error específicos
      if (error.message.includes('no encontrado') ||
          error.message.includes('no disponible') ||
          error.message.includes('No hay vacantes') ||
          error.message.includes('ya está matriculado') ||
          error.message.includes('Faltan') ||
          error.message.includes('retroceder') ||
          error.message.includes('saltar')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear matrícula',
        error: error.message
      });
    }
  }

  // Confirmar matrícula (inicializar documentos y enviar credenciales)
  static async confirmarMatricula(req, res) {
    try {
      const { id } = req.params;

      // 1. Obtener información de la matrícula y el estudiante
      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula no encontrada'
        });
      }

      const student = await Student.findById(enrollment.estudiante_id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      // 2. Inicializar documentos requeridos
      await Documento.inicializarDocumentos(enrollment.estudiante_id, enrollment.id);

      // 3. Crear/obtener usuario padre
      let padreUser = await User.findByEmail(student.apoderado_email);
      let padrePassword = null;

      if (!padreUser) {
        // Crear usuario padre
        padrePassword = emailService.constructor.generarPassword();
        const padreUsuario = emailService.constructor.generarUsuario(
          student.apoderado_nombre,
          student.apoderado_apellido,
          student.apoderado_dni
        );

        const hashedPassword = await bcrypt.hash(padrePassword, 10);

        padreUser = await User.create({
          nombre: student.apoderado_nombre,
          apellido: student.apoderado_apellido,
          email: student.apoderado_email,
          username: padreUsuario,
          password: hashedPassword,
          rol: 'padre',
          dni: student.apoderado_dni,
          telefono: student.apoderado_telefono,
          estado: 'activo'
        });
      }

      // 4. Crear/obtener usuario estudiante
      let estudianteUser = await User.findByEmail(student.email || `${student.dni}@estudiante.colesoa.edu.pe`);
      let estudiantePassword = null;

      if (!estudianteUser) {
        // Crear usuario estudiante
        estudiantePassword = emailService.constructor.generarPassword();
        const estudianteUsuario = emailService.constructor.generarUsuario(
          student.nombre,
          student.apellido,
          student.dni
        );

        const hashedPassword = await bcrypt.hash(estudiantePassword, 10);

        estudianteUser = await User.create({
          nombre: student.nombre,
          apellido: student.apellido,
          email: student.email || `${student.dni}@estudiante.colesoa.edu.pe`,
          username: estudianteUsuario,
          password: hashedPassword,
          rol: 'estudiante',
          dni: student.dni,
          estado: 'activo'
        });
      }

      // 5. Enviar email con credenciales (solo si son nuevas cuentas)
      if (padrePassword && estudiantePassword) {
        try {
          await emailService.enviarCredencialesMatricula({
            padreEmail: student.apoderado_email,
            padreNombre: student.apoderado_nombre,
            padreApellido: student.apoderado_apellido,
            padreUsuario: padreUser.username,
            padrePassword: padrePassword,
            estudianteNombre: student.nombre,
            estudianteApellido: student.apellido,
            estudianteUsuario: estudianteUser.username,
            estudiantePassword: estudiantePassword,
            codigoMatricula: enrollment.codigo_matricula
          });
        } catch (emailError) {
          console.error('Error al enviar email:', emailError);
          // No falla la operación si el email falla
        }
      }

      // 6. Crear cuotas mensuales automáticamente
      const cuotas = await Payment.crearCuotasMensuales(enrollment.id, enrollment.año_escolar, 350.00);

      // 7. Actualizar estado de la matrícula a 'confirmada'
      await Enrollment.updateEstado(id, 'confirmada', 'Matrícula confirmada con documentos y cuotas inicializados');

      res.json({
        success: true,
        message: 'Matrícula confirmada exitosamente. Se han inicializado los documentos, creado las cuotas mensuales y enviado las credenciales.',
        data: {
          enrollment: enrollment,
          documentosInicializados: true,
          cuotasCreadas: cuotas.length,
          cuotas: cuotas,
          credencialesEnviadas: !!(padrePassword && estudiantePassword)
        }
      });
    } catch (error) {
      console.error('Error al confirmar matrícula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al confirmar matrícula',
        error: error.message
      });
    }
  }

  // Obtener todas las matrículas
  static async getAll(req, res) {
    try {
      const filters = {
        año_escolar: req.query.año_escolar,
        estado: req.query.estado,
        grado_id: req.query.grado_id,
        seccion_id: req.query.seccion_id,
        codigo_matricula: req.query.codigo_matricula,
        estudiante_dni: req.query.estudiante_dni,
        limit: req.query.limit
      };

      const enrollments = await Enrollment.findAll(filters);

      res.json({
        success: true,
        data: enrollments,
        total: enrollments.length
      });
    } catch (error) {
      console.error('Error al obtener matrículas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener matrículas',
        error: error.message
      });
    }
  }

  // Obtener matrícula por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula no encontrada'
        });
      }

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('Error al obtener matrícula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener matrícula',
        error: error.message
      });
    }
  }

  // Actualizar estado de matrícula
  static async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      const estadosValidos = ['pendiente', 'pagada', 'cancelada', 'anulada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      await Enrollment.updateEstado(id, estado, observaciones);

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  }

  // Anular matrícula
  static async anular(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un motivo de anulación'
        });
      }

      await Enrollment.anular(id, motivo, req.user?.id);

      res.json({
        success: true,
        message: 'Matrícula anulada exitosamente'
      });
    } catch (error) {
      console.error('Error al anular matrícula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al anular matrícula',
        error: error.message
      });
    }
  }

  // Obtener secciones con vacantes disponibles
  static async getSeccionesConVacantes(req, res) {
    try {
      const { año_escolar } = req.query;

      if (!año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar el año escolar'
        });
      }

      const secciones = await Enrollment.getSeccionesConVacantes(parseInt(año_escolar));

      res.json({
        success: true,
        data: secciones
      });
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener secciones con vacantes',
        error: error.message
      });
    }
  }

  // Obtener vacantes de una sección específica
  static async getVacantes(req, res) {
    try {
      const { seccion_id, año_escolar } = req.query;

      if (!seccion_id || !año_escolar) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar seccion_id y año_escolar'
        });
      }

      const vacantes = await Enrollment.getVacantesDisponibles(parseInt(seccion_id), parseInt(año_escolar));

      res.json({
        success: true,
        data: vacantes
      });
    } catch (error) {
      console.error('Error al obtener vacantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vacantes',
        error: error.message
      });
    }
  }

  // Generar contrato de matrícula en PDF
  static async generarContrato(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula no encontrada'
        });
      }

      // Crear documento PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=contrato-${enrollment.codigo_matricula}.pdf`);

      // Pipe el PDF directamente a la respuesta
      doc.pipe(res);

      // Encabezado
      doc.fontSize(20)
         .text('COLEGIO SOA', { align: 'center' })
         .fontSize(14)
         .text('CONTRATO DE MATRÍCULA', { align: 'center' })
         .moveDown();

      doc.fontSize(10)
         .text(`Código de Matrícula: ${enrollment.codigo_matricula}`, { align: 'right' })
         .text(`Fecha: ${new Date(enrollment.fecha_matricula).toLocaleDateString('es-PE')}`, { align: 'right' })
         .moveDown(2);

      // Información del estudiante
      doc.fontSize(12)
         .text('DATOS DEL ESTUDIANTE', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .text(`Nombre Completo: ${enrollment.estudiante_nombres} ${enrollment.estudiante_apellidos}`)
         .text(`DNI: ${enrollment.estudiante_dni}`)
         .text(`Código de Estudiante: ${enrollment.codigo_estudiante}`)
         .moveDown();

      // Información académica
      doc.fontSize(12)
         .text('INFORMACIÓN ACADÉMICA', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .text(`Año Escolar: ${enrollment.año_escolar}`)
         .text(`Grado: ${enrollment.grado_nombre}`)
         .text(`Sección: ${enrollment.seccion_nombre}`)
         .text(`Turno: ${enrollment.turno}`)
         .text(`Aula: ${enrollment.aula || 'Por asignar'}`)
         .text(`Tipo de Matrícula: ${enrollment.tipo_matricula.toUpperCase()}`)
         .moveDown();

      // Información del apoderado
      if (enrollment.apoderados && enrollment.apoderados.length > 0) {
        const apoderado = enrollment.apoderados[0];
        doc.fontSize(12)
           .text('DATOS DEL APODERADO', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .text(`Nombre Completo: ${apoderado.nombres} ${apoderado.apellidos}`)
           .text(`DNI: ${apoderado.dni}`)
           .text(`Tipo: ${apoderado.tipo_apoderado}`)
           .text(`Teléfono: ${apoderado.telefono || 'No proporcionado'}`)
           .text(`Email: ${apoderado.email || 'No proporcionado'}`)
           .moveDown();
      }

      // Información financiera
      doc.fontSize(12)
         .text('INFORMACIÓN FINANCIERA', { underline: true })
         .moveDown(0.5);

      doc.fontSize(10)
         .text(`Monto de Matrícula: S/. ${parseFloat(enrollment.monto_total).toFixed(2)}`)
         .text(`Descuento: S/. ${parseFloat(enrollment.descuento || 0).toFixed(2)}`)
         .text(`Total a Pagar: S/. ${(parseFloat(enrollment.monto_total) - parseFloat(enrollment.descuento || 0)).toFixed(2)}`)
         .text(`Estado: ${enrollment.estado.toUpperCase()}`)
         .moveDown(2);

      // Términos y condiciones
      doc.fontSize(12)
         .text('TÉRMINOS Y CONDICIONES', { underline: true })
         .moveDown(0.5);

      doc.fontSize(9)
         .text('1. El apoderado se compromete a cumplir con las normas y reglamentos del colegio.')
         .text('2. El pago de la matrícula debe realizarse en las fechas establecidas.')
         .text('3. El apoderado es responsable de la asistencia y puntualidad del estudiante.')
         .text('4. El colegio se reserva el derecho de admisión.')
         .text('5. La anulación de matrícula debe solicitarse por escrito.')
         .moveDown(3);

      // Firmas
      doc.fontSize(10)
         .text('_________________________', 100, doc.y)
         .text('_________________________', 350, doc.y - 10)
         .text('Firma del Apoderado', 100, doc.y + 5)
         .text('Representante del Colegio', 350, doc.y - 5);

      // Pie de página
      doc.fontSize(8)
         .text(`Generado el ${new Date().toLocaleString('es-PE')}`,
               50,
               doc.page.height - 50,
               { align: 'center' });

      // Finalizar el PDF
      doc.end();

    } catch (error) {
      console.error('Error al generar contrato:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error al generar contrato',
          error: error.message
        });
      }
    }
  }

  // Generar comprobante de matrícula
  static async generarComprobante(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Matrícula no encontrada'
        });
      }

      const doc = new PDFDocument({ size: 'A5', margin: 30 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=comprobante-${enrollment.codigo_matricula}.pdf`);

      doc.pipe(res);

      // Encabezado
      doc.fontSize(16)
         .text('COLEGIO SOA', { align: 'center' })
         .fontSize(12)
         .text('COMPROBANTE DE MATRÍCULA', { align: 'center' })
         .moveDown();

      // Información principal
      doc.fontSize(10)
         .text(`Código: ${enrollment.codigo_matricula}`, { bold: true })
         .text(`Fecha: ${new Date(enrollment.fecha_matricula).toLocaleDateString('es-PE')}`)
         .text(`Estado: ${enrollment.estado.toUpperCase()}`)
         .moveDown();

      doc.fontSize(11)
         .text(`Estudiante: ${enrollment.estudiante_nombres} ${enrollment.estudiante_apellidos}`)
         .text(`DNI: ${enrollment.estudiante_dni}`)
         .text(`Grado: ${enrollment.grado_nombre} - Sección: ${enrollment.seccion_nombre}`)
         .text(`Año Escolar: ${enrollment.año_escolar}`)
         .moveDown();

      doc.fontSize(12)
         .text(`Monto Total: S/. ${parseFloat(enrollment.monto_total).toFixed(2)}`, { bold: true })
         .moveDown(2);

      doc.fontSize(8)
         .text('Este comprobante confirma su matrícula en el Colegio SOA.', { align: 'center' })
         .text(`Generado: ${new Date().toLocaleString('es-PE')}`, { align: 'center' });

      doc.end();

    } catch (error) {
      console.error('Error al generar comprobante:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error al generar comprobante',
          error: error.message
        });
      }
    }
  }

  // Validar si un estudiante puede matricularse en un grado específico
  static async validarGrado(req, res) {
    try {
      const { estudianteId, gradoId } = req.params;

      const validation = await Student.validarGradoMatricula(estudianteId, gradoId);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error al validar grado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar grado',
        error: error.message
      });
    }
  }
}

module.exports = EnrollmentController;
