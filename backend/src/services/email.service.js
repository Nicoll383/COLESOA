const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
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
}

module.exports = new EmailService();
