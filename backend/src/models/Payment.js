const { getPool } = require('../config/mysql');

class Payment {
  // Crear nuevo pago
  static async create(paymentData) {
    const pool = getPool();
    const {
      matricula_id,
      concepto,
      monto,
      metodo_pago = 'efectivo',
      numero_operacion,
      observaciones
    } = paymentData;

    const [result] = await pool.execute(
      `INSERT INTO pagos (matricula_id, concepto, monto, metodo_pago, numero_operacion, observaciones, estado, fecha_pago)
       VALUES (?, ?, ?, ?, ?, ?, 'completado', NOW())`,
      [matricula_id, concepto, monto, metodo_pago, numero_operacion, observaciones]
    );

    return await this.findById(result.insertId);
  }

  // Obtener pago por ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT p.*, m.codigo_matricula, m.año_escolar,
              e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos, e.dni as estudiante_dni
       FROM pagos p
       INNER JOIN matriculas m ON p.matricula_id = m.id
       INNER JOIN estudiantes e ON m.estudiante_id = e.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Listar pagos con filtros
  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT p.*, m.codigo_matricula, m.año_escolar,
             e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos, e.dni as estudiante_dni
      FROM pagos p
      INNER JOIN matriculas m ON p.matricula_id = m.id
      INNER JOIN estudiantes e ON m.estudiante_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.matricula_id) {
      query += ' AND p.matricula_id = ?';
      params.push(filters.matricula_id);
    }

    if (filters.estado) {
      query += ' AND p.estado = ?';
      params.push(filters.estado);
    }

    if (filters.año_escolar) {
      query += ' AND m.año_escolar = ?';
      params.push(filters.año_escolar);
    }

    if (filters.estudiante_dni) {
      query += ' AND e.dni = ?';
      params.push(filters.estudiante_dni);
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar estado del pago
  static async updateEstado(id, estado, observaciones = null) {
    const pool = getPool();

    const [result] = await pool.execute(
      `UPDATE pagos
       SET estado = ?,
           observaciones = COALESCE(?, observaciones)
       WHERE id = ?`,
      [estado, observaciones, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Pago no encontrado');
    }

    return await this.findById(id);
  }

  // Obtener pagos pendientes de una matrícula
  static async getPagosPendientes(matriculaId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT * FROM pagos
       WHERE matricula_id = ? AND estado = 'pendiente'
       ORDER BY created_at DESC`,
      [matriculaId]
    );

    return rows;
  }

  // Obtener total pagado de una matrícula
  static async getTotalPagado(matriculaId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(monto), 0) as total
       FROM pagos
       WHERE matricula_id = ? AND estado = 'completado'`,
      [matriculaId]
    );

    return parseFloat(rows[0].total);
  }
}

module.exports = Payment;
