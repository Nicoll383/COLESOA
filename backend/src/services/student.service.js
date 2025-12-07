const { getPool } = require('../config/mysql');

class StudentService {
  /**
   * Listar estudiantes con filtros y paginación
   */
  static async listStudents(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM estudiantes WHERE 1=1';
    const params = [];

    if (filters.estado) {
      query += ' AND estado = ?';
      params.push(filters.estado);
    }

    if (filters.search) {
      query += ' AND (nombres LIKE ? OR apellidos LIKE ? OR dni LIKE ? OR codigo_estudiante LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Obtener estudiante por ID
   */
  static async getStudentById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Crear nuevo estudiante
   */
  static async createStudent(studentData) {
    const pool = getPool();
    const {
      codigo_estudiante, nombres, apellidos, fecha_nacimiento,
      dni, genero, direccion, distrito, provincia, departamento,
      telefono, email
    } = studentData;

    const [result] = await pool.execute(
      `INSERT INTO estudiantes
       (codigo_estudiante, nombres, apellidos, fecha_nacimiento, dni, genero,
        direccion, distrito, provincia, departamento, telefono, email, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [codigo_estudiante, nombres, apellidos, fecha_nacimiento, dni, genero,
       direccion, distrito, provincia, departamento, telefono, email]
    );

    return result.insertId;
  }

  /**
   * Actualizar estudiante
   */
  static async updateStudent(id, studentData) {
    const pool = getPool();
    const fields = [];
    const params = [];

    const allowedFields = ['nombres', 'apellidos', 'direccion', 'distrito', 'provincia',
                          'departamento', 'telefono', 'email', 'estado'];

    for (const field of allowedFields) {
      if (studentData[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(studentData[field]);
      }
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE estudiantes SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return result.affectedRows > 0;
  }

  /**
   * Generar código de estudiante único
   */
  static async generateStudentCode(year) {
    const pool = getPool();
    const prefix = `EST${year}`;

    const [rows] = await pool.execute(
      'SELECT codigo_estudiante FROM estudiantes WHERE codigo_estudiante LIKE ? ORDER BY codigo_estudiante DESC LIMIT 1',
      [`${prefix}%`]
    );

    if (rows.length === 0) {
      return `${prefix}001`;
    }

    const lastCode = rows[0].codigo_estudiante;
    const lastNumber = parseInt(lastCode.substring(prefix.length));
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `${prefix}${newNumber}`;
  }

  /**
   * Buscar estudiantes por apoderado
   */
  static async getStudentsByParent(parentUserId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.* FROM estudiantes e
       INNER JOIN apoderados a ON e.id = a.estudiante_id
       WHERE a.usuario_id = ? AND e.estado = 'activo'`,
      [parentUserId]
    );
    return rows;
  }

  /**
   * Obtener estadísticas de estudiantes
   */
  static async getStatistics() {
    const pool = getPool();

    const [totalActivos] = await pool.execute(
      'SELECT COUNT(*) as count FROM estudiantes WHERE estado = "activo"'
    );

    const [porGenero] = await pool.execute(
      'SELECT genero, COUNT(*) as count FROM estudiantes WHERE estado = "activo" GROUP BY genero'
    );

    const [porDistrito] = await pool.execute(
      'SELECT distrito, COUNT(*) as count FROM estudiantes WHERE estado = "activo" GROUP BY distrito ORDER BY count DESC LIMIT 10'
    );

    return {
      totalActivos: totalActivos[0].count,
      porGenero,
      porDistrito
    };
  }
}

module.exports = StudentService;
