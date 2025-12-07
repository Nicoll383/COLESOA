const { getPool } = require('../config/mysql');
const { mongoose } = require('../config/mongodb');

// Schema de MongoDB para reportes generados
const ReportSchema = new mongoose.Schema({
  title: String,
  type: String, // 'enrollment', 'payment', 'student', 'financial'
  format: String, // 'pdf', 'excel', 'csv'
  filters: mongoose.Schema.Types.Mixed,
  filePath: String,
  generatedBy: Number,
  generatedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  status: { type: String, default: 'completed' } // 'pending', 'processing', 'completed', 'failed'
});

const ReportModel = mongoose.model('Report', ReportSchema);

class ReportService {
  /**
   * Generar reporte de matrículas
   */
  static async generateEnrollmentReport(filters = {}) {
    const pool = getPool();

    let query = `
      SELECT m.codigo_matricula, m.fecha_matricula, m.tipo_matricula, m.estado,
             m.monto_total, m.descuento,
             e.codigo_estudiante, e.nombres as estudiante_nombres,
             e.apellidos as estudiante_apellidos, e.dni,
             g.nombre as grado, s.nombre as seccion, s.aula,
             u.nombre as registrado_por_nombre, u.apellido as registrado_por_apellido
      FROM matriculas m
      INNER JOIN estudiantes e ON m.estudiante_id = e.id
      INNER JOIN secciones s ON m.seccion_id = s.id
      INNER JOIN grados g ON s.grado_id = g.id
      LEFT JOIN usuarios u ON m.created_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.año_escolar) {
      query += ' AND m.año_escolar = ?';
      params.push(filters.año_escolar);
    }

    if (filters.estado) {
      query += ' AND m.estado = ?';
      params.push(filters.estado);
    }

    if (filters.grado_id) {
      query += ' AND g.id = ?';
      params.push(filters.grado_id);
    }

    if (filters.fecha_desde) {
      query += ' AND m.fecha_matricula >= ?';
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query += ' AND m.fecha_matricula <= ?';
      params.push(filters.fecha_hasta);
    }

    query += ' ORDER BY m.fecha_matricula DESC';

    const [data] = await pool.execute(query, params);

    // Guardar registro del reporte en MongoDB
    const report = new ReportModel({
      title: `Reporte de Matrículas ${filters.año_escolar || ''}`,
      type: 'enrollment',
      format: filters.format || 'excel',
      filters: filters,
      generatedBy: filters.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    });

    await report.save();

    return {
      reportId: report._id,
      data,
      summary: {
        total: data.length,
        porEstado: this.groupBy(data, 'estado'),
        montoTotal: data.reduce((sum, m) => sum + (m.monto_total - m.descuento), 0)
      }
    };
  }

  /**
   * Generar reporte de pagos
   */
  static async generatePaymentReport(filters = {}) {
    const pool = getPool();

    let query = `
      SELECT p.codigo_pago, p.fecha_pago, p.tipo_pago, p.concepto,
             p.monto, p.metodo_pago, p.numero_operacion, p.estado,
             m.codigo_matricula, m.año_escolar,
             e.codigo_estudiante, e.nombres as estudiante_nombres,
             e.apellidos as estudiante_apellidos,
             u.nombre as registrado_por_nombre
      FROM pagos p
      INNER JOIN matriculas m ON p.matricula_id = m.id
      INNER JOIN estudiantes e ON m.estudiante_id = e.id
      LEFT JOIN usuarios u ON p.created_by = u.id
      WHERE p.estado = 'completado'
    `;

    const params = [];

    if (filters.fecha_desde) {
      query += ' AND p.fecha_pago >= ?';
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      query += ' AND p.fecha_pago <= ?';
      params.push(filters.fecha_hasta);
    }

    if (filters.metodo_pago) {
      query += ' AND p.metodo_pago = ?';
      params.push(filters.metodo_pago);
    }

    if (filters.tipo_pago) {
      query += ' AND p.tipo_pago = ?';
      params.push(filters.tipo_pago);
    }

    query += ' ORDER BY p.fecha_pago DESC';

    const [data] = await pool.execute(query, params);

    const report = new ReportModel({
      title: 'Reporte de Pagos',
      type: 'payment',
      format: filters.format || 'excel',
      filters: filters,
      generatedBy: filters.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await report.save();

    return {
      reportId: report._id,
      data,
      summary: {
        total: data.length,
        montoTotal: data.reduce((sum, p) => sum + p.monto, 0),
        porMetodo: this.groupBySum(data, 'metodo_pago', 'monto'),
        porTipo: this.groupBySum(data, 'tipo_pago', 'monto')
      }
    };
  }

  /**
   * Generar reporte de estudiantes
   */
  static async generateStudentReport(filters = {}) {
    const pool = getPool();

    let query = `
      SELECT e.codigo_estudiante, e.nombres, e.apellidos, e.dni,
             e.fecha_nacimiento, e.genero, e.distrito, e.provincia,
             e.telefono, e.email, e.estado,
             m.codigo_matricula, m.año_escolar,
             g.nombre as grado, s.nombre as seccion
      FROM estudiantes e
      LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.año_escolar = ?
      LEFT JOIN secciones s ON m.seccion_id = s.id
      LEFT JOIN grados g ON s.grado_id = g.id
      WHERE 1=1
    `;

    const params = [filters.año_escolar || new Date().getFullYear()];

    if (filters.estado) {
      query += ' AND e.estado = ?';
      params.push(filters.estado);
    }

    if (filters.genero) {
      query += ' AND e.genero = ?';
      params.push(filters.genero);
    }

    if (filters.distrito) {
      query += ' AND e.distrito = ?';
      params.push(filters.distrito);
    }

    query += ' ORDER BY e.apellidos, e.nombres';

    const [data] = await pool.execute(query, params);

    const report = new ReportModel({
      title: 'Reporte de Estudiantes',
      type: 'student',
      format: filters.format || 'excel',
      filters: filters,
      generatedBy: filters.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await report.save();

    return {
      reportId: report._id,
      data,
      summary: {
        total: data.length,
        porGenero: this.groupBy(data, 'genero'),
        porDistrito: this.groupBy(data, 'distrito'),
        porEstado: this.groupBy(data, 'estado')
      }
    };
  }

  /**
   * Generar reporte financiero consolidado
   */
  static async generateFinancialReport(year) {
    const pool = getPool();

    // Resumen de matrículas
    const [matriculas] = await pool.execute(
      `SELECT COUNT(*) as total, SUM(monto_total - descuento) as monto_esperado,
              estado, COUNT(*) as cantidad
       FROM matriculas
       WHERE año_escolar = ?
       GROUP BY estado`,
      [year]
    );

    // Resumen de pagos
    const [pagos] = await pool.execute(
      `SELECT SUM(p.monto) as total_recaudado, p.tipo_pago, COUNT(*) as cantidad
       FROM pagos p
       INNER JOIN matriculas m ON p.matricula_id = m.id
       WHERE m.año_escolar = ? AND p.estado = 'completado'
       GROUP BY p.tipo_pago`,
      [year]
    );

    // Deudores
    const [deudores] = await pool.execute(
      `SELECT COUNT(DISTINCT m.id) as total_deudores
       FROM matriculas m
       LEFT JOIN (
         SELECT matricula_id, SUM(monto) as total_pagado
         FROM pagos
         WHERE estado = 'completado'
         GROUP BY matricula_id
       ) p ON m.id = p.matricula_id
       WHERE m.año_escolar = ?
       AND (p.total_pagado IS NULL OR p.total_pagado < (m.monto_total - m.descuento))`,
      [year]
    );

    const report = new ReportModel({
      title: `Reporte Financiero ${year}`,
      type: 'financial',
      format: 'pdf',
      filters: { year },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    });

    await report.save();

    return {
      reportId: report._id,
      year,
      matriculas,
      pagos,
      deudores: deudores[0].total_deudores,
      generatedAt: new Date()
    };
  }

  /**
   * Obtener historial de reportes
   */
  static async getReportHistory(filters = {}) {
    const query = {};

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.userId) {
      query.generatedBy = filters.userId;
    }

    return await ReportModel.find(query)
      .sort({ generatedAt: -1 })
      .limit(filters.limit || 50);
  }

  /**
   * Utilidad: Agrupar por campo
   */
  static groupBy(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Sin especificar';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Utilidad: Agrupar y sumar
   */
  static groupBySum(array, groupField, sumField) {
    return array.reduce((acc, item) => {
      const key = item[groupField] || 'Sin especificar';
      if (!acc[key]) {
        acc[key] = { count: 0, total: 0 };
      }
      acc[key].count++;
      acc[key].total += item[sumField];
      return acc;
    }, {});
  }
}

module.exports = ReportService;
