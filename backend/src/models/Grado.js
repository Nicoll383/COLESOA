const { getPool } = require('../config/mysql');

class Grado {
  // Crear nuevo grado
  static async create(gradoData) {
    const pool = getPool();
    const { nivel, grado, nombre, descripcion } = gradoData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO grados (nivel, grado, nombre, descripcion)
         VALUES (?, ?, ?, ?)`,
        [nivel, grado, nombre, descripcion]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe un grado con ese nivel y número');
      }
      throw error;
    }
  }

  // Obtener grado por ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM grados WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Obtener todos los grados con filtros
  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM grados WHERE 1=1';
    const params = [];

    if (filters.nivel) {
      query += ' AND nivel = ?';
      params.push(filters.nivel);
    }

    if (filters.estado) {
      query += ' AND estado = ?';
      params.push(filters.estado);
    }

    query += ' ORDER BY nivel, grado';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar grado
  static async update(id, gradoData) {
    const pool = getPool();
    const { nombre, descripcion, estado } = gradoData;

    const [result] = await pool.execute(
      `UPDATE grados
       SET nombre = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           estado = COALESCE(?, estado)
       WHERE id = ?`,
      [nombre, descripcion, estado, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Grado no encontrado');
    }

    return await this.findById(id);
  }

  // Obtener secciones de un grado para un año escolar
  static async getSecciones(grado_id, año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT s.*,
              u.nombre as docente_nombre, u.apellido as docente_apellido,
              COUNT(DISTINCT m.id) as matriculados,
              (s.capacidad - COUNT(DISTINCT m.id)) as vacantes_disponibles
       FROM secciones s
       LEFT JOIN usuarios u ON s.docente_id = u.id
       LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = s.año_escolar AND m.estado != 'anulada'
       WHERE s.grado_id = ? AND s.año_escolar = ?
       GROUP BY s.id
       ORDER BY s.nombre`,
      [grado_id, año_escolar]
    );
    return rows;
  }
}

module.exports = Grado;
