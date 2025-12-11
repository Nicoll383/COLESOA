const db = require('../config/mysql');

class Student {
  // Crear un nuevo estudiante completo
  static async create(studentData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Verificar duplicado de DNI
      const [existing] = await connection.execute(
        'SELECT id FROM estudiantes WHERE dni = ?',
        [studentData.dni]
      );

      if (existing.length > 0) {
        throw new Error('Ya existe un estudiante con ese DNI');
      }

      // 2. Generar código de estudiante automático
      const año = new Date().getFullYear();
      const [lastStudent] = await connection.execute(
        'SELECT codigo_estudiante FROM estudiantes WHERE codigo_estudiante LIKE ? ORDER BY id DESC LIMIT 1',
        [`EST${año}%`]
      );

      let nextNumber = 1;
      if (lastStudent.length > 0) {
        const lastCode = lastStudent[0].codigo_estudiante;
        const lastNumber = parseInt(lastCode.slice(-3));
        nextNumber = lastNumber + 1;
      }

      const codigo_estudiante = `EST${año}${String(nextNumber).padStart(3, '0')}`;

      // 3. Insertar estudiante
      const [result] = await connection.execute(
        `INSERT INTO estudiantes (
          codigo_estudiante, nombres, apellidos, fecha_nacimiento, dni, genero,
          direccion, distrito, provincia, departamento, telefono, email, foto_url, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo_estudiante,
          studentData.nombres,
          studentData.apellidos,
          studentData.fecha_nacimiento,
          studentData.dni,
          studentData.genero,
          studentData.direccion || null,
          studentData.distrito || null,
          studentData.provincia || null,
          studentData.departamento || null,
          studentData.telefono || null,
          studentData.email || null,
          studentData.foto_url || null,
          studentData.estado || 'activo'
        ]
      );

      const studentId = result.insertId;

      // 4. Insertar información médica si existe
      if (studentData.informacion_medica) {
        const medica = studentData.informacion_medica;
        await connection.execute(
          `INSERT INTO informacion_medica (
            estudiante_id, tipo_sangre, esta_vacunado, vacunas_completas,
            tiene_alergias, alergias, condiciones_medicas, medicamentos_regulares,
            seguro_medico, numero_seguro, contacto_emergencia_nombre,
            contacto_emergencia_telefono, contacto_emergencia_relacion, observaciones_medicas
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            studentId,
            medica.tipo_sangre || null,
            medica.esta_vacunado || false,
            medica.vacunas_completas || null,
            medica.tiene_alergias || false,
            medica.alergias || null,
            medica.condiciones_medicas || null,
            medica.medicamentos_regulares || null,
            medica.seguro_medico || null,
            medica.numero_seguro || null,
            medica.contacto_emergencia_nombre,
            medica.contacto_emergencia_telefono,
            medica.contacto_emergencia_relacion || null,
            medica.observaciones_medicas || null
          ]
        );
      }

      // 5. Insertar apoderados si existen
      if (studentData.apoderados && studentData.apoderados.length > 0) {
        for (const apoderado of studentData.apoderados) {
          await connection.execute(
            `INSERT INTO apoderados (
              estudiante_id, usuario_id, tipo_apoderado, nombres, apellidos,
              dni, telefono, email, direccion, ocupacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              studentId,
              apoderado.usuario_id || null,
              apoderado.tipo_apoderado,
              apoderado.nombres,
              apoderado.apellidos,
              apoderado.dni,
              apoderado.telefono || null,
              apoderado.email || null,
              apoderado.direccion || null,
              apoderado.ocupacion || null
            ]
          );
        }
      }

      await connection.commit();
      return { id: studentId, codigo_estudiante };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener estudiante completo por ID
  static async findById(id) {
    const connection = await db.getConnection();

    try {
      // Datos del estudiante
      const [students] = await connection.execute(
        'SELECT * FROM estudiantes WHERE id = ?',
        [id]
      );

      if (students.length === 0) {
        return null;
      }

      const student = students[0];

      // Información médica
      const [medica] = await connection.execute(
        'SELECT * FROM informacion_medica WHERE estudiante_id = ?',
        [id]
      );

      // Apoderados
      const [apoderados] = await connection.execute(
        'SELECT * FROM apoderados WHERE estudiante_id = ?',
        [id]
      );

      // Historial académico
      const [historial] = await connection.execute(
        `SELECT ha.*, g.nombre as grado_nombre, s.nombre as seccion_nombre
         FROM historial_academico ha
         LEFT JOIN grados g ON ha.grado_id = g.id
         LEFT JOIN secciones s ON ha.seccion_id = s.id
         WHERE ha.estudiante_id = ?
         ORDER BY ha.año_escolar DESC`,
        [id]
      );

      // Documentos
      const [documentos] = await connection.execute(
        `SELECT d.*, u.nombre as subido_por_nombre, v.nombre as verificado_por_nombre
         FROM documentos_estudiante d
         LEFT JOIN usuarios u ON d.subido_por = u.id
         LEFT JOIN usuarios v ON d.verificado_por = v.id
         WHERE d.estudiante_id = ?
         ORDER BY d.created_at DESC`,
        [id]
      );

      return {
        ...student,
        informacion_medica: medica[0] || null,
        apoderados: apoderados,
        historial_academico: historial,
        documentos: documentos
      };
    } finally {
      connection.release();
    }
  }

  // Listar todos los estudiantes con filtros
  static async findAll(filters = {}) {
    const connection = await db.getConnection();

    try {
      let query = `
        SELECT
          e.*,
          COUNT(DISTINCT a.id) as num_apoderados,
          COUNT(DISTINCT d.id) as num_documentos
        FROM estudiantes e
        LEFT JOIN apoderados a ON e.id = a.estudiante_id
        LEFT JOIN documentos_estudiante d ON e.id = d.estudiante_id
      `;

      const conditions = [];
      const params = [];

      if (filters.dni) {
        conditions.push('e.dni LIKE ?');
        params.push(`%${filters.dni}%`);
      }

      if (filters.nombres) {
        conditions.push('e.nombres LIKE ?');
        params.push(`%${filters.nombres}%`);
      }

      if (filters.apellidos) {
        conditions.push('e.apellidos LIKE ?');
        params.push(`%${filters.apellidos}%`);
      }

      if (filters.estado) {
        conditions.push('e.estado = ?');
        params.push(filters.estado);
      }

      if (filters.genero) {
        conditions.push('e.genero = ?');
        params.push(filters.genero);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY e.id ORDER BY e.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [students] = await connection.execute(query, params);
      return students;
    } finally {
      connection.release();
    }
  }

  // Actualizar estudiante
  static async update(id, studentData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Actualizar datos básicos
      const fields = [];
      const values = [];

      if (studentData.nombres) {
        fields.push('nombres = ?');
        values.push(studentData.nombres);
      }
      if (studentData.apellidos) {
        fields.push('apellidos = ?');
        values.push(studentData.apellidos);
      }
      if (studentData.fecha_nacimiento) {
        fields.push('fecha_nacimiento = ?');
        values.push(studentData.fecha_nacimiento);
      }
      if (studentData.genero) {
        fields.push('genero = ?');
        values.push(studentData.genero);
      }
      if (studentData.direccion !== undefined) {
        fields.push('direccion = ?');
        values.push(studentData.direccion);
      }
      if (studentData.distrito !== undefined) {
        fields.push('distrito = ?');
        values.push(studentData.distrito);
      }
      if (studentData.provincia !== undefined) {
        fields.push('provincia = ?');
        values.push(studentData.provincia);
      }
      if (studentData.departamento !== undefined) {
        fields.push('departamento = ?');
        values.push(studentData.departamento);
      }
      if (studentData.telefono !== undefined) {
        fields.push('telefono = ?');
        values.push(studentData.telefono);
      }
      if (studentData.email !== undefined) {
        fields.push('email = ?');
        values.push(studentData.email);
      }
      if (studentData.foto_url !== undefined) {
        fields.push('foto_url = ?');
        values.push(studentData.foto_url);
      }
      if (studentData.estado) {
        fields.push('estado = ?');
        values.push(studentData.estado);
      }

      if (fields.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE estudiantes SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Actualizar información médica
      if (studentData.informacion_medica) {
        const medica = studentData.informacion_medica;
        const medicaFields = [];
        const medicaValues = [];

        if (medica.tipo_sangre !== undefined) {
          medicaFields.push('tipo_sangre = ?');
          medicaValues.push(medica.tipo_sangre);
        }
        if (medica.esta_vacunado !== undefined) {
          medicaFields.push('esta_vacunado = ?');
          medicaValues.push(medica.esta_vacunado);
        }
        if (medica.vacunas_completas !== undefined) {
          medicaFields.push('vacunas_completas = ?');
          medicaValues.push(medica.vacunas_completas);
        }
        if (medica.tiene_alergias !== undefined) {
          medicaFields.push('tiene_alergias = ?');
          medicaValues.push(medica.tiene_alergias);
        }
        if (medica.alergias !== undefined) {
          medicaFields.push('alergias = ?');
          medicaValues.push(medica.alergias);
        }
        if (medica.condiciones_medicas !== undefined) {
          medicaFields.push('condiciones_medicas = ?');
          medicaValues.push(medica.condiciones_medicas);
        }
        if (medica.medicamentos_regulares !== undefined) {
          medicaFields.push('medicamentos_regulares = ?');
          medicaValues.push(medica.medicamentos_regulares);
        }
        if (medica.seguro_medico !== undefined) {
          medicaFields.push('seguro_medico = ?');
          medicaValues.push(medica.seguro_medico);
        }
        if (medica.numero_seguro !== undefined) {
          medicaFields.push('numero_seguro = ?');
          medicaValues.push(medica.numero_seguro);
        }
        if (medica.contacto_emergencia_nombre) {
          medicaFields.push('contacto_emergencia_nombre = ?');
          medicaValues.push(medica.contacto_emergencia_nombre);
        }
        if (medica.contacto_emergencia_telefono) {
          medicaFields.push('contacto_emergencia_telefono = ?');
          medicaValues.push(medica.contacto_emergencia_telefono);
        }
        if (medica.contacto_emergencia_relacion !== undefined) {
          medicaFields.push('contacto_emergencia_relacion = ?');
          medicaValues.push(medica.contacto_emergencia_relacion);
        }
        if (medica.observaciones_medicas !== undefined) {
          medicaFields.push('observaciones_medicas = ?');
          medicaValues.push(medica.observaciones_medicas);
        }

        if (medicaFields.length > 0) {
          medicaValues.push(id);

          // Verificar si existe información médica
          const [existingMedica] = await connection.execute(
            'SELECT id FROM informacion_medica WHERE estudiante_id = ?',
            [id]
          );

          if (existingMedica.length > 0) {
            await connection.execute(
              `UPDATE informacion_medica SET ${medicaFields.join(', ')} WHERE estudiante_id = ?`,
              medicaValues
            );
          } else {
            // Insertar si no existe
            await connection.execute(
              `INSERT INTO informacion_medica (estudiante_id, ${medicaFields.map(f => f.split(' = ')[0]).join(', ')})
               VALUES (?, ${medicaFields.map(() => '?').join(', ')})`,
              [id, ...medicaValues.slice(0, -1)]
            );
          }
        }
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

  // Verificar si un estudiante puede matricularse en un grado específico
  static async validarGradoMatricula(estudianteId, gradoId) {
    const connection = await db.getConnection();

    try {
      // Obtener el último año académico del estudiante
      const [historial] = await connection.execute(
        `SELECT ha.grado_id, ha.estado, g.grado
         FROM historial_academico ha
         INNER JOIN grados g ON ha.grado_id = g.id
         WHERE ha.estudiante_id = ?
         ORDER BY ha.año_escolar DESC
         LIMIT 1`,
        [estudianteId]
      );

      // Si no tiene historial, puede matricularse en cualquier grado
      if (historial.length === 0) {
        return { valido: true, mensaje: 'Estudiante nuevo sin historial' };
      }

      const ultimoGrado = historial[0].grado;
      const estadoAño = historial[0].estado;

      // Obtener el grado al que se quiere matricular
      const [gradoDestino] = await connection.execute(
        'SELECT grado FROM grados WHERE id = ?',
        [gradoId]
      );

      if (gradoDestino.length === 0) {
        return { valido: false, mensaje: 'Grado destino no encontrado' };
      }

      const nuevoGrado = gradoDestino[0].grado;

      // Validaciones
      if (estadoAño === 'aprobado') {
        // Si aprobó, debe ir al siguiente grado o mantenerse
        if (nuevoGrado < ultimoGrado) {
          return {
            valido: false,
            mensaje: `No puede retroceder de grado. Último grado aprobado: ${ultimoGrado}`
          };
        }
        if (nuevoGrado > ultimoGrado + 1) {
          return {
            valido: false,
            mensaje: `No puede saltar grados. Debe matricularse en grado ${ultimoGrado + 1}`
          };
        }
      } else if (estadoAño === 'desaprobado') {
        // Si desaprobó, debe repetir el mismo grado
        if (nuevoGrado !== ultimoGrado) {
          return {
            valido: false,
            mensaje: `Debe repetir el grado ${ultimoGrado} por no haber aprobado`
          };
        }
      }

      return { valido: true, mensaje: 'Grado válido para matrícula' };
    } finally {
      connection.release();
    }
  }

  // Verificar documentos obligatorios completados
  static async verificarDocumentosCompletos(estudianteId) {
    const connection = await db.getConnection();

    try {
      // Obtener documentos obligatorios
      const [requisitos] = await connection.execute(
        'SELECT tipo_documento, descripcion FROM requisitos_matricula WHERE es_obligatorio = TRUE AND estado = "activo"'
      );

      // Obtener documentos del estudiante aprobados
      const [documentosEstudiante] = await connection.execute(
        'SELECT tipo_documento FROM documentos_estudiante WHERE estudiante_id = ? AND estado_verificacion = "aprobado"',
        [estudianteId]
      );

      const tiposSubidos = documentosEstudiante.map(d => d.tipo_documento);
      const faltantes = requisitos.filter(r => !tiposSubidos.includes(r.tipo_documento));

      return {
        completo: faltantes.length === 0,
        total_requeridos: requisitos.length,
        total_subidos: tiposSubidos.length,
        documentos_faltantes: faltantes
      };
    } finally {
      connection.release();
    }
  }

  // Agregar documento a estudiante
  static async agregarDocumento(documentoData) {
    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO documentos_estudiante (
          estudiante_id, tipo_documento, nombre_archivo, ruta_archivo,
          tamaño_bytes, mime_type, es_obligatorio, estado_verificacion,
          observaciones, subido_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documentoData.estudiante_id,
          documentoData.tipo_documento,
          documentoData.nombre_archivo,
          documentoData.ruta_archivo,
          documentoData.tamaño_bytes || null,
          documentoData.mime_type || null,
          documentoData.es_obligatorio || false,
          documentoData.estado_verificacion || 'pendiente',
          documentoData.observaciones || null,
          documentoData.subido_por || null
        ]
      );

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Registrar historial académico
  static async agregarHistorialAcademico(historialData) {
    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO historial_academico (
          estudiante_id, año_escolar, grado_id, seccion_id,
          promedio_final, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          historialData.estudiante_id,
          historialData.año_escolar,
          historialData.grado_id,
          historialData.seccion_id || null,
          historialData.promedio_final || null,
          historialData.estado || 'aprobado',
          historialData.observaciones || null
        ]
      );

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Eliminar estudiante
  static async delete(id) {
    const connection = await db.getConnection();

    try {
      await connection.execute('DELETE FROM estudiantes WHERE id = ?', [id]);
      return true;
    } finally {
      connection.release();
    }
  }
}

module.exports = Student;
