const db = require('../config/mysql');

class PadreController {
  // Obtener todos los hijos del padre autenticado
  static async getHijos(req, res) {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id; // ID del usuario padre autenticado

      // Obtener estudiantes donde el usuario es apoderado
      const [hijos] = await connection.execute(
        `SELECT
          e.id,
          e.codigo_estudiante,
          e.nombres,
          e.apellidos,
          e.dni,
          e.fecha_nacimiento,
          e.genero,
          e.foto_url,
          m.id as matricula_id,
          m.año_escolar,
          m.estado as estado_matricula,
          m.fecha_matricula,
          g.nombre as grado_nombre,
          g.grado,
          s.nombre as seccion_nombre,
          a.tipo_apoderado
        FROM estudiantes e
        INNER JOIN apoderados a ON e.id = a.estudiante_id
        LEFT JOIN matriculas m ON e.id = m.estudiante_id
          AND m.año_escolar = YEAR(NOW())
        LEFT JOIN secciones sec ON m.seccion_id = sec.id
        LEFT JOIN grados g ON sec.grado_id = g.id
        LEFT JOIN secciones s ON m.seccion_id = s.id
        WHERE a.usuario_id = ?
        ORDER BY e.apellidos, e.nombres`,
        [userId]
      );

      // Para cada hijo, obtener estadísticas de cuotas y documentos
      for (let hijo of hijos) {
        if (hijo.matricula_id) {
          // Estadísticas de cuotas
          const [cuotasStats] = await connection.execute(
            `SELECT
              COUNT(*) as total_cuotas,
              SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as cuotas_pendientes,
              SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as cuotas_vencidas,
              SUM(CASE WHEN estado = 'pendiente' OR estado = 'vencido' THEN monto ELSE 0 END) as monto_pendiente,
              SUM(CASE WHEN estado = 'completado' THEN monto ELSE 0 END) as monto_pagado
            FROM pagos
            WHERE matricula_id = ?`,
            [hijo.matricula_id]
          );

          // Estadísticas de documentos
          const [docsStats] = await connection.execute(
            `SELECT
              COUNT(*) as total_documentos,
              SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as documentos_pendientes,
              SUM(CASE WHEN estado = 'aceptado' THEN 1 ELSE 0 END) as documentos_aprobados,
              SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as documentos_rechazados
            FROM documentos_estudiante
            WHERE estudiante_id = ?`,
            [hijo.id]
          );

          hijo.cuotas_pendientes = cuotasStats[0]?.cuotas_pendientes || 0;
          hijo.cuotas_vencidas = cuotasStats[0]?.cuotas_vencidas || 0;
          hijo.monto_pendiente = parseFloat(cuotasStats[0]?.monto_pendiente || 0);
          hijo.monto_pagado = parseFloat(cuotasStats[0]?.monto_pagado || 0);
          hijo.total_cuotas = cuotasStats[0]?.total_cuotas || 0;

          hijo.documentos_totales = docsStats[0]?.total_documentos || 0;
          hijo.documentos_pendientes = docsStats[0]?.documentos_pendientes || 0;
          hijo.documentos_aprobados = docsStats[0]?.documentos_aprobados || 0;
          hijo.documentos_rechazados = docsStats[0]?.documentos_rechazados || 0;
        }
      }

      res.json({
        success: true,
        data: hijos
      });
    } catch (error) {
      console.error('Error al obtener hijos del padre:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información de los estudiantes',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Obtener cuotas de un hijo específico
  static async getCuotasHijo(req, res) {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;
      const { estudianteId } = req.params;

      // Verificar que el estudiante sea hijo del padre autenticado
      const [verificacion] = await connection.execute(
        `SELECT e.id, e.nombres, e.apellidos, m.id as matricula_id
         FROM estudiantes e
         INNER JOIN apoderados a ON e.id = a.estudiante_id
         LEFT JOIN matriculas m ON e.id = m.estudiante_id
           AND m.año_escolar = YEAR(NOW())
         WHERE a.usuario_id = ? AND e.id = ?`,
        [userId, estudianteId]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver las cuotas de este estudiante'
        });
      }

      const estudiante = verificacion[0];

      if (!estudiante.matricula_id) {
        return res.json({
          success: true,
          data: {
            estudiante: {
              id: estudiante.id,
              nombres: estudiante.nombres,
              apellidos: estudiante.apellidos
            },
            cuotas: [],
            mensaje: 'El estudiante no tiene matrícula activa para este año escolar'
          }
        });
      }

      // Obtener todas las cuotas del estudiante
      const [cuotas] = await connection.execute(
        `SELECT
          p.id,
          p.codigo_pago,
          p.tipo_pago,
          p.concepto,
          p.monto,
          p.mes,
          p.año,
          p.fecha_vencimiento,
          p.fecha_pago,
          p.metodo_pago,
          p.numero_operacion,
          p.estado,
          p.observaciones,
          p.created_at
        FROM pagos p
        WHERE p.matricula_id = ?
        ORDER BY p.año ASC, p.mes ASC`,
        [estudiante.matricula_id]
      );

      // Calcular resumen
      const resumen = {
        total_cuotas: cuotas.length,
        pendientes: cuotas.filter(c => c.estado === 'pendiente').length,
        vencidas: cuotas.filter(c => c.estado === 'vencido').length,
        pagadas: cuotas.filter(c => c.estado === 'completado').length,
        monto_total: cuotas.reduce((sum, c) => sum + parseFloat(c.monto), 0),
        monto_pendiente: cuotas
          .filter(c => c.estado === 'pendiente' || c.estado === 'vencido')
          .reduce((sum, c) => sum + parseFloat(c.monto), 0),
        monto_pagado: cuotas
          .filter(c => c.estado === 'completado')
          .reduce((sum, c) => sum + parseFloat(c.monto), 0)
      };

      res.json({
        success: true,
        data: {
          estudiante: {
            id: estudiante.id,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos
          },
          cuotas: cuotas,
          resumen: resumen
        }
      });
    } catch (error) {
      console.error('Error al obtener cuotas del hijo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las cuotas',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Registrar pago de una cuota (pendiente de confirmación por finanzas)
  static async registrarPagoCuota(req, res) {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;
      const { cuotaId } = req.params;
      const { metodo_pago, numero_operacion, observaciones } = req.body;

      // Validaciones
      if (!metodo_pago) {
        return res.status(400).json({
          success: false,
          message: 'El método de pago es obligatorio'
        });
      }

      const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'deposito', 'yape', 'plin'];
      if (!metodosValidos.includes(metodo_pago)) {
        return res.status(400).json({
          success: false,
          message: 'Método de pago inválido'
        });
      }

      // Verificar que la cuota pertenece a un hijo del padre
      const [verificacion] = await connection.execute(
        `SELECT p.id, p.estado, p.monto, e.nombres, e.apellidos
         FROM pagos p
         INNER JOIN matriculas m ON p.matricula_id = m.id
         INNER JOIN estudiantes e ON m.estudiante_id = e.id
         INNER JOIN apoderados a ON e.id = a.estudiante_id
         WHERE p.id = ? AND a.usuario_id = ?`,
        [cuotaId, userId]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para pagar esta cuota'
        });
      }

      const cuota = verificacion[0];

      if (cuota.estado === 'completado') {
        return res.status(400).json({
          success: false,
          message: 'Esta cuota ya ha sido pagada'
        });
      }

      // Actualizar la cuota
      await connection.execute(
        `UPDATE pagos
         SET estado = 'completado',
             metodo_pago = ?,
             numero_operacion = ?,
             observaciones = ?,
             fecha_pago = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [metodo_pago, numero_operacion || null, observaciones || null, cuotaId]
      );

      // Obtener la cuota actualizada
      const [cuotaActualizada] = await connection.execute(
        'SELECT * FROM pagos WHERE id = ?',
        [cuotaId]
      );

      res.json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: cuotaActualizada[0]
      });
    } catch (error) {
      console.error('Error al registrar pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el pago',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // ========== GESTIÓN DE DOCUMENTOS ==========

  // Obtener documentos de un hijo
  static async getDocumentosHijo(req, res) {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;
      const { estudianteId } = req.params;

      // Verificar que el estudiante sea hijo del padre
      const [verificacion] = await connection.execute(
        `SELECT e.id, e.nombres, e.apellidos
         FROM estudiantes e
         INNER JOIN apoderados a ON e.id = a.estudiante_id
         WHERE a.usuario_id = ? AND e.id = ?`,
        [userId, estudianteId]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver los documentos de este estudiante'
        });
      }

      // Obtener documentos del estudiante
      const [documentos] = await connection.execute(
        `SELECT
          de.id,
          de.tipo_documento,
          de.nombre_archivo,
          de.ruta_archivo as archivo_url,
          de.fecha_subida,
          de.fecha_verificacion as fecha_revision,
          de.observaciones,
          de.estado_verificacion as estado
         FROM documentos_estudiante de
         WHERE de.estudiante_id = ?
         ORDER BY de.created_at DESC`,
        [estudianteId]
      );

      res.json({
        success: true,
        data: {
          estudiante: verificacion[0],
          documentos: documentos
        }
      });
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener documentos',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Subir documento
  static async subirDocumento(req, res) {
    const connection = await db.getConnection();

    try {
      const userId = req.user.id;
      const { estudianteId, documentoId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      // Verificar que el estudiante sea hijo del padre
      const [verificacion] = await connection.execute(
        `SELECT e.id
         FROM estudiantes e
         INNER JOIN apoderados a ON e.id = a.estudiante_id
         WHERE a.usuario_id = ? AND e.id = ?`,
        [userId, estudianteId]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para subir documentos de este estudiante'
        });
      }

      // Subir el documento
      const archivo_url = `/uploads/documentos/${file.filename}`;
      const nombre_archivo = file.originalname;

      await connection.execute(
        `UPDATE documentos_estudiante
         SET archivo_url = ?,
             nombre_archivo = ?,
             estado = 'enviado',
             fecha_subida = NOW()
         WHERE id = ?`,
        [archivo_url, nombre_archivo, documentoId]
      );

      res.json({
        success: true,
        message: 'Documento subido exitosamente. Pendiente de validación por secretaría',
        data: {
          id: documentoId,
          archivo_url,
          nombre_archivo,
          estado: 'enviado'
        }
      });
    } catch (error) {
      console.error('Error al subir documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir el documento',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = PadreController;
