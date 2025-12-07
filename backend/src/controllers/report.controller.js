const { getPool } = require('../config/mysql');

class ReportController {
  // Reporte de estudiantes matriculados por grado/sección
  static async estudiantesMatriculados(req, res) {
    const pool = getPool();
    const { año_escolar } = req.query;

    if (!año_escolar) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el año escolar'
      });
    }

    try {
      const [rows] = await pool.execute(`
        SELECT
          g.id as grado_id,
          g.nombre as grado_nombre,
          g.grado,
          s.id as seccion_id,
          s.nombre as seccion_nombre,
          s.capacidad,
          COUNT(DISTINCT m.id) as total_matriculados,
          (s.capacidad - COUNT(DISTINCT m.id)) as vacantes_disponibles
        FROM grados g
        LEFT JOIN secciones s ON g.id = s.grado_id AND s.año_escolar = ?
        LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = ? AND m.estado != 'anulada'
        WHERE g.estado = 'activo'
        GROUP BY g.id, s.id
        ORDER BY g.grado, s.nombre
      `, [año_escolar, año_escolar]);

      res.json({
        success: true,
        data: rows,
        año_escolar: parseInt(año_escolar)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte'
      });
    }
  }

  // Reporte de vacantes disponibles
  static async vacantesDisponibles(req, res) {
    const pool = getPool();
    const { año_escolar } = req.query;

    if (!año_escolar) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el año escolar'
      });
    }

    try {
      const [rows] = await pool.execute(`
        SELECT
          g.nombre as grado,
          s.nombre as seccion,
          s.capacidad,
          COUNT(DISTINCT m.id) as matriculados,
          (s.capacidad - COUNT(DISTINCT m.id)) as vacantes,
          ROUND((COUNT(DISTINCT m.id) / s.capacidad) * 100, 2) as porcentaje_ocupacion
        FROM secciones s
        INNER JOIN grados g ON s.grado_id = g.id
        LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = s.año_escolar AND m.estado != 'anulada'
        WHERE s.año_escolar = ? AND s.estado = 'activo'
        GROUP BY s.id
        ORDER BY g.grado, s.nombre
      `, [año_escolar]);

      // Calcular totales
      const totales = rows.reduce((acc, row) => {
        acc.capacidad_total += row.capacidad;
        acc.matriculados_total += row.matriculados;
        acc.vacantes_total += row.vacantes;
        return acc;
      }, { capacidad_total: 0, matriculados_total: 0, vacantes_total: 0 });

      totales.porcentaje_ocupacion = totales.capacidad_total > 0
        ? ((totales.matriculados_total / totales.capacidad_total) * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: rows,
        totales,
        año_escolar: parseInt(año_escolar)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte'
      });
    }
  }

  // Reporte de pagos
  static async pagos(req, res) {
    const pool = getPool();
    const { año_escolar, tipo_pago, estado } = req.query;

    try {
      let query = `
        SELECT
          p.id,
          p.codigo_pago,
          p.tipo_pago,
          p.concepto,
          p.monto,
          p.fecha_pago,
          p.metodo_pago,
          p.estado,
          m.codigo_matricula,
          e.nombres,
          e.apellidos,
          e.dni,
          g.nombre as grado,
          s.nombre as seccion
        FROM pagos p
        INNER JOIN matriculas m ON p.matricula_id = m.id
        INNER JOIN estudiantes e ON m.estudiante_id = e.id
        INNER JOIN secciones s ON m.seccion_id = s.id
        INNER JOIN grados g ON s.grado_id = g.id
        WHERE 1=1
      `;
      const params = [];

      if (año_escolar) {
        query += ' AND m.año_escolar = ?';
        params.push(año_escolar);
      }

      if (tipo_pago) {
        query += ' AND p.tipo_pago = ?';
        params.push(tipo_pago);
      }

      if (estado) {
        query += ' AND p.estado = ?';
        params.push(estado);
      }

      query += ' ORDER BY p.fecha_pago DESC';

      const [rows] = await pool.execute(query, params);

      // Calcular estadísticas
      const stats = {
        total_pagos: rows.length,
        monto_total: rows.reduce((sum, row) => sum + parseFloat(row.monto), 0),
        por_estado: {},
        por_tipo: {},
        por_metodo: {}
      };

      rows.forEach(row => {
        // Por estado
        stats.por_estado[row.estado] = (stats.por_estado[row.estado] || 0) + 1;

        // Por tipo
        stats.por_tipo[row.tipo_pago] = (stats.por_tipo[row.tipo_pago] || 0) + 1;

        // Por método
        stats.por_metodo[row.metodo_pago] = (stats.por_metodo[row.metodo_pago] || 0) + 1;
      });

      res.json({
        success: true,
        data: rows,
        stats
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte'
      });
    }
  }

  // Reporte de pagos pendientes
  static async pagosPendientes(req, res) {
    const pool = getPool();
    const { año_escolar } = req.query;

    if (!año_escolar) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el año escolar'
      });
    }

    try {
      const [rows] = await pool.execute(`
        SELECT
          m.id as matricula_id,
          m.codigo_matricula,
          m.estado as estado_matricula,
          m.monto_total,
          e.codigo_estudiante,
          e.nombres,
          e.apellidos,
          e.dni,
          g.nombre as grado,
          s.nombre as seccion,
          COALESCE(SUM(p.monto), 0) as monto_pagado,
          (m.monto_total - COALESCE(SUM(p.monto), 0)) as saldo_pendiente
        FROM matriculas m
        INNER JOIN estudiantes e ON m.estudiante_id = e.id
        INNER JOIN secciones s ON m.seccion_id = s.id
        INNER JOIN grados g ON s.grado_id = g.id
        LEFT JOIN pagos p ON m.id = p.matricula_id AND p.estado = 'completado'
        WHERE m.año_escolar = ? AND m.estado != 'anulada'
        GROUP BY m.id
        HAVING saldo_pendiente > 0
        ORDER BY saldo_pendiente DESC
      `, [año_escolar]);

      const totales = {
        total_estudiantes: rows.length,
        monto_total_pendiente: rows.reduce((sum, row) => sum + parseFloat(row.saldo_pendiente), 0)
      };

      res.json({
        success: true,
        data: rows,
        totales,
        año_escolar: parseInt(año_escolar)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte'
      });
    }
  }

  // Estadísticas comparativas
  static async estadisticasComparativas(req, res) {
    const pool = getPool();

    try {
      // Obtener últimos 3 años
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1, currentYear - 2];

      const data = [];

      for (const year of years) {
        // Matrículas por año
        const [matriculas] = await pool.execute(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) as pagadas,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
          FROM matriculas
          WHERE año_escolar = ? AND estado != 'anulada'
        `, [year]);

        // Ingresos por año
        const [ingresos] = await pool.execute(`
          SELECT
            COALESCE(SUM(monto), 0) as total_ingresos
          FROM pagos p
          INNER JOIN matriculas m ON p.matricula_id = m.id
          WHERE m.año_escolar = ? AND p.estado = 'completado'
        `, [year]);

        // Estudiantes por grado
        const [porGrado] = await pool.execute(`
          SELECT
            g.nombre as grado,
            COUNT(DISTINCT m.id) as total
          FROM matriculas m
          INNER JOIN secciones s ON m.seccion_id = s.id
          INNER JOIN grados g ON s.grado_id = g.id
          WHERE m.año_escolar = ? AND m.estado != 'anulada'
          GROUP BY g.id
          ORDER BY g.grado
        `, [year]);

        data.push({
          año: year,
          matriculas: matriculas[0],
          ingresos: parseFloat(ingresos[0].total_ingresos),
          por_grado: porGrado
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar estadísticas'
      });
    }
  }

  // Dashboard general
  static async dashboard(req, res) {
    const pool = getPool();
    const { año_escolar } = req.query;

    if (!año_escolar) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el año escolar'
      });
    }

    try {
      // Total estudiantes
      const [estudiantes] = await pool.execute(`
        SELECT COUNT(DISTINCT estudiante_id) as total
        FROM matriculas
        WHERE año_escolar = ? AND estado != 'anulada'
      `, [año_escolar]);

      // Total matrículas por estado
      const [matriculas] = await pool.execute(`
        SELECT
          estado,
          COUNT(*) as total
        FROM matriculas
        WHERE año_escolar = ? AND estado != 'anulada'
        GROUP BY estado
      `, [año_escolar]);

      // Vacantes
      const [vacantes] = await pool.execute(`
        SELECT
          SUM(s.capacidad) as capacidad_total,
          COUNT(DISTINCT m.id) as matriculados_total
        FROM secciones s
        LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = s.año_escolar AND m.estado != 'anulada'
        WHERE s.año_escolar = ? AND s.estado = 'activo'
      `, [año_escolar]);

      // Pagos del año
      const [pagos] = await pool.execute(`
        SELECT
          COUNT(*) as total_transacciones,
          COALESCE(SUM(CASE WHEN estado = 'completado' THEN monto ELSE 0 END), 0) as ingresos,
          COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) as pendientes
        FROM pagos p
        INNER JOIN matriculas m ON p.matricula_id = m.id
        WHERE m.año_escolar = ?
      `, [año_escolar]);

      const vacantesData = vacantes[0];
      const vacantesDisponibles = vacantesData.capacidad_total - vacantesData.matriculados_total;

      res.json({
        success: true,
        data: {
          estudiantes: estudiantes[0].total,
          matriculas: matriculas,
          vacantes: {
            total: vacantesData.capacidad_total,
            ocupadas: vacantesData.matriculados_total,
            disponibles: vacantesDisponibles,
            porcentaje_ocupacion: vacantesData.capacidad_total > 0
              ? ((vacantesData.matriculados_total / vacantesData.capacidad_total) * 100).toFixed(2)
              : 0
          },
          pagos: {
            total_transacciones: pagos[0].total_transacciones,
            ingresos: parseFloat(pagos[0].ingresos),
            pendientes: parseFloat(pagos[0].pendientes)
          }
        },
        año_escolar: parseInt(año_escolar)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos del dashboard'
      });
    }
  }

  // Reporte de estudiantes matriculados por curso
  static async estudiantesPorCurso(req, res) {
    const pool = getPool();
    const { año_escolar } = req.query;

    if (!año_escolar) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el año escolar'
      });
    }

    try {
      const [rows] = await pool.execute(`
        SELECT
          c.id as curso_id,
          c.codigo as curso_codigo,
          c.nombre as curso_nombre,
          c.nivel,
          g.nombre as grado_nombre,
          s.nombre as seccion_nombre,
          COUNT(DISTINCT e.id) as total_estudiantes,
          GROUP_CONCAT(DISTINCT CONCAT(e.nombres, ' ', e.apellidos) SEPARATOR ', ') as estudiantes
        FROM cursos c
        LEFT JOIN seccion_cursos sc ON c.id = sc.curso_id AND sc.año_escolar = ?
        LEFT JOIN secciones s ON sc.seccion_id = s.id
        LEFT JOIN grados g ON s.grado_id = g.id
        LEFT JOIN matriculas m ON s.id = m.seccion_id AND m.año_escolar = ? AND m.estado != 'anulada'
        LEFT JOIN estudiantes e ON m.estudiante_id = e.id
        WHERE c.estado = 'activo'
        GROUP BY c.id, s.id
        HAVING total_estudiantes > 0
        ORDER BY c.nivel, c.nombre, g.grado, s.nombre
      `, [año_escolar, año_escolar]);

      res.json({
        success: true,
        data: rows,
        año_escolar: parseInt(año_escolar)
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de estudiantes por curso'
      });
    }
  }
}

module.exports = ReportController;
