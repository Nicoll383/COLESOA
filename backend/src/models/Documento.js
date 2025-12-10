const { getPool } = require('../config/mysql');

class Documento {
  // Obtener todos los documentos requeridos
  static async getDocumentosRequeridos() {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM documentos_requeridos
       WHERE estado = 'activo'
       ORDER BY orden ASC`
    );
    return rows;
  }

  // Obtener documentos de un estudiante
  static async getDocumentosEstudiante(estudianteId, matriculaId = null) {
    const pool = getPool();

    let query = `
      SELECT
        de.id,
        de.estudiante_id,
        de.documento_requerido_id,
        de.matricula_id,
        de.archivo_url,
        de.nombre_archivo,
        de.estado,
        de.observaciones,
        de.fecha_subida,
        de.fecha_revision,
        dr.nombre as documento_nombre,
        dr.descripcion as documento_descripcion,
        dr.obligatorio,
        dr.tipo_archivo,
        u.nombre as revisado_por_nombre,
        u.apellido as revisado_por_apellido
      FROM documentos_estudiante de
      INNER JOIN documentos_requeridos dr ON de.documento_requerido_id = dr.id
      LEFT JOIN usuarios u ON de.revisado_por = u.id
      WHERE de.estudiante_id = ?
    `;

    const params = [estudianteId];

    if (matriculaId) {
      query += ' AND de.matricula_id = ?';
      params.push(matriculaId);
    }

    query += ' ORDER BY dr.orden ASC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Inicializar documentos para un estudiante (cuando se crea la matrícula)
  static async inicializarDocumentos(estudianteId, matriculaId) {
    const pool = getPool();

    // Obtener documentos requeridos
    const documentosRequeridos = await this.getDocumentosRequeridos();

    // Crear registros de documentos pendientes
    for (const doc of documentosRequeridos) {
      await pool.execute(
        `INSERT INTO documentos_estudiante
         (estudiante_id, documento_requerido_id, matricula_id, estado)
         VALUES (?, ?, ?, 'pendiente')`,
        [estudianteId, doc.id, matriculaId]
      );
    }

    return true;
  }

  // Subir un documento
  static async subirDocumento(data) {
    const pool = getPool();
    const {
      documentoEstudianteId,
      archivoUrl,
      nombreArchivo
    } = data;

    const [result] = await pool.execute(
      `UPDATE documentos_estudiante
       SET archivo_url = ?,
           nombre_archivo = ?,
           estado = 'enviado',
           fecha_subida = NOW()
       WHERE id = ?`,
      [archivoUrl, nombreArchivo, documentoEstudianteId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Documento no encontrado');
    }

    // Crear registro en seguimiento
    await this.crearSeguimiento(documentoEstudianteId, 'pendiente', 'enviado', null, 'Documento subido por el padre/apoderado');

    return await this.getDocumentoById(documentoEstudianteId);
  }

  // Cambiar estado del documento
  static async cambiarEstado(documentoEstudianteId, nuevoEstado, usuarioId, observaciones = null) {
    const pool = getPool();

    // Obtener estado actual
    const [current] = await pool.execute(
      'SELECT estado FROM documentos_estudiante WHERE id = ?',
      [documentoEstudianteId]
    );

    if (current.length === 0) {
      throw new Error('Documento no encontrado');
    }

    const estadoAnterior = current[0].estado;

    // Actualizar documento
    const [result] = await pool.execute(
      `UPDATE documentos_estudiante
       SET estado = ?,
           observaciones = ?,
           revisado_por = ?,
           fecha_revision = NOW()
       WHERE id = ?`,
      [nuevoEstado, observaciones, usuarioId, documentoEstudianteId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el documento');
    }

    // Crear registro en seguimiento
    await this.crearSeguimiento(documentoEstudianteId, estadoAnterior, nuevoEstado, usuarioId, observaciones);

    return await this.getDocumentoById(documentoEstudianteId);
  }

  // Crear registro de seguimiento
  static async crearSeguimiento(documentoEstudianteId, estadoAnterior, estadoNuevo, usuarioId = null, comentario = null) {
    const pool = getPool();

    await pool.execute(
      `INSERT INTO seguimiento_documentos
       (documento_estudiante_id, estado_anterior, estado_nuevo, usuario_id, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [documentoEstudianteId, estadoAnterior, estadoNuevo, usuarioId, comentario]
    );

    return true;
  }

  // Obtener seguimiento de un documento
  static async getSeguimiento(documentoEstudianteId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        s.*,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido
       FROM seguimiento_documentos s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.documento_estudiante_id = ?
       ORDER BY s.created_at DESC`,
      [documentoEstudianteId]
    );

    return rows;
  }

  // Obtener documento por ID
  static async getDocumentoById(id) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        de.*,
        dr.nombre as documento_nombre,
        dr.descripcion as documento_descripcion,
        dr.obligatorio,
        dr.tipo_archivo,
        e.nombres as estudiante_nombres,
        e.apellidos as estudiante_apellidos,
        u.nombre as revisado_por_nombre,
        u.apellido as revisado_por_apellido
       FROM documentos_estudiante de
       INNER JOIN documentos_requeridos dr ON de.documento_requerido_id = dr.id
       INNER JOIN estudiantes e ON de.estudiante_id = e.id
       LEFT JOIN usuarios u ON de.revisado_por = u.id
       WHERE de.id = ?`,
      [id]
    );

    return rows[0] || null;
  }

  // Obtener resumen de documentos por matrícula
  static async getResumenPorMatricula(matriculaId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
        SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
        SUM(CASE WHEN estado = 'aceptado' THEN 1 ELSE 0 END) as aceptados,
        SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazados
       FROM documentos_estudiante
       WHERE matricula_id = ?`,
      [matriculaId]
    );

    return rows[0];
  }

  // Obtener todos los documentos pendientes de revisión (para secretaria)
  static async getDocumentosPendientesRevision() {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        de.id,
        de.estado,
        de.fecha_subida,
        de.fecha_revision,
        de.archivo_url,
        de.nombre_archivo,
        de.observaciones,
        dr.nombre as nombre_documento,
        dr.descripcion as descripcion_documento,
        e.id as estudiante_id,
        CONCAT(e.nombres, ' ', e.apellidos) as estudiante_nombre,
        e.dni as estudiante_dni,
        m.id as matricula_id,
        m.codigo_matricula as matricula_codigo,
        m.año_escolar
       FROM documentos_estudiante de
       INNER JOIN documentos_requeridos dr ON de.documento_requerido_id = dr.id
       INNER JOIN estudiantes e ON de.estudiante_id = e.id
       LEFT JOIN matriculas m ON de.matricula_id = m.id
       WHERE de.estado IN ('enviado', 'en_revision', 'aceptado', 'rechazado')
       ORDER BY
         CASE de.estado
           WHEN 'enviado' THEN 1
           WHEN 'en_revision' THEN 2
           WHEN 'rechazado' THEN 3
           WHEN 'aceptado' THEN 4
         END,
         de.fecha_subida ASC`
    );

    return rows;
  }

  // Obtener estadísticas de documentos de un estudiante
  static async getEstadisticasDocumentos(estudianteId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN obligatorio = 1 THEN 1 ELSE 0 END) as total_obligatorios,
        SUM(CASE WHEN de.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN de.estado = 'pendiente' AND dr.obligatorio = 1 THEN 1 ELSE 0 END) as pendientes_obligatorios,
        SUM(CASE WHEN de.estado = 'enviado' OR de.estado = 'en_revision' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN de.estado = 'aceptado' THEN 1 ELSE 0 END) as aceptados,
        SUM(CASE WHEN de.estado = 'rechazado' THEN 1 ELSE 0 END) as rechazados
       FROM documentos_estudiante de
       INNER JOIN documentos_requeridos dr ON de.documento_requerido_id = dr.id
       WHERE de.estudiante_id = ?`,
      [estudianteId]
    );

    return rows[0] || {
      total: 0,
      total_obligatorios: 0,
      pendientes: 0,
      pendientes_obligatorios: 0,
      en_proceso: 0,
      aceptados: 0,
      rechazados: 0
    };
  }

  // Obtener documentos de un estudiante (alias para compatibilidad)
  static async getByEstudiante(estudianteId) {
    return this.getDocumentosEstudiante(estudianteId);
  }

  // Encontrar un documento por ID
  static async findById(documentoId) {
    const pool = getPool();

    const [rows] = await pool.execute(
      `SELECT
        de.*,
        dr.nombre,
        dr.descripcion,
        dr.obligatorio,
        dr.tipo_archivo
       FROM documentos_estudiante de
       INNER JOIN documentos_requeridos dr ON de.documento_requerido_id = dr.id
       WHERE de.id = ?`,
      [documentoId]
    );

    return rows[0] || null;
  }

  // Subir archivo de documento
  static async uploadFile(documentoId, file, userId) {
    const pool = getPool();

    // Aquí deberías implementar la lógica para guardar el archivo físicamente
    // Por ahora, simulamos que el archivo se guarda en /uploads/documentos/
    const archivo_url = `/uploads/documentos/${file.filename}`;
    const nombre_archivo = file.originalname;

    const [result] = await pool.execute(
      `UPDATE documentos_estudiante
       SET archivo_url = ?,
           nombre_archivo = ?,
           estado = 'enviado',
           fecha_subida = NOW()
       WHERE id = ?`,
      [archivo_url, nombre_archivo, documentoId]
    );

    // Registrar en seguimiento
    await pool.execute(
      `INSERT INTO seguimiento_documentos
       (documento_estudiante_id, estado_anterior, estado_nuevo, observaciones, usuario_id)
       VALUES (?, 'pendiente', 'enviado', 'Documento subido por el padre', ?)`,
      [documentoId, userId]
    );

    return {
      id: documentoId,
      archivo_url,
      nombre_archivo,
      estado: 'enviado',
      fecha_subida: new Date()
    };
  }

  // Validar/Rechazar documento (para secretaria)
  static async validarDocumento(documentoId, estado, observaciones, userId) {
    const pool = getPool();

    if (!['aceptado', 'rechazado'].includes(estado)) {
      throw new Error('Estado inválido. Debe ser "aceptado" o "rechazado"');
    }

    // Obtener estado anterior
    const documento = await this.findById(documentoId);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    const estadoAnterior = documento.estado;

    // Actualizar documento
    const [result] = await pool.execute(
      `UPDATE documentos_estudiante
       SET estado = ?,
           fecha_revision = NOW(),
           revisado_por = ?,
           observaciones = ?
       WHERE id = ?`,
      [estado, userId, observaciones, documentoId]
    );

    // Registrar en seguimiento
    await pool.execute(
      `INSERT INTO seguimiento_documentos
       (documento_estudiante_id, estado_anterior, estado_nuevo, observaciones, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [documentoId, estadoAnterior, estado, observaciones, userId]
    );

    return {
      id: documentoId,
      estado,
      fecha_revision: new Date(),
      observaciones
    };
  }
}

module.exports = Documento;
