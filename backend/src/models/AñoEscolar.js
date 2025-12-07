const { getPool } = require('../config/mysql');

class AñoEscolar {
  // Crear configuración de año escolar
  static async create(configData) {
    const pool = getPool();
    const {
      año_escolar,
      fecha_inicio_matricula,
      fecha_fin_matricula,
      costo_matricula = 500.00,
      costo_mensualidad = 350.00,
      descuento_hermanos_porcentaje = 10,
      descuento_pronto_pago_porcentaje = 5,
      niveles_activos = ['inicial', 'primaria', 'secundaria'],
      estado = 'activo',
      observaciones
    } = configData;

    try {
      const nivelesJson = JSON.stringify(niveles_activos);

      const [result] = await pool.execute(
        `INSERT INTO configuraciones_año_escolar
         (año_escolar, fecha_inicio_matricula, fecha_fin_matricula, costo_matricula,
          costo_mensualidad, descuento_hermanos_porcentaje, descuento_pronto_pago_porcentaje,
          niveles_activos, estado, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          año_escolar, fecha_inicio_matricula, fecha_fin_matricula, costo_matricula,
          costo_mensualidad, descuento_hermanos_porcentaje, descuento_pronto_pago_porcentaje,
          nivelesJson, estado, observaciones
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe una configuración para este año escolar');
      }
      throw error;
    }
  }

  // Obtener configuración por ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM configuraciones_año_escolar WHERE id = ?`,
      [id]
    );

    if (rows[0] && rows[0].niveles_activos) {
      rows[0].niveles_activos = JSON.parse(rows[0].niveles_activos);
    }

    return rows[0] || null;
  }

  // Obtener configuración por año escolar
  static async findByYear(año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM configuraciones_año_escolar WHERE año_escolar = ?`,
      [año_escolar]
    );

    if (rows[0] && rows[0].niveles_activos) {
      rows[0].niveles_activos = JSON.parse(rows[0].niveles_activos);
    }

    return rows[0] || null;
  }

  // Obtener todas las configuraciones
  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM configuraciones_año_escolar WHERE 1=1';
    const params = [];

    if (filters.estado) {
      query += ' AND estado = ?';
      params.push(filters.estado);
    }

    if (filters.año_escolar) {
      query += ' AND año_escolar = ?';
      params.push(filters.año_escolar);
    }

    query += ' ORDER BY año_escolar DESC';

    const [rows] = await pool.execute(query, params);

    // Parse JSON fields
    rows.forEach(row => {
      if (row.niveles_activos) {
        row.niveles_activos = JSON.parse(row.niveles_activos);
      }
    });

    return rows;
  }

  // Actualizar configuración
  static async update(id, configData) {
    const pool = getPool();
    const {
      fecha_inicio_matricula,
      fecha_fin_matricula,
      costo_matricula,
      costo_mensualidad,
      descuento_hermanos_porcentaje,
      descuento_pronto_pago_porcentaje,
      niveles_activos,
      estado,
      observaciones
    } = configData;

    const nivelesJson = niveles_activos ? JSON.stringify(niveles_activos) : null;

    const [result] = await pool.execute(
      `UPDATE configuraciones_año_escolar
       SET fecha_inicio_matricula = COALESCE(?, fecha_inicio_matricula),
           fecha_fin_matricula = COALESCE(?, fecha_fin_matricula),
           costo_matricula = COALESCE(?, costo_matricula),
           costo_mensualidad = COALESCE(?, costo_mensualidad),
           descuento_hermanos_porcentaje = COALESCE(?, descuento_hermanos_porcentaje),
           descuento_pronto_pago_porcentaje = COALESCE(?, descuento_pronto_pago_porcentaje),
           niveles_activos = COALESCE(?, niveles_activos),
           estado = COALESCE(?, estado),
           observaciones = COALESCE(?, observaciones)
       WHERE id = ?`,
      [
        fecha_inicio_matricula, fecha_fin_matricula, costo_matricula, costo_mensualidad,
        descuento_hermanos_porcentaje, descuento_pronto_pago_porcentaje,
        nivelesJson, estado, observaciones, id
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('Configuración no encontrada');
    }

    return await this.findById(id);
  }

  // Eliminar configuración
  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM configuraciones_año_escolar WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Configuración no encontrada');
    }

    return true;
  }

  // Obtener configuración activa
  static async getActiveConfig() {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM configuraciones_año_escolar
       WHERE estado = 'activo'
       ORDER BY año_escolar DESC
       LIMIT 1`
    );

    if (rows[0] && rows[0].niveles_activos) {
      rows[0].niveles_activos = JSON.parse(rows[0].niveles_activos);
    }

    return rows[0] || null;
  }

  // Activar/desactivar año escolar
  static async toggleEstado(id, nuevoEstado) {
    const pool = getPool();

    // Si se está activando, desactivar otros años
    if (nuevoEstado === 'activo') {
      await pool.execute(
        `UPDATE configuraciones_año_escolar SET estado = 'inactivo' WHERE estado = 'activo'`
      );
    }

    const [result] = await pool.execute(
      'UPDATE configuraciones_año_escolar SET estado = ? WHERE id = ?',
      [nuevoEstado, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Configuración no encontrada');
    }

    return await this.findById(id);
  }
}

module.exports = AñoEscolar;
