const { getPool } = require('../config/mysql');

class EnrollmentService {
  /**
   * Crear nueva matrícula
   */
  static async createEnrollment(enrollmentData, userId) {
    const pool = getPool();
    const {
      estudiante_id, seccion_id, año_escolar, tipo_matricula,
      monto_total, descuento, observaciones
    } = enrollmentData;

    // Verificar que el estudiante no tenga matrícula activa para este año
    const [existing] = await pool.execute(
      'SELECT id FROM matriculas WHERE estudiante_id = ? AND año_escolar = ? AND estado != "anulada"',
      [estudiante_id, año_escolar]
    );

    if (existing.length > 0) {
      throw new Error('El estudiante ya tiene una matrícula para este año escolar');
    }

    // Generar código de matrícula
    const codigo_matricula = await this.generateEnrollmentCode(año_escolar);

    // Calcular fecha de matrícula
    const fecha_matricula = new Date().toISOString().split('T')[0];

    const [result] = await pool.execute(
      `INSERT INTO matriculas
       (codigo_matricula, estudiante_id, seccion_id, año_escolar, fecha_matricula,
        tipo_matricula, estado, monto_total, descuento, observaciones, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?)`,
      [codigo_matricula, estudiante_id, seccion_id, año_escolar, fecha_matricula,
       tipo_matricula, monto_total, descuento || 0, observaciones, userId]
    );

    return {
      id: result.insertId,
      codigo_matricula
    };
  }

  /**
   * Generar código de matrícula único
   */
  static async generateEnrollmentCode(year) {
    const pool = getPool();
    const prefix = `MAT${year}`;

    const [rows] = await pool.execute(
      'SELECT codigo_matricula FROM matriculas WHERE codigo_matricula LIKE ? ORDER BY codigo_matricula DESC LIMIT 1',
      [`${prefix}%`]
    );

    if (rows.length === 0) {
      return `${prefix}001`;
    }

    const lastCode = rows[0].codigo_matricula;
    const lastNumber = parseInt(lastCode.substring(prefix.length));
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `${prefix}${newNumber}`;
  }

  /**
   * Obtener matrícula por ID con datos relacionados
   */
  static async getEnrollmentById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT m.*,
              e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos,
              e.codigo_estudiante, e.dni as estudiante_dni,
              s.nombre as seccion_nombre, s.aula,
              g.nombre as grado_nombre,
              u.nombre as creado_por_nombre, u.apellido as creado_por_apellido
       FROM matriculas m
       INNER JOIN estudiantes e ON m.estudiante_id = e.id
       INNER JOIN secciones s ON m.seccion_id = s.id
       INNER JOIN grados g ON s.grado_id = g.id
       LEFT JOIN usuarios u ON m.created_by = u.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Listar matrículas con filtros
   */
  static async listEnrollments(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT m.*,
             e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos,
             e.codigo_estudiante,
             s.nombre as seccion_nombre, g.nombre as grado_nombre
      FROM matriculas m
      INNER JOIN estudiantes e ON m.estudiante_id = e.id
      INNER JOIN secciones s ON m.seccion_id = s.id
      INNER JOIN grados g ON s.grado_id = g.id
      WHERE 1=1`;

    const params = [];

    if (filters.año_escolar) {
      query += ' AND m.año_escolar = ?';
      params.push(filters.año_escolar);
    }

    if (filters.estado) {
      query += ' AND m.estado = ?';
      params.push(filters.estado);
    }

    if (filters.seccion_id) {
      query += ' AND m.seccion_id = ?';
      params.push(filters.seccion_id);
    }

    query += ' ORDER BY m.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Actualizar estado de matrícula
   */
  static async updateEnrollmentStatus(id, estado) {
    const pool = getPool();
    const validStates = ['pendiente', 'pagada', 'cancelada', 'anulada'];

    if (!validStates.includes(estado)) {
      throw new Error('Estado inválido');
    }

    const [result] = await pool.execute(
      'UPDATE matriculas SET estado = ? WHERE id = ?',
      [estado, id]
    );

    return result.affectedRows > 0;
  }

  /**
   * Obtener estadísticas de matrículas
   */
  static async getStatistics(year) {
    const pool = getPool();

    const [total] = await pool.execute(
      'SELECT COUNT(*) as count FROM matriculas WHERE año_escolar = ?',
      [year]
    );

    const [porEstado] = await pool.execute(
      'SELECT estado, COUNT(*) as count FROM matriculas WHERE año_escolar = ? GROUP BY estado',
      [year]
    );

    const [porTipo] = await pool.execute(
      'SELECT tipo_matricula, COUNT(*) as count FROM matriculas WHERE año_escolar = ? GROUP BY tipo_matricula',
      [year]
    );

    const [ingresos] = await pool.execute(
      'SELECT SUM(monto_total - descuento) as total FROM matriculas WHERE año_escolar = ? AND estado = "pagada"',
      [year]
    );

    return {
      total: total[0].count,
      porEstado,
      porTipo,
      ingresosTotal: ingresos[0].total || 0
    };
  }

  /**
   * Verificar disponibilidad en sección
   */
  static async checkSectionAvailability(seccionId, añoEscolar) {
    const pool = getPool();

    const [seccion] = await pool.execute(
      'SELECT capacidad FROM secciones WHERE id = ?',
      [seccionId]
    );

    if (seccion.length === 0) {
      throw new Error('Sección no encontrada');
    }

    const [matriculas] = await pool.execute(
      'SELECT COUNT(*) as count FROM matriculas WHERE seccion_id = ? AND año_escolar = ? AND estado != "anulada"',
      [seccionId, añoEscolar]
    );

    const capacity = seccion[0].capacidad;
    const enrolled = matriculas[0].count;

    return {
      capacity,
      enrolled,
      available: capacity - enrolled,
      hasSpace: enrolled < capacity
    };
  }
}

module.exports = EnrollmentService;
