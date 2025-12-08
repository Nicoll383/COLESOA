// Servicio de Email DESHABILITADO TEMPORALMENTE
// Este es un mock para que el servidor inicie mientras solucionamos el problema de nodemailer

class EmailService {
  constructor() {
    console.warn('⚠️  ADVERTENCIA: Servicio de email deshabilitado temporalmente');
    console.warn('⚠️  Los emails NO se enviarán hasta solucionar el problema de nodemailer');
  }

  async sendEmail(to, subject, html) {
    console.log('📧 Email (NO ENVIADO):', { to, subject });
    return {
      success: true,
      messageId: 'mock-' + Date.now(),
      note: 'Email service is disabled'
    };
  }

  async sendEnrollmentConfirmation(enrollment, student, parent) {
    console.log('📧 Enrollment confirmation (NO ENVIADO)');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async sendPaymentReceipt(payment, enrollment, student) {
    console.log('📧 Payment receipt (NO ENVIADO)');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async sendPaymentReminder(enrollment, student, parent, debtAmount) {
    console.log('📧 Payment reminder (NO ENVIADO)');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async sendCredentials(user, temporaryPassword) {
    console.log('📧 Credentials (NO ENVIADO)');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async enviarCredencialesMatricula(data) {
    console.log('📧 Credenciales matrícula (NO ENVIADO):', {
      to: data.padreEmail,
      codigo: data.codigoMatricula
    });
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async enviarNotificacionDocumento(data) {
    console.log('📧 Notificación documento (NO ENVIADO):', {
      to: data.email,
      documento: data.nombreDocumento,
      estado: data.estado
    });
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  static generarPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

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
