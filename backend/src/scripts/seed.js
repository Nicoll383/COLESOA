require('dotenv').config();
const { connectMySQL, getPool } = require('../config/mysql');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const pool = getPool();

  try {
    console.log('🌱 Insertando datos de prueba...\n');

    // Hash para todas las contraseñas de prueba
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    // 1. Usuarios de prueba
    console.log('Insertando usuarios...');
    await pool.execute(`
      INSERT INTO usuarios (email, password, nombre, apellido, rol, telefono, dni, estado) VALUES
      ('admin@colegiosoa.edu.pe', ?, 'Carlos', 'Administrador', 'administrador', '987654321', '12345678', 'activo'),
      ('secretaria@colegiosoa.edu.pe', ?, 'María', 'González', 'secretaria', '987654322', '12345679', 'activo'),
      ('finanzas@colegiosoa.edu.pe', ?, 'Juan', 'Pérez', 'finanzas', '987654323', '12345680', 'activo'),
      ('docente1@colegiosoa.edu.pe', ?, 'Ana', 'Rodríguez', 'docente', '987654324', '12345681', 'activo'),
      ('docente2@colegiosoa.edu.pe', ?, 'Luis', 'Torres', 'docente', '987654325', '12345682', 'activo'),
      ('padre1@example.com', ?, 'Roberto', 'Silva', 'padre', '987654326', '12345683', 'activo'),
      ('padre2@example.com', ?, 'Carmen', 'Flores', 'padre', '987654327', '12345684', 'activo')
      ON DUPLICATE KEY UPDATE id=id
    `, [defaultPassword, defaultPassword, defaultPassword, defaultPassword, defaultPassword, defaultPassword, defaultPassword]);
    console.log('✓ Usuarios insertados');

    // 2. Grados de primaria
    console.log('Insertando grados...');
    await pool.execute(`
      INSERT INTO grados (nivel, grado, nombre, descripcion, estado) VALUES
      ('primaria', 1, 'Primer Grado', 'Primer grado de primaria', 'activo'),
      ('primaria', 2, 'Segundo Grado', 'Segundo grado de primaria', 'activo'),
      ('primaria', 3, 'Tercer Grado', 'Tercer grado de primaria', 'activo'),
      ('primaria', 4, 'Cuarto Grado', 'Cuarto grado de primaria', 'activo'),
      ('primaria', 5, 'Quinto Grado', 'Quinto grado de primaria', 'activo'),
      ('primaria', 6, 'Sexto Grado', 'Sexto grado de primaria', 'activo')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Grados insertados');

    // 3. Secciones para el año escolar 2025
    console.log('Insertando secciones...');
    await pool.execute(`
      INSERT INTO secciones (grado_id, nombre, capacidad, docente_id, año_escolar, turno, aula, estado) VALUES
      (1, 'A', 30, 4, 2025, 'mañana', 'Aula 101', 'activo'),
      (1, 'B', 30, 5, 2025, 'mañana', 'Aula 102', 'activo'),
      (2, 'A', 30, 4, 2025, 'mañana', 'Aula 201', 'activo'),
      (2, 'B', 30, 5, 2025, 'mañana', 'Aula 202', 'activo'),
      (3, 'A', 30, 4, 2025, 'mañana', 'Aula 301', 'activo'),
      (4, 'A', 30, 5, 2025, 'mañana', 'Aula 401', 'activo'),
      (5, 'A', 30, 4, 2025, 'mañana', 'Aula 501', 'activo'),
      (6, 'A', 30, 5, 2025, 'mañana', 'Aula 601', 'activo')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Secciones insertadas');

    // 4. Estudiantes de prueba
    console.log('Insertando estudiantes...');
    await pool.execute(`
      INSERT INTO estudiantes (codigo_estudiante, nombres, apellidos, fecha_nacimiento, dni, genero, direccion, distrito, provincia, departamento, telefono, estado) VALUES
      ('EST2025001', 'Pedro José', 'Silva Gómez', '2013-03-15', '76543210', 'M', 'Av. Los Pinos 123', 'San Isidro', 'Lima', 'Lima', '987654330', 'activo'),
      ('EST2025002', 'María Fernanda', 'Flores López', '2014-07-22', '76543211', 'F', 'Jr. Las Rosas 456', 'Miraflores', 'Lima', 'Lima', '987654331', 'activo'),
      ('EST2025003', 'Luis Alberto', 'Torres Vega', '2013-11-10', '76543212', 'M', 'Calle Los Alamos 789', 'Surco', 'Lima', 'Lima', '987654332', 'activo'),
      ('EST2025004', 'Ana Lucía', 'Mendoza Cruz', '2015-02-28', '76543213', 'F', 'Av. Principal 321', 'San Borja', 'Lima', 'Lima', '987654333', 'activo')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Estudiantes insertados');

    // 5. Apoderados
    console.log('Insertando apoderados...');
    await pool.execute(`
      INSERT INTO apoderados (usuario_id, estudiante_id, tipo_apoderado, nombres, apellidos, dni, telefono, email, ocupacion) VALUES
      (6, 1, 'padre', 'Roberto', 'Silva', '12345683', '987654326', 'padre1@example.com', 'Ingeniero'),
      (7, 2, 'madre', 'Carmen', 'Flores', '12345684', '987654327', 'padre2@example.com', 'Doctora'),
      (6, 3, 'padre', 'Roberto', 'Silva', '12345683', '987654326', 'padre1@example.com', 'Ingeniero'),
      (7, 4, 'madre', 'Carmen', 'Flores', '12345684', '987654327', 'padre2@example.com', 'Doctora')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Apoderados insertados');

    // 6. Configuración del sistema
    console.log('Insertando configuración...');
    await pool.execute(`
      INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
      ('nombre_colegio', 'Colegio SOA', 'Nombre oficial del colegio', 'string'),
      ('año_escolar_actual', '2025', 'Año escolar en curso', 'number'),
      ('monto_matricula_primaria', '500.00', 'Monto de matrícula para primaria', 'number'),
      ('monto_pension_primaria', '350.00', 'Monto de pensión mensual para primaria', 'number'),
      ('matricula_abierta', 'true', 'Estado de proceso de matrícula', 'boolean'),
      ('email_contacto', 'contacto@colegiosoa.edu.pe', 'Email de contacto del colegio', 'string'),
      ('telefono_contacto', '01-2345678', 'Teléfono de contacto del colegio', 'string'),
      ('direccion', 'Av. Principal 1234, Lima, Perú', 'Dirección del colegio', 'string')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Configuración insertada');

    // 7. Cursos de primaria
    console.log('Insertando cursos...');
    await pool.execute(`
      INSERT INTO cursos (codigo, nombre, descripcion, nivel, horas_semanales, color, estado) VALUES
      ('MAT-P', 'Matemática', 'Curso de matemáticas para primaria', 'primaria', 6, '#3b82f6', 'activo'),
      ('COM-P', 'Comunicación', 'Curso de comunicación y lenguaje', 'primaria', 6, '#10b981', 'activo'),
      ('CYT-P', 'Ciencia y Tecnología', 'Curso de ciencias naturales y tecnología', 'primaria', 4, '#8b5cf6', 'activo'),
      ('PS-P', 'Personal Social', 'Curso de historia, geografía y cívica', 'primaria', 4, '#f59e0b', 'activo'),
      ('ART-P', 'Arte y Cultura', 'Curso de educación artística', 'primaria', 2, '#ec4899', 'activo'),
      ('EF-P', 'Educación Física', 'Curso de educación física y deportes', 'primaria', 3, '#ef4444', 'activo'),
      ('ING-P', 'Inglés', 'Curso de idioma inglés', 'primaria', 3, '#06b6d4', 'activo'),
      ('REL-P', 'Educación Religiosa', 'Curso de formación religiosa', 'primaria', 2, '#f97316', 'activo')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log('✓ Cursos insertados');

    console.log('\n✅ Datos de prueba insertados exitosamente\n');
    console.log('📝 Usuarios de prueba creados:');
    console.log('   Admin:      admin@colegiosoa.edu.pe / Password123!');
    console.log('   Secretaría: secretaria@colegiosoa.edu.pe / Password123!');
    console.log('   Finanzas:   finanzas@colegiosoa.edu.pe / Password123!');
    console.log('   Docente:    docente1@colegiosoa.edu.pe / Password123!');
    console.log('   Padre:      padre1@example.com / Password123!\n');

  } catch (error) {
    console.error('❌ Error al insertar datos:', error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await connectMySQL();
    await seedData();
    console.log('🎉 Seed completado\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

run();
