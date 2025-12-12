/**
 * Script para crear usuario estudiante de prueba
 * Este usuario puede ser usado para testing del portal de estudiantes
 */

const bcrypt = require('bcryptjs');
const { connectMySQL } = require('./src/config/mysql');

async function createEstudianteTest() {
  let pool;
  try {
    console.log('🔧 Conectando a MySQL...\n');
    pool = await connectMySQL();

    // Credenciales del estudiante de prueba
    const estudianteTest = {
      email: 'estudiante.prueba@estudiante.colesoa.edu.pe',
      password: 'estudiante123',
      username: 'estudiante.prueba',
      nombre: 'María',
      apellido: 'Pérez Sánchez',
      rol: 'estudiante',
      dni: '87654321'
    };

    console.log('📋 Verificando si el usuario ya existe...\n');

    // Verificar si ya existe
    const [existing] = await pool.execute(
      'SELECT id, email, username FROM usuarios WHERE email = ? OR dni = ?',
      [estudianteTest.email, estudianteTest.dni]
    );

    if (existing.length > 0) {
      console.log('⚠️  Usuario ya existe. Actualizando contraseña...\n');

      const hashedPassword = await bcrypt.hash(estudianteTest.password, 10);

      await pool.execute(
        `UPDATE usuarios
         SET password = ?, nombre = ?, apellido = ?, username = ?, estado = 'activo'
         WHERE id = ?`,
        [hashedPassword, estudianteTest.nombre, estudianteTest.apellido, estudianteTest.username, existing[0].id]
      );

      console.log('✅ Usuario actualizado exitosamente!\n');
    } else {
      console.log('➕ Creando nuevo usuario estudiante...\n');

      const hashedPassword = await bcrypt.hash(estudianteTest.password, 10);

      await pool.execute(
        `INSERT INTO usuarios (email, password, nombre, apellido, username, rol, dni, estado, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
        [estudianteTest.email, hashedPassword, estudianteTest.nombre, estudianteTest.apellido,
         estudianteTest.username, estudianteTest.rol, estudianteTest.dni]
      );

      console.log('✅ Usuario creado exitosamente!\n');
    }

    // Mostrar credenciales
    console.log('=' .repeat(60));
    console.log('🔑 CREDENCIALES DE ACCESO PARA PRUEBAS - ROL: ESTUDIANTE');
    console.log('=' .repeat(60));
    console.log(`Email/Usuario: ${estudianteTest.email}`);
    console.log(`Contraseña:    ${estudianteTest.password}`);
    console.log(`Username:      ${estudianteTest.username}`);
    console.log('=' .repeat(60));
    console.log('\n💡 Usa estas credenciales para probar el portal de estudiantes\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
}

// Ejecutar
createEstudianteTest();
