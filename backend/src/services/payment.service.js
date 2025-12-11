const { getPool } = require('../config/mysql');

class PaymentService {
  /**
   * Registrar nuevo pago
   */
  static async createPayment(paymentData, userId) {
    const pool = getPool();
    const {
      matricula_id, tipo_pago, concepto, monto, metodo_pago,
      numero_operacion, observaciones, datos_tarjeta
    } = paymentData;

    // Generar código de pago
    const codigo_pago = await this.generatePaymentCode();

    // Fecha actual
    const fecha_pago = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Determinar estado según método de pago
    let estado = 'completado';
    let observacionesFinales = observaciones;

    if (metodo_pago === 'efectivo') {
      // Pagos en efectivo se aprueban automáticamente
      estado = 'completado';
      observacionesFinales = (observaciones || '') + ' [Pago en efectivo - Aprobado automáticamente]';
    } else if (metodo_pago === 'deposito' || metodo_pago === 'transferencia') {
      // Depósitos y transferencias requieren aprobación de finanzas
      estado = 'pendiente';
      observacionesFinales = (observaciones || '') + ' [Requiere validación de finanzas]';
    } else if (metodo_pago === 'tarjeta') {
      // Pagos con tarjeta se procesan y aprueban si los datos son válidos
      if (datos_tarjeta && datos_tarjeta.numero_tarjeta) {
        // TODO: Integrar con pasarela de pagos real
        // Por ahora simulamos aprobación exitosa
        estado = 'completado';
        observacionesFinales = (observaciones || '') + ` [Tarjeta **** ${datos_tarjeta.numero_tarjeta.slice(-4)}]`;
      } else {
        throw new Error('Datos de tarjeta inválidos o incompletos');
      }
    } else {
      // Yape, Plin y otros métodos se aprueban automáticamente
      estado = 'completado';
    }

    const [result] = await pool.execute(
      `INSERT INTO pagos
       (codigo_pago, matricula_id, tipo_pago, concepto, monto, fecha_pago,
        metodo_pago, numero_operacion, estado, observaciones, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_pago, matricula_id, tipo_pago, concepto, monto, fecha_pago,
       metodo_pago, numero_operacion, estado, observacionesFinales, userId]
    );

    // Si es pago de matrícula y está completado, actualizar estado
    if (tipo_pago === 'matricula' && estado === 'completado') {
      await this.checkAndUpdateEnrollmentStatus(matricula_id);
    }

    return {
      id: result.insertId,
      codigo_pago,
      estado,
      mensaje: estado === 'pendiente'
        ? 'Pago registrado. Pendiente de aprobación por finanzas.'
        : 'Pago registrado y aprobado exitosamente.'
    };
  }

  /**
   * Generar código de pago único
   */
  static async generatePaymentCode() {
    const pool = getPool();
    const year = new Date().getFullYear();
    const prefix = `PAG${year}`;

    const [rows] = await pool.execute(
      'SELECT codigo_pago FROM pagos WHERE codigo_pago LIKE ? ORDER BY codigo_pago DESC LIMIT 1',
      [`${prefix}%`]
    );

    if (rows.length === 0) {
      return `${prefix}00001`;
    }

    const lastCode = rows[0].codigo_pago;
    const lastNumber = parseInt(lastCode.substring(prefix.length));
    const newNumber = (lastNumber + 1).toString().padStart(5, '0');

    return `${prefix}${newNumber}`;
  }

  /**
   * Verificar y actualizar estado de matrícula según pagos
   */
  static async checkAndUpdateEnrollmentStatus(matriculaId) {
    const pool = getPool();

    // Obtener monto total de la matrícula
    const [matricula] = await pool.execute(
      'SELECT monto_total, descuento FROM matriculas WHERE id = ?',
      [matriculaId]
    );

    if (matricula.length === 0) return;

    const montoEsperado = matricula[0].monto_total - matricula[0].descuento;

    // Calcular total pagado
    const [pagos] = await pool.execute(
      'SELECT SUM(monto) as total_pagado FROM pagos WHERE matricula_id = ? AND estado = "completado"',
      [matriculaId]
    );

    const totalPagado = pagos[0].total_pagado || 0;

    // Actualizar estado de matrícula
    if (totalPagado >= montoEsperado) {
      await pool.execute(
        'UPDATE matriculas SET estado = "pagada" WHERE id = ?',
        [matriculaId]
      );
    }
  }

  /**
   * Obtener pagos por matrícula
   */
  static async getPaymentsByEnrollment(matriculaId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT p.*, u.nombre as creado_por_nombre, u.apellido as creado_por_apellido
       FROM pagos p
       LEFT JOIN usuarios u ON p.created_by = u.id
       WHERE p.matricula_id = ?
       ORDER BY p.fecha_pago DESC`,
      [matriculaId]
    );
    return rows;
  }

  /**
   * Listar pagos con filtros
   */
  static async listPayments(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT p.*,
             m.codigo_matricula,
             e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos,
             u.nombre as creado_por_nombre
      FROM pagos p
      INNER JOIN matriculas m ON p.matricula_id = m.id
      INNER JOIN estudiantes e ON m.estudiante_id = e.id
      LEFT JOIN usuarios u ON p.created_by = u.id
      WHERE 1=1`;

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

    if (filters.estado) {
      query += ' AND p.estado = ?';
      params.push(filters.estado);
    }

    query += ' ORDER BY p.fecha_pago DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Anular pago
   */
  static async cancelPayment(id) {
    const pool = getPool();

    // Obtener el pago
    const [pago] = await pool.execute(
      'SELECT matricula_id FROM pagos WHERE id = ?',
      [id]
    );

    if (pago.length === 0) {
      throw new Error('Pago no encontrado');
    }

    // Anular pago
    await pool.execute(
      'UPDATE pagos SET estado = "anulado" WHERE id = ?',
      [id]
    );

    // Recalcular estado de matrícula
    await this.checkAndUpdateEnrollmentStatus(pago[0].matricula_id);

    return true;
  }

  /**
   * Obtener estadísticas de pagos
   */
  static async getStatistics(filters = {}) {
    const pool = getPool();
    let whereClause = 'WHERE p.estado = "completado"';
    const params = [];

    if (filters.fecha_desde) {
      whereClause += ' AND p.fecha_pago >= ?';
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      whereClause += ' AND p.fecha_pago <= ?';
      params.push(filters.fecha_hasta);
    }

    const [total] = await pool.execute(
      `SELECT SUM(monto) as total FROM pagos p ${whereClause}`,
      params
    );

    const [porMetodo] = await pool.execute(
      `SELECT metodo_pago, SUM(monto) as total, COUNT(*) as cantidad
       FROM pagos p ${whereClause}
       GROUP BY metodo_pago`,
      params
    );

    const [porTipo] = await pool.execute(
      `SELECT tipo_pago, SUM(monto) as total, COUNT(*) as cantidad
       FROM pagos p ${whereClause}
       GROUP BY tipo_pago`,
      params
    );

    return {
      totalIngresos: total[0].total || 0,
      porMetodo,
      porTipo
    };
  }

  /**
   * Calcular deuda de una matrícula
   */
  static async calculateDebt(matriculaId) {
    const pool = getPool();

    const [matricula] = await pool.execute(
      'SELECT monto_total, descuento FROM matriculas WHERE id = ?',
      [matriculaId]
    );

    if (matricula.length === 0) {
      throw new Error('Matrícula no encontrada');
    }

    const montoEsperado = matricula[0].monto_total - matricula[0].descuento;

    const [pagos] = await pool.execute(
      'SELECT SUM(monto) as total_pagado FROM pagos WHERE matricula_id = ? AND estado = "completado"',
      [matriculaId]
    );

    const totalPagado = pagos[0].total_pagado || 0;
    const deuda = montoEsperado - totalPagado;

    return {
      montoEsperado,
      totalPagado,
      deuda: deuda > 0 ? deuda : 0,
      estadoPago: deuda <= 0 ? 'pagado' : 'pendiente'
    };
  }
}

module.exports = PaymentService;
