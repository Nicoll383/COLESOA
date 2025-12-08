const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Error al configurar el servicio de email:', error);
      } else {
        console.log('✅ Servicio de email listo para enviar mensajes');
      }
    });
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Colegio SOA" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar confirmación de matrícula
   */
  async sendEnrollmentConfirmation(enrollment, student, parent) {
    const subject = 'Confirmación de Matrícula - Colegio SOA';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de Matrícula</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; text-align: center;">Colegio SOA</h1>
          <h2 style="color: #4b5563;">Confirmación de Matrícula</h2>

          <p>Estimado/a ${parent.nombres} ${parent.apellidos},</p>

          <p>Nos complace informarle que la matrícula de su hijo/a ha sido registrada exitosamente.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Datos de la Matrícula</h3>
            <p><strong>Código de Matrícula:</strong> ${enrollment.codigo_matricula}</p>
            <p><strong>Estudiante:</strong> ${student.nombres} ${student.apellidos}</p>
            <p><strong>Grado:</strong> ${enrollment.grado_nombre}</p>
            <p><strong>Sección:</strong> ${enrollment.seccion_nombre}</p>
            <p><strong>Año Escolar:</strong> ${enrollment.año_escolar}</p>
            <p><strong>Monto:</strong> S/. ${enrollment.monto_total}</p>
          </div>

          <p>Para completar el proceso, debe realizar el pago correspondiente dentro de los próximos 7 días hábiles.</p>

          <p>Si tiene alguna consulta, no dude en contactarnos.</p>

          <p style="margin-top: 30px;">
            Atentamente,<br>
            <strong>Colegio SOA</strong><br>
            Sistema de Matrículas
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(parent.email, subject, html);
  }

  /**
   * Enviar recibo de pago
   */
  async sendPaymentReceipt(payment, enrollment, student) {
    const subject = 'Recibo de Pago - Colegio SOA';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Pago</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; text-align: center;">Colegio SOA</h1>
          <h2 style="color: #4b5563;">Recibo de Pago</h2>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Datos del Pago</h3>
            <p><strong>Código de Pago:</strong> ${payment.codigo_pago}</p>
            <p><strong>Fecha:</strong> ${new Date(payment.fecha_pago).toLocaleDateString('es-PE')}</p>
            <p><strong>Estudiante:</strong> ${student.nombres} ${student.apellidos}</p>
            <p><strong>Concepto:</strong> ${payment.concepto}</p>
            <p><strong>Monto:</strong> S/. ${payment.monto}</p>
            <p><strong>Método de Pago:</strong> ${payment.metodo_pago}</p>
            ${payment.numero_operacion ? `<p><strong>Número de Operación:</strong> ${payment.numero_operacion}</p>` : ''}
          </div>

          <p>Gracias por su pago. Este comprobante es válido para cualquier trámite administrativo.</p>

          <p style="margin-top: 30px;">
            Atentamente,<br>
            <strong>Colegio SOA</strong><br>
            Departamento de Finanzas
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(student.email || enrollment.parent_email, subject, html);
  }

  /**
   * Enviar recordatorio de pago
   */
  async sendPaymentReminder(enrollment, student, parent, debtAmount) {
    const subject = 'Recordatorio de Pago - Colegio SOA';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recordatorio de Pago</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; text-align: center;">Colegio SOA</h1>
          <h2 style="color: #f59e0b;">Recordatorio de Pago Pendiente</h2>

          <p>Estimado/a ${parent.nombres} ${parent.apellidos},</p>

          <p>Le recordamos que tiene un pago pendiente correspondiente a la matrícula de su hijo/a.</p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Deuda Pendiente</h3>
            <p><strong>Estudiante:</strong> ${student.nombres} ${student.apellidos}</p>
            <p><strong>Código de Matrícula:</strong> ${enrollment.codigo_matricula}</p>
            <p><strong>Monto Pendiente:</strong> <span style="color: #dc2626; font-size: 1.2em;">S/. ${debtAmount}</span></p>
          </div>

          <p>Le solicitamos regularizar su situación a la brevedad posible.</p>

          <p>Para mayor información, comuníquese con el departamento de finanzas.</p>

          <p style="margin-top: 30px;">
            Atentamente,<br>
            <strong>Colegio SOA</strong><br>
            Departamento de Finanzas
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(parent.email, subject, html);
  }

  /**
   * Enviar credenciales de acceso
   */
  async sendCredentials(user, temporaryPassword) {
    const subject = 'Credenciales de Acceso - Colegio SOA';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Credenciales de Acceso</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; text-align: center;">Colegio SOA</h1>
          <h2 style="color: #4b5563;">Bienvenido al Sistema</h2>

          <p>Hola ${user.nombre} ${user.apellido},</p>

          <p>Se ha creado una cuenta para usted en el Sistema de Matrículas del Colegio SOA.</p>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Sus Credenciales de Acceso</h3>
            <p><strong>Usuario:</strong> ${user.email}</p>
            <p><strong>Contraseña Temporal:</strong> ${temporaryPassword}</p>
            <p><strong>Rol:</strong> ${user.rol}</p>
          </div>

          <p><strong>IMPORTANTE:</strong> Por seguridad, le recomendamos cambiar su contraseña al iniciar sesión por primera vez.</p>

          <p>Puede acceder al sistema desde: ${process.env.FRONTEND_URL || 'http://localhost:5173'}</p>

          <p style="margin-top: 30px;">
            Atentamente,<br>
            <strong>Colegio SOA</strong><br>
            Administración del Sistema
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Enviar credenciales de matrícula (padre + estudiante)
   */
  async enviarCredencialesMatricula(data) {
    const {
      padreEmail,
      padreNombre,
      padreApellido,
      padreUsuario,
      padrePassword,
      estudianteNombre,
      estudianteApellido,
      estudianteUsuario,
      estudiantePassword,
      codigoMatricula
    } = data;

    const loginUrl = process.env.FRONTEND_LOGIN_URL || process.env.FRONTEND_URL || 'http://localhost:5173/login';

    const subject = `Credenciales de Acceso - Matrícula ${codigoMatricula}`;
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credenciales de Acceso</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .credentials-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .credentials-box h3 {
            margin-top: 0;
            color: #667eea;
          }
          .credential-item {
            margin: 10px 0;
          }
          .credential-label {
            font-weight: bold;
            color: #555;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background-color: white;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-left: 10px;
            border: 1px solid #ddd;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Sistema de Matrículas SOA</h1>
            <p>Credenciales de Acceso al Sistema</p>
          </div>

          <p>Estimado/a <strong>${padreNombre} ${padreApellido}</strong>,</p>

          <p>Le damos la bienvenida al Sistema de Matrículas del Colegio SOA. La matrícula <strong>${codigoMatricula}</strong> ha sido registrada exitosamente.</p>

          <p>A continuación, encontrará las credenciales de acceso al sistema para usted y su hijo/a:</p>

          <div class="credentials-box">
            <h3>👤 Credenciales del Padre/Apoderado</h3>
            <div class="credential-item">
              <span class="credential-label">Usuario:</span>
              <span class="credential-value">${padreUsuario}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Contraseña:</span>
              <span class="credential-value">${padrePassword}</span>
            </div>
          </div>

          <div class="credentials-box">
            <h3>🎒 Credenciales del Estudiante</h3>
            <p><strong>${estudianteNombre} ${estudianteApellido}</strong></p>
            <div class="credential-item">
              <span class="credential-label">Usuario:</span>
              <span class="credential-value">${estudianteUsuario}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Contraseña:</span>
              <span class="credential-value">${estudiantePassword}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Acceder al Sistema</a>
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Por favor, cambie su contraseña después del primer inicio de sesión.</li>
              <li>No comparta sus credenciales con terceros.</li>
              <li>En el portal de padres podrá subir los documentos requeridos para completar el proceso de matrícula.</li>
            </ul>
          </div>

          <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>

          <div class="footer">
            <p><strong>Colegio SOA</strong></p>
            <p>Sistema de Matrículas en Línea</p>
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no responda a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(padreEmail, subject, html);
  }

  /**
   * Enviar notificación de cambio de estado de documento
   */
  async enviarNotificacionDocumento(data) {
    const {
      email,
      nombrePadre,
      nombreEstudiante,
      nombreDocumento,
      estado,
      observaciones
    } = data;

    const estadoConfig = {
      aceptado: {
        color: '#28a745',
        icon: '✅',
        title: 'Documento Aprobado',
        message: 'Su documento ha sido aprobado exitosamente.'
      },
      rechazado: {
        color: '#dc3545',
        icon: '❌',
        title: 'Documento Rechazado',
        message: 'Su documento ha sido rechazado. Por favor, revise las observaciones y vuelva a subirlo.'
      },
      en_revision: {
        color: '#ffc107',
        icon: '👀',
        title: 'Documento En Revisión',
        message: 'Su documento está siendo revisado por nuestro personal.'
      }
    };

    const config = estadoConfig[estado] || estadoConfig.en_revision;
    const loginUrl = process.env.FRONTEND_LOGIN_URL || process.env.FRONTEND_URL || 'http://localhost:5173/login';

    const subject = `Documento ${config.title} - ${nombreDocumento}`;
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Documento</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: ${config.color};
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .document-box {
            background-color: #f8f9fa;
            border-left: 4px solid ${config.color};
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .observation-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: ${config.color};
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.icon} ${config.title}</h1>
          </div>

          <p>Estimado/a <strong>${nombrePadre}</strong>,</p>

          <p>${config.message}</p>

          <div class="document-box">
            <h3>📄 Información del Documento</h3>
            <p><strong>Estudiante:</strong> ${nombreEstudiante}</p>
            <p><strong>Documento:</strong> ${nombreDocumento}</p>
            <p><strong>Estado:</strong> ${config.title}</p>
          </div>

          ${observaciones ? `
            <div class="observation-box">
              <h3>💬 Observaciones</h3>
              <p>${observaciones}</p>
            </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Ir al Portal</a>
          </div>

          <p>Si tiene alguna pregunta, no dude en contactarnos.</p>

          <div class="footer">
            <p><strong>Colegio SOA</strong></p>
            <p>Sistema de Matrículas en Línea</p>
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no responda a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Generar contraseña aleatoria
   */
  static generarPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Generar nombre de usuario desde nombre y DNI
   */
  static generarUsuario(nombre, apellido, dni) {
    const nombreLimpio = nombre.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');

    const apellidoLimpio = apellido.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');

    return `${nombreLimpio.charAt(0)}${apellidoLimpio}${dni.slice(-4)}`;
  }
}

module.exports = new EmailService();
