const { getPool } = require('../config/mysql');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Crear un nuevo usuario
   */
  static async create(userData) {
    const pool = getPool();
    const { email, password, nombre, apellido, rol, telefono, dni, username, estado = 'activo' } = userData;

    // Hash de la contraseña si no está hasheada
    const hashedPassword = password.startsWith('$2a$') || password.startsWith('$2b$')
      ? password
      : await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (email, password, nombre, apellido, rol, telefono, dni, username, estado, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, hashedPassword, nombre, apellido, rol, telefono || null, dni || null, username || email, estado]
    );

    // Retornar el usuario completo recién creado
    return await this.findById(result.insertId);
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
      [email]
    );
    return rows[0];
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, email, nombre, apellido, rol, telefono, dni, estado, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Listar usuarios con filtros
   */
  static async list(filters = {}) {
    const pool = getPool();
    let query = 'SELECT id, email, nombre, apellido, rol, telefono, dni, estado, created_at FROM usuarios WHERE 1=1';
    const params = [];

    if (filters.rol) {
      query += ' AND rol = ?';
      params.push(filters.rol);
    }

    if (filters.estado) {
      query += ' AND estado = ?';
      params.push(filters.estado);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Actualizar usuario
   */
  static async update(id, userData) {
    const pool = getPool();
    const fields = [];
    const params = [];

    if (userData.nombre) {
      fields.push('nombre = ?');
      params.push(userData.nombre);
    }
    if (userData.apellido) {
      fields.push('apellido = ?');
      params.push(userData.apellido);
    }
    if (userData.telefono) {
      fields.push('telefono = ?');
      params.push(userData.telefono);
    }
    if (userData.dni) {
      fields.push('dni = ?');
      params.push(userData.dni);
    }
    if (userData.estado) {
      fields.push('estado = ?');
      params.push(userData.estado);
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return result.affectedRows > 0;
  }

  /**
   * Obtener permisos de un usuario
   */
  static async getPermisos(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT permisos FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    // Si no tiene permisos definidos, retornar permisos por defecto según rol
    if (!rows[0].permisos) {
      const user = await this.findById(id);
      return this.getDefaultPermisosByRole(user.rol);
    }

    return rows[0].permisos;
  }

  /**
   * Actualizar permisos de un usuario
   */
  static async updatePermisos(id, permisos) {
    const pool = getPool();
    const [result] = await pool.execute(
      'UPDATE usuarios SET permisos = ?, ultima_modificacion_permisos = NOW() WHERE id = ?',
      [JSON.stringify(permisos), id]
    );

    return result.affectedRows > 0;
  }

  /**
   * Obtener permisos por defecto según rol
   */
  static getDefaultPermisosByRole(rol) {
    const defaultPermisos = {
      administrador: {
        estudiantes: { ver: true, crear: true, editar: true, eliminar: true },
        matriculas: { ver: true, crear: true, editar: true, eliminar: true },
        pagos: { ver: true, crear: true, editar: true, eliminar: true },
        documentos: { ver: true, aprobar: true, rechazar: true },
        reportes: { ver: true, exportar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true }
      },
      secretaria: {
        estudiantes: { ver: true, crear: true, editar: true, eliminar: false },
        matriculas: { ver: true, crear: true, editar: true, eliminar: false },
        pagos: { ver: true, crear: false, editar: false, eliminar: false },
        documentos: { ver: true, aprobar: true, rechazar: true },
        reportes: { ver: true, exportar: false },
        usuarios: { ver: true, crear: false, editar: false, eliminar: false }
      },
      finanzas: {
        estudiantes: { ver: true, crear: false, editar: false, eliminar: false },
        matriculas: { ver: true, crear: false, editar: false, eliminar: false },
        pagos: { ver: true, crear: true, editar: true, eliminar: true },
        documentos: { ver: false, aprobar: false, rechazar: false },
        reportes: { ver: true, exportar: true },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false }
      },
      docente: {
        estudiantes: { ver: true, crear: false, editar: false, eliminar: false },
        matriculas: { ver: true, crear: false, editar: false, eliminar: false },
        pagos: { ver: false, crear: false, editar: false, eliminar: false },
        documentos: { ver: false, aprobar: false, rechazar: false },
        reportes: { ver: true, exportar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false }
      },
      padre: {
        estudiantes: { ver: true, crear: false, editar: false, eliminar: false },
        matriculas: { ver: true, crear: false, editar: false, eliminar: false },
        pagos: { ver: true, crear: false, editar: false, eliminar: false },
        documentos: { ver: true, aprobar: false, rechazar: false },
        reportes: { ver: false, exportar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false }
      }
    };

    return defaultPermisos[rol] || {};
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(id, newPassword) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = User;
