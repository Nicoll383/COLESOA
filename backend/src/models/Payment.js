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

    // Generar código de pago único
    const codigo_pago = await this.generarCodigoPago();

    const [result] = await pool.execute(
      `INSERT INTO pagos (codigo_pago, matricula_id, concepto, monto, metodo_pago, numero_operacion, observaciones, estado, fecha_pago)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completado', NOW())`,
      [codigo_pago, matricula_id, concepto, monto, metodo_pago, numero_operacion, observaciones]
    );

    return await this.findById(result.insertId);
  }

  // Generar código de pago único
  static async generarCodigoPago() {
    const pool = getPool();
    const año = new Date().getFullYear();

    // Obtener el último código del año actual
    const [rows] = await pool.execute(
      `SELECT codigo_pago FROM pagos
       WHERE codigo_pago LIKE ?
       ORDER BY codigo_pago DESC
       LIMIT 1`,
      [`PAG-${año}-%`]
    );

    let numero = 1;
    if (rows.length > 0) {
      const ultimoCodigo = rows[0].codigo_pago;
      const partes = ultimoCodigo.split('-');
      if (partes.length === 3) {
        numero = parseInt(partes[2]) + 1;
      }
    }

    return `PAG-${año}-${String(numero).padStart(6, '0')}`;
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

  // Crear cuotas mensuales para una matrícula
  static async crearCuotasMensuales(matriculaId, añoEscolar, montoPension = 350.00) {
    const pool = getPool();
    const cuotas = [];

    // Año escolar peruano: Marzo a Diciembre (10 meses)
    const mesesEscolar = [
      { mes: 3, nombre: 'Marzo' },
      { mes: 4, nombre: 'Abril' },
      { mes: 5, nombre: 'Mayo' },
      { mes: 6, nombre: 'Junio' },
      { mes: 7, nombre: 'Julio' },
      { mes: 8, nombre: 'Agosto' },
      { mes: 9, nombre: 'Septiembre' },
      { mes: 10, nombre: 'Octubre' },
      { mes: 11, nombre: 'Noviembre' },
      { mes: 12, nombre: 'Diciembre' }
    ];

    // Generar código base para las cuotas
    const timestamp = Date.now().toString().slice(-6);

    for (let i = 0; i < mesesEscolar.length; i++) {
      const { mes, nombre } = mesesEscolar[i];
      const codigoPago = `CUOTA-${añoEscolar}-${mes.toString().padStart(2, '0')}-${timestamp}${i}`;

      // Fecha de vencimiento: día 10 de cada mes
      const fechaVencimiento = `${añoEscolar}-${mes.toString().padStart(2, '0')}-10`;

      const [result] = await pool.execute(
        `INSERT INTO pagos (
          codigo_pago, matricula_id, tipo_pago, mes, año, concepto,
          monto, fecha_vencimiento, metodo_pago, estado, created_at
        ) VALUES (?, ?, 'pensión', ?, ?, ?, ?, ?, 'efectivo', 'pendiente', NOW())`,
        [
          codigoPago,
          matriculaId,
          mes,
          añoEscolar,
          `Pensión ${nombre} ${añoEscolar}`,
          montoPension,
          fechaVencimiento
        ]
      );

      cuotas.push({
        id: result.insertId,
        codigo: codigoPago,
        mes,
        nombre_mes: nombre,
        monto: montoPension,
        fecha_vencimiento: fechaVencimiento
      });
    }

    return cuotas;
  }

  // Obtener cuotas de una matrícula
  static async getCuotasByMatricula(matriculaId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT p.*,
        CASE
          WHEN p.mes = 3 THEN 'Marzo'
          WHEN p.mes = 4 THEN 'Abril'
          WHEN p.mes = 5 THEN 'Mayo'
          WHEN p.mes = 6 THEN 'Junio'
          WHEN p.mes = 7 THEN 'Julio'
          WHEN p.mes = 8 THEN 'Agosto'
          WHEN p.mes = 9 THEN 'Septiembre'
          WHEN p.mes = 10 THEN 'Octubre'
          WHEN p.mes = 11 THEN 'Noviembre'
          WHEN p.mes = 12 THEN 'Diciembre'
        END as nombre_mes
       FROM pagos p
       WHERE p.matricula_id = ? AND p.tipo_pago = 'pensión'
       ORDER BY p.año, p.mes`,
      [matriculaId]
    );

    return rows;
  }

  // Pagar una cuota
  static async pagarCuota(id, metodoPago, numeroOperacion = null, observaciones = null) {
    const pool = getPool();

    const [result] = await pool.execute(
      `UPDATE pagos
       SET estado = 'completado',
           metodo_pago = ?,
           numero_operacion = ?,
           observaciones = COALESCE(?, observaciones),
           fecha_pago = NOW(),
           updated_at = NOW()
       WHERE id = ? AND estado = 'pendiente'`,
      [metodoPago, numeroOperacion, observaciones, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Cuota no encontrada o ya fue pagada');
    }

    return await this.findById(id);
  }

  // Marcar cuotas vencidas
  static async marcarCuotasVencidas() {
    const pool = getPool();
    const hoy = new Date().toISOString().split('T')[0];

    const [result] = await pool.execute(
      `UPDATE pagos
       SET estado = 'vencido'
       WHERE estado = 'pendiente'
       AND fecha_vencimiento < ?
       AND tipo_pago = 'pensión'`,
      [hoy]
    );

    return result.affectedRows;
  }
}

module.exports = Payment;
