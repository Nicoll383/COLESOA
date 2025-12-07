const { getPool } = require('../config/mysql');

class Curso {
  // Crear nuevo curso
  static async create(cursoData) {
    const pool = getPool();
    const {
      codigo,
      nombre,
      descripcion,
      nivel = 'primaria',
      grado_id,
      horas_semanales = 2,
      color = '#667eea'
    } = cursoData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO cursos (codigo, nombre, descripcion, nivel, grado_id, horas_semanales, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [codigo, nombre, descripcion, nivel, grado_id, horas_semanales, color]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe un curso con ese código');
      }
      throw error;
    }
  }

  // Obtener curso por ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, g.nombre as grado_nombre, g.grado, g.nivel as grado_nivel
       FROM cursos c
       LEFT JOIN grados g ON c.grado_id = g.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // Obtener todos los cursos con filtros
  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT c.*, g.nombre as grado_nombre, g.grado, g.nivel as grado_nivel
      FROM cursos c
      LEFT JOIN grados g ON c.grado_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.nivel) {
      query += ' AND c.nivel = ?';
      params.push(filters.nivel);
    }

    if (filters.grado_id) {
      query += ' AND c.grado_id = ?';
      params.push(filters.grado_id);
    }

    if (filters.estado) {
      query += ' AND c.estado = ?';
      params.push(filters.estado);
    }

    if (filters.search) {
      query += ' AND (c.nombre LIKE ? OR c.codigo LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY c.nivel, c.nombre';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar curso
  static async update(id, cursoData) {
    const pool = getPool();
    const { nombre, descripcion, nivel, grado_id, horas_semanales, color, estado } = cursoData;

    const [result] = await pool.execute(
      `UPDATE cursos
       SET nombre = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           nivel = COALESCE(?, nivel),
           grado_id = COALESCE(?, grado_id),
           horas_semanales = COALESCE(?, horas_semanales),
           color = COALESCE(?, color),
           estado = COALESCE(?, estado)
       WHERE id = ?`,
      [nombre, descripcion, nivel, grado_id, horas_semanales, color, estado, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Curso no encontrado');
    }

    return await this.findById(id);
  }

  // Eliminar curso
  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute('DELETE FROM cursos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Curso no encontrado');
    }

    return true;
  }

  // Asignar curso a sección
  static async asignarASeccion(data) {
    const pool = getPool();
    const { seccion_id, curso_id, docente_id, año_escolar } = data;

    try {
      const [result] = await pool.execute(
        `INSERT INTO seccion_cursos (seccion_id, curso_id, docente_id, año_escolar)
         VALUES (?, ?, ?, ?)`,
        [seccion_id, curso_id, docente_id, año_escolar]
      );

      return {
        id: result.insertId,
        seccion_id,
        curso_id,
        docente_id,
        año_escolar
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Este curso ya está asignado a esta sección para este año escolar');
      }
      throw error;
    }
  }

  // Obtener cursos de una sección
  static async getCursosBySeccion(seccion_id, año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT sc.id as asignacion_id, sc.seccion_id, sc.año_escolar,
              c.id as curso_id, c.codigo, c.nombre, c.descripcion, c.horas_semanales, c.color,
              u.id as docente_id, u.nombre as docente_nombre, u.apellido as docente_apellido
       FROM seccion_cursos sc
       INNER JOIN cursos c ON sc.curso_id = c.id
       LEFT JOIN usuarios u ON sc.docente_id = u.id
       WHERE sc.seccion_id = ? AND sc.año_escolar = ? AND sc.estado = 'activo'
       ORDER BY c.nombre`,
      [seccion_id, año_escolar]
    );
    return rows;
  }

  // Obtener secciones que tienen un curso
  static async getSeccionesByCurso(curso_id, año_escolar) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT sc.id as asignacion_id, sc.año_escolar,
              s.id as seccion_id, s.nombre as seccion_nombre, s.aula,
              g.id as grado_id, g.nombre as grado_nombre, g.grado,
              u.id as docente_id, u.nombre as docente_nombre, u.apellido as docente_apellido
       FROM seccion_cursos sc
       INNER JOIN secciones s ON sc.seccion_id = s.id
       INNER JOIN grados g ON s.grado_id = g.id
       LEFT JOIN usuarios u ON sc.docente_id = u.id
       WHERE sc.curso_id = ? AND sc.año_escolar = ? AND sc.estado = 'activo'
       ORDER BY g.grado, s.nombre`,
      [curso_id, año_escolar]
    );
    return rows;
  }

  // Remover curso de sección
  static async removerDeSeccion(asignacion_id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM seccion_cursos WHERE id = ?',
      [asignacion_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Asignación no encontrada');
    }

    return true;
  }

  // Actualizar docente de un curso en una sección
  static async actualizarDocente(asignacion_id, docente_id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'UPDATE seccion_cursos SET docente_id = ? WHERE id = ?',
      [docente_id, asignacion_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Asignación no encontrada');
    }

    return true;
  }
}

module.exports = Curso;
