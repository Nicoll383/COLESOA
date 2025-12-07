const { getPool } = require('../config/mysql');

class Seccion {
  // Crear nueva sección
  static async create(seccionData) {
    const pool = getPool();
    const {
      grado_id,
      nombre,
      capacidad = 30,
      docente_id,
      año_escolar,
      turno = 'mañana',
      aula
    } = seccionData;

    try {
      // Convertir strings vacíos a null para foreign keys
      const docenteIdValue = docente_id && docente_id !== '' ? docente_id : null;
      const aulaValue = aula && aula !== '' ? aula : null;

      const [result] = await pool.execute(
        `INSERT INTO secciones (grado_id, nombre, capacidad, docente_id, año_escolar, turno, aula)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [grado_id, nombre, capacidad, docenteIdValue, año_escolar, turno, aulaValue]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe una sección con ese nombre para este grado y año escolar');
      }
      throw error;
    }
  }

  // Obtener sección por ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT s.*,
              g.id as grado_id, g.nombre as grado_nombre, g.grado, g.nivel,
              u.id as docente_id, u.nombre as docente_nombre, u.apellido as docente_apellido,
              COUNT(DISTINCT m.id) as matriculados,
              (s.capacidad - COUNT(DISTINCT m.id)) as vacantes_disponibles
       FROM secciones s
       INNER JOIN grados g ON s.grado_id = g.id
       LEFT JOIN usuarios u ON s.docente_id = u.id
       LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = s.año_escolar AND m.estado != 'anulada'
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  }

  // Obtener todas las secciones con filtros
  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT s.*,
             g.id as grado_id, g.nombre as grado_nombre, g.grado, g.nivel,
             u.id as docente_id, u.nombre as docente_nombre, u.apellido as docente_apellido,
             COUNT(DISTINCT m.id) as matriculados,
             (s.capacidad - COUNT(DISTINCT m.id)) as vacantes_disponibles
      FROM secciones s
      INNER JOIN grados g ON s.grado_id = g.id
      LEFT JOIN usuarios u ON s.docente_id = u.id
      LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = s.año_escolar AND m.estado != 'anulada'
      WHERE 1=1
    `;
    const params = [];

    if (filters.grado_id) {
      query += ' AND s.grado_id = ?';
      params.push(filters.grado_id);
    }

    if (filters.año_escolar) {
      query += ' AND s.año_escolar = ?';
      params.push(filters.año_escolar);
    }

    if (filters.turno) {
      query += ' AND s.turno = ?';
      params.push(filters.turno);
    }

    if (filters.estado) {
      query += ' AND s.estado = ?';
      params.push(filters.estado);
    }

    if (filters.nivel) {
      query += ' AND g.nivel = ?';
      params.push(filters.nivel);
    }

    query += ' GROUP BY s.id ORDER BY g.grado, s.nombre';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar sección
  static async update(id, seccionData) {
    const pool = getPool();
    const { nombre, capacidad, docente_id, turno, aula, estado } = seccionData;

    // Convertir strings vacíos a null para foreign keys
    const docenteIdValue = docente_id && docente_id !== '' ? docente_id : null;
    const aulaValue = aula && aula !== '' ? aula : null;

    const [result] = await pool.execute(
      `UPDATE secciones
       SET nombre = COALESCE(?, nombre),
           capacidad = COALESCE(?, capacidad),
           docente_id = ?,
           turno = COALESCE(?, turno),
           aula = ?,
           estado = COALESCE(?, estado)
       WHERE id = ?`,
      [nombre, capacidad, docenteIdValue, turno, aulaValue, estado, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Sección no encontrada');
    }

    return await this.findById(id);
  }

  // Eliminar sección
  static async delete(id) {
    const pool = getPool();

    // Verificar si hay matrículas
    const [matriculas] = await pool.execute(
      'SELECT COUNT(*) as count FROM matriculas WHERE seccion_id = ? AND estado != "anulada"',
      [id]
    );

    if (matriculas[0].count > 0) {
      throw new Error('No se puede eliminar la sección porque tiene matrículas activas');
    }

    const [result] = await pool.execute('DELETE FROM secciones WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Sección no encontrada');
    }

    return true;
  }

  // Obtener estudiantes de una sección
  static async getEstudiantes(seccion_id, año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, m.id as matricula_id, m.codigo_matricula, m.estado as matricula_estado
       FROM estudiantes e
       INNER JOIN matriculas m ON e.id = m.estudiante_id
       WHERE m.seccion_id = ? AND m.año_escolar = ? AND m.estado != 'anulada'
       ORDER BY e.apellidos, e.nombres`,
      [seccion_id, año_escolar]
    );
    return rows;
  }

  // Obtener horario de una sección
  static async getHorario(seccion_id, año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT h.*,
              c.id as curso_id, c.nombre as curso_nombre, c.color as curso_color,
              u.nombre as docente_nombre, u.apellido as docente_apellido
       FROM horarios h
       INNER JOIN seccion_cursos sc ON h.seccion_curso_id = sc.id
       INNER JOIN cursos c ON sc.curso_id = c.id
       LEFT JOIN usuarios u ON sc.docente_id = u.id
       WHERE sc.seccion_id = ? AND sc.año_escolar = ?
       ORDER BY
         FIELD(h.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'),
         h.hora_inicio`,
      [seccion_id, año_escolar]
    );
    return rows;
  }

  // Agregar horario
  static async agregarHorario(horarioData) {
    const pool = getPool();
    const { seccion_curso_id, dia_semana, hora_inicio, hora_fin, aula } = horarioData;

    // Verificar que no haya conflictos de horario
    const [conflictos] = await pool.execute(
      `SELECT h.* FROM horarios h
       INNER JOIN seccion_cursos sc ON h.seccion_curso_id = sc.id
       WHERE sc.seccion_id = (SELECT seccion_id FROM seccion_cursos WHERE id = ?)
       AND h.dia_semana = ?
       AND (
         (h.hora_inicio <= ? AND h.hora_fin > ?)
         OR (h.hora_inicio < ? AND h.hora_fin >= ?)
         OR (h.hora_inicio >= ? AND h.hora_fin <= ?)
       )`,
      [seccion_curso_id, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]
    );

    if (conflictos.length > 0) {
      throw new Error('Ya existe un horario en ese día y hora para esta sección');
    }

    const [result] = await pool.execute(
      `INSERT INTO horarios (seccion_curso_id, dia_semana, hora_inicio, hora_fin, aula)
       VALUES (?, ?, ?, ?, ?)`,
      [seccion_curso_id, dia_semana, hora_inicio, hora_fin, aula]
    );

    return {
      id: result.insertId,
      seccion_curso_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      aula
    };
  }

  // Eliminar horario
  static async eliminarHorario(horario_id) {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM horarios WHERE id = ?', [horario_id]);

    if (result.affectedRows === 0) {
      throw new Error('Horario no encontrado');
    }

    return true;
  }
}

module.exports = Seccion;
