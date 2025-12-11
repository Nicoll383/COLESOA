const db = require('../config/mysql');
const Student = require('./Student');

class Enrollment {
  // Crear nueva matrícula con validaciones
  static async create(enrollmentData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const { estudiante_id, seccion_id, año_escolar, tipo_matricula, observaciones, created_by } = enrollmentData;

      // 0. Verificar si ya existe una matrícula pendiente para este estudiante en este año
      const [matriculasExistentes] = await connection.execute(
        `SELECT m.*, s.nombre as seccion_nombre, g.nombre as grado_nombre
         FROM matriculas m
         INNER JOIN secciones s ON m.seccion_id = s.id
         INNER JOIN grados g ON s.grado_id = g.id
         WHERE m.estudiante_id = ? AND m.año_escolar = ? AND m.estado = 'pendiente'`,
        [estudiante_id, año_escolar]
      );

      if (matriculasExistentes.length > 0) {
        await connection.commit();
        return {
          matriculaId: matriculasExistentes[0].id,
          codigoMatricula: matriculasExistentes[0].codigo_matricula,
          mensaje: 'Ya existe una matrícula pendiente para este estudiante. Continúe con el pago.'
        };
      }

      // 1. Verificar que el estudiante existe
      const student = await Student.findById(estudiante_id);
      if (!student) {
        throw new Error('Estudiante no encontrado');
      }

      // 2. Obtener información de la sección y grado
      const [secciones] = await connection.execute(
        `SELECT s.*, g.grado, g.nombre as grado_nombre, s.capacidad
         FROM secciones s
         INNER JOIN grados g ON s.grado_id = g.id
         WHERE s.id = ? AND s.año_escolar = ? AND s.estado = 'activo'`,
        [seccion_id, año_escolar]
      );

      if (secciones.length === 0) {
        throw new Error('Sección no encontrada o no disponible para este año escolar');
      }

      const seccion = secciones[0];

      // 3. Validar que el estudiante puede matricularse en ese grado
      if (student.historial_academico && student.historial_academico.length > 0) {
        const validacion = await Student.validarGradoMatricula(estudiante_id, seccion.grado_id);
        if (!validacion.valido) {
          throw new Error(validacion.mensaje);
        }
      }

      // 4. Verificar vacantes disponibles
      const [matriculasCount] = await connection.execute(
        `SELECT COUNT(*) as total FROM matriculas
         WHERE seccion_id = ? AND año_escolar = ? AND estado != 'anulada'`,
        [seccion_id, año_escolar]
      );

      const vacantesOcupadas = matriculasCount[0].total;
      if (vacantesOcupadas >= seccion.capacidad) {
        throw new Error(`No hay vacantes disponibles en ${seccion.grado_nombre} - Sección ${seccion.nombre}`);
      }

      // 5. Verificar que no esté ya matriculado en este año escolar
      const [existing] = await connection.execute(
        `SELECT id FROM matriculas
         WHERE estudiante_id = ? AND año_escolar = ? AND estado != 'anulada'`,
        [estudiante_id, año_escolar]
      );

      if (existing.length > 0) {
        throw new Error('El estudiante ya está matriculado en este año escolar');
      }

      // 6. Verificar documentos obligatorios completos
      // NOTA: La validación de documentos se ha deshabilitado porque ahora los documentos
      // se suben DESPUÉS de crear la matrícula (paso 4 del flujo de matrícula)
      // Los documentos se inicializan automáticamente al confirmar la matrícula
      /*
      const docsValidation = await Student.verificarDocumentosCompletos(estudiante_id);
      if (!docsValidation.completo) {
        throw new Error(`Faltan ${docsValidation.documentos_faltantes.length} documentos obligatorios`);
      }
      */

      // 7. Obtener monto de matrícula desde configuración
      const [config] = await connection.execute(
        "SELECT valor FROM configuracion WHERE clave = 'monto_matricula_primaria'"
      );

      const monto_total = config.length > 0 ? parseFloat(config[0].valor) : 500.00;

      // 8. Generar código de matrícula
      const codigo_matricula = await this.generarCodigoMatricula(connection, año_escolar);

      // 9. Insertar matrícula
      const [result] = await connection.execute(
        `INSERT INTO matriculas (
          codigo_matricula, estudiante_id, seccion_id, año_escolar,
          fecha_matricula, tipo_matricula, estado, monto_total,
          descuento, observaciones, created_by
        ) VALUES (?, ?, ?, ?, CURDATE(), ?, 'pendiente', ?, 0, ?, ?)`,
        [
          codigo_matricula,
          estudiante_id,
          seccion_id,
          año_escolar,
          tipo_matricula,
          monto_total,
          observaciones || null,
          created_by || null
        ]
      );

      const matriculaId = result.insertId;

      // 10. Registrar en historial académico
      await connection.execute(
        `INSERT INTO historial_academico (
          estudiante_id, año_escolar, grado_id, seccion_id,
          estado, observaciones
        ) VALUES (?, ?, ?, ?, 'aprobado', ?)`,
        [
          estudiante_id,
          año_escolar,
          seccion.grado_id,
          seccion_id,
          tipo_matricula === 'traslado' ? `Traslado de ${enrollmentData.colegio_procedencia || 'otro colegio'}` : null
        ]
      );

      await connection.commit();

      return {
        id: matriculaId,
        codigo_matricula,
        monto_total,
        vacantes_restantes: seccion.capacidad - vacantesOcupadas - 1
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Generar código único de matrícula
  static async generarCodigoMatricula(connection, año) {
    const [last] = await connection.execute(
      'SELECT codigo_matricula FROM matriculas WHERE codigo_matricula LIKE ? ORDER BY id DESC LIMIT 1',
      [`MAT${año}%`]
    );

    let nextNumber = 1;
    if (last.length > 0) {
      const lastCode = last[0].codigo_matricula;
      const lastNumber = parseInt(lastCode.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `MAT${año}${String(nextNumber).padStart(4, '0')}`;
  }

  // Obtener matrícula por ID con toda la información
  static async findById(id) {
    const connection = await db.getConnection();

    try {
      const [matriculas] = await connection.execute(
        `SELECT
          m.*,
          e.codigo_estudiante, e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos,
          e.dni as estudiante_dni, e.foto_url,
          g.nombre as grado_nombre, g.grado,
          s.nombre as seccion_nombre, s.turno, s.aula,
          u.nombre as creado_por_nombre, u.apellido as creado_por_apellido
         FROM matriculas m
         INNER JOIN estudiantes e ON m.estudiante_id = e.id
         INNER JOIN secciones s ON m.seccion_id = s.id
         INNER JOIN grados g ON s.grado_id = g.id
         LEFT JOIN usuarios u ON m.created_by = u.id
         WHERE m.id = ?`,
        [id]
      );

      if (matriculas.length === 0) {
        return null;
      }

      const matricula = matriculas[0];

      // Obtener apoderados del estudiante
      const [apoderados] = await connection.execute(
        'SELECT * FROM apoderados WHERE estudiante_id = ?',
        [matricula.estudiante_id]
      );

      // Obtener pagos de la matrícula
      const [pagos] = await connection.execute(
        'SELECT * FROM pagos WHERE matricula_id = ? ORDER BY fecha_pago DESC',
        [id]
      );

      return {
        ...matricula,
        apoderados,
        pagos
      };

    } finally {
      connection.release();
    }
  }

  // Listar matrículas con filtros
  static async findAll(filters = {}) {
    const connection = await db.getConnection();

    try {
      let query = `
        SELECT
          m.*,
          e.codigo_estudiante, e.nombres as estudiante_nombres, e.apellidos as estudiante_apellidos,
          e.dni as estudiante_dni,
          g.nombre as grado_nombre, g.grado,
          s.nombre as seccion_nombre
        FROM matriculas m
        INNER JOIN estudiantes e ON m.estudiante_id = e.id
        INNER JOIN secciones s ON m.seccion_id = s.id
        INNER JOIN grados g ON s.grado_id = g.id
      `;

      const conditions = [];
      const params = [];

      if (filters.año_escolar) {
        conditions.push('m.año_escolar = ?');
        params.push(filters.año_escolar);
      }

      if (filters.estado) {
        conditions.push('m.estado = ?');
        params.push(filters.estado);
      }

      if (filters.grado_id) {
        conditions.push('s.grado_id = ?');
        params.push(filters.grado_id);
      }

      if (filters.seccion_id) {
        conditions.push('m.seccion_id = ?');
        params.push(filters.seccion_id);
      }

      if (filters.codigo_matricula) {
        conditions.push('m.codigo_matricula LIKE ?');
        params.push(`%${filters.codigo_matricula}%`);
      }

      if (filters.estudiante_dni) {
        conditions.push('e.dni LIKE ?');
        params.push(`%${filters.estudiante_dni}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY m.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [matriculas] = await connection.execute(query, params);
      return matriculas;

    } finally {
      connection.release();
    }
  }

  // Actualizar estado de matrícula
  static async updateEstado(id, nuevoEstado, observaciones = null) {
    const connection = await db.getConnection();

    try {
      await connection.execute(
        'UPDATE matriculas SET estado = ?, observaciones = ? WHERE id = ?',
        [nuevoEstado, observaciones, id]
      );

      return true;
    } finally {
      connection.release();
    }
  }

  // Obtener vacantes disponibles por sección
  static async getVacantesDisponibles(seccionId, añoEscolar) {
    const connection = await db.getConnection();

    try {
      const [seccion] = await connection.execute(
        'SELECT capacidad FROM secciones WHERE id = ? AND año_escolar = ?',
        [seccionId, añoEscolar]
      );

      if (seccion.length === 0) {
        return { disponibles: 0, capacidad: 0, ocupadas: 0 };
      }

      const capacidad = seccion[0].capacidad;

      const [ocupadas] = await connection.execute(
        `SELECT COUNT(*) as total FROM matriculas
         WHERE seccion_id = ? AND año_escolar = ? AND estado != 'anulada'`,
        [seccionId, añoEscolar]
      );

      const totalOcupadas = ocupadas[0].total;
      const disponibles = capacidad - totalOcupadas;

      return {
        disponibles: disponibles > 0 ? disponibles : 0,
        capacidad,
        ocupadas: totalOcupadas
      };

    } finally {
      connection.release();
    }
  }

  // Obtener todas las secciones con vacantes para un año escolar
  static async getSeccionesConVacantes(añoEscolar) {
    const connection = await db.getConnection();

    try {
      const [secciones] = await connection.execute(
        `SELECT
          s.id, s.nombre as seccion_nombre, s.capacidad, s.turno, s.aula,
          g.id as grado_id, g.nombre as grado_nombre, g.grado,
          COUNT(m.id) as matriculados
         FROM secciones s
         INNER JOIN grados g ON s.grado_id = g.id
         LEFT JOIN matriculas m ON s.id = m.seccion_id
           AND m.año_escolar = ?
           AND m.estado != 'anulada'
         WHERE s.año_escolar = ? AND s.estado = 'activo'
         GROUP BY s.id, s.nombre, s.capacidad, s.turno, s.aula, g.id, g.nombre, g.grado
         ORDER BY g.grado, s.nombre`,
        [añoEscolar, añoEscolar]
      );

      return secciones.map(s => ({
        ...s,
        vacantes_disponibles: s.capacidad - s.matriculados,
        tiene_vacantes: (s.capacidad - s.matriculados) > 0
      }));

    } finally {
      connection.release();
    }
  }

  // Anular matrícula
  static async anular(id, motivo, userId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE matriculas SET estado = "anulada", observaciones = CONCAT(COALESCE(observaciones, ""), "\nAnulada: ", ?) WHERE id = ?',
        [motivo, id]
      );

      // Registrar en historial académico
      const [matricula] = await connection.execute(
        'SELECT estudiante_id, año_escolar FROM matriculas WHERE id = ?',
        [id]
      );

      if (matricula.length > 0) {
        await connection.execute(
          'UPDATE historial_academico SET estado = "retirado" WHERE estudiante_id = ? AND año_escolar = ?',
          [matricula[0].estudiante_id, matricula[0].año_escolar]
        );
      }

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Enrollment;
