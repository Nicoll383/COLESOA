const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');

class CarnetService {
  /**
   * Generar carnet de estudiante en PDF
   * @param {Object} student - Datos del estudiante
   * @param {Object} enrollment - Datos de matrícula (opcional)
   * @returns {PDFDocument} - Documento PDF
   */
  static generateCarnet(student, enrollment = null) {
    // Crear documento PDF en tamaño de tarjeta ID (3.375 x 2.125 pulgadas)
    const doc = new PDFDocument({
      size: [240, 150], // Tamaño aproximado de tarjeta ID en puntos
      margins: { top: 10, bottom: 10, left: 10, right: 10 }
    });

    // Colores institucionales
    const primaryColor = '#1e3a8a';
    const secondaryColor = '#3b82f6';

    // Fondo con gradiente (simulado con rectángulo)
    doc.rect(0, 0, 240, 150)
       .fill('#f0f9ff');

    // Encabezado con color institucional
    doc.rect(0, 0, 240, 35)
       .fill(primaryColor);

    // Logo y título
    doc.fontSize(16)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('COLEGIO SOA', 10, 8, { align: 'center' });

    doc.fontSize(8)
       .fillColor('white')
       .font('Helvetica')
       .text('Sistema de Aprendizaje Online', 10, 24, { align: 'center' });

    // Foto del estudiante (si existe)
    const fotoPath = student.foto_url
      ? path.join(__dirname, '../../uploads', student.foto_url.replace('/uploads/', ''))
      : null;

    let fotoX = 15;
    let fotoY = 45;
    let fotoWidth = 50;
    let fotoHeight = 60;

    if (fotoPath && fs.existsSync(fotoPath)) {
      try {
        doc.image(fotoPath, fotoX, fotoY, {
          width: fotoWidth,
          height: fotoHeight,
          fit: [fotoWidth, fotoHeight],
          align: 'center'
        });

        // Borde para la foto
        doc.rect(fotoX, fotoY, fotoWidth, fotoHeight)
           .stroke('#cccccc');
      } catch (error) {
        console.error('Error al cargar foto:', error);
        // Si falla, mostrar placeholder
        this.drawPhotoPlaceholder(doc, fotoX, fotoY, fotoWidth, fotoHeight);
      }
    } else {
      // Placeholder si no hay foto
      this.drawPhotoPlaceholder(doc, fotoX, fotoY, fotoWidth, fotoHeight);
    }

    // Información del estudiante
    const infoX = fotoX + fotoWidth + 10;
    let currentY = 45;

    doc.fillColor('#1f2937')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(`${student.nombres} ${student.apellidos}`, infoX, currentY, {
         width: 240 - infoX - 10,
         lineBreak: false,
         ellipsis: true
       });

    currentY += 15;

    // Código de estudiante
    doc.fontSize(8)
       .fillColor('#4b5563')
       .font('Helvetica')
       .text('Código:', infoX, currentY);

    doc.font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(student.codigo_estudiante, infoX + 35, currentY);

    currentY += 12;

    // DNI
    doc.font('Helvetica')
       .fillColor('#4b5563')
       .text('DNI:', infoX, currentY);

    doc.font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(student.dni, infoX + 35, currentY);

    currentY += 12;

    // Grado (si hay matrícula)
    if (enrollment && enrollment.grado_nombre) {
      doc.font('Helvetica')
         .fillColor('#4b5563')
         .text('Grado:', infoX, currentY);

      doc.font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text(enrollment.grado_nombre, infoX + 35, currentY);

      currentY += 12;

      // Sección (si hay)
      if (enrollment.seccion_nombre) {
        doc.font('Helvetica')
           .fillColor('#4b5563')
           .text('Sección:', infoX, currentY);

        doc.font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text(enrollment.seccion_nombre, infoX + 35, currentY);
      }
    }

    // Generar código de barras
    try {
      const barcodeBuffer = bwipjs.toBuffer({
        bcid: 'code128',       // Tipo de código de barras
        text: student.codigo_estudiante || student.dni, // Texto a codificar
        scale: 2,              // Escala
        height: 8,             // Altura en milímetros
        includetext: true,     // Incluir texto debajo
        textxalign: 'center',  // Alineación del texto
        textsize: 8            // Tamaño del texto
      });

      // Insertar código de barras en el carnet
      const barcodeY = 108;
      doc.image(barcodeBuffer, 80, barcodeY, {
        width: 80,
        height: 20,
        align: 'center'
      });
    } catch (error) {
      console.error('Error al generar código de barras:', error);
      // Continuar sin código de barras si hay error
    }

    // Año escolar en la parte inferior
    currentY = 130;
    const añoActual = new Date().getFullYear();

    doc.fontSize(7)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(`Año Escolar ${añoActual}`, 10, currentY, { align: 'center' });

    // Línea decorativa inferior
    doc.moveTo(20, 138)
       .lineTo(220, 138)
       .stroke('#e5e7eb');

    doc.fontSize(6)
       .fillColor('#9ca3af')
       .text('www.colegiosoa.edu.pe', 10, 140, { align: 'center' });

    return doc;
  }

  /**
   * Dibujar placeholder para foto
   */
  static drawPhotoPlaceholder(doc, x, y, width, height) {
    // Rectángulo gris
    doc.rect(x, y, width, height)
       .fill('#e5e7eb');

    // Icono de persona (círculo + semicírculo)
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Cabeza
    doc.circle(centerX, centerY - 8, 10)
       .fill('#9ca3af');

    // Cuerpo (semicírculo)
    doc.ellipse(centerX, centerY + 8, 15, 12, 0, Math.PI)
       .fill('#9ca3af');

    // Borde
    doc.rect(x, y, width, height)
       .stroke('#cccccc');
  }

  /**
   * Generar carnet y retornar como buffer
   */
  static async generateCarnetBuffer(student, enrollment = null) {
    return new Promise((resolve, reject) => {
      const doc = this.generateCarnet(student, enrollment);
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.end();
    });
  }
}

module.exports = CarnetService;
