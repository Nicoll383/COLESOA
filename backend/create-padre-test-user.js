/**
 * Script para crear usuario padre de prueba
 * Este usuario puede ser usado para testing del portal de padres
 */

const bcrypt = require('bcryptjs');
const { connectMySQL } = require('./src/config/mysql');

async function createPadreTest() {
  let pool;
  try {
    console.log('🔧 Conectando a MySQL...\n');
    pool = await connectMySQL();

    // Credenciales del padre de prueba
    const padreTest = {
      email: 'padre.prueba@gmail.com',
      password: 'padre123',
      username: 'padre.prueba',
      nombre: 'Juan',
      apellido: 'Pérez García',
      rol: 'padre',
      dni: '12345678',
      telefono: '987654321'
    };

    console.log('📋 Verificando si el usuario ya existe...\n');

    // Verificar si ya existe
    const [existing] = await pool.execute(
      'SELECT id, email, username FROM usuarios WHERE email = ? OR dni = ?',
      [padreTest.email, padreTest.dni]
    );

    if (existing.length > 0) {
      console.log('⚠️  Usuario ya existe. Actualizando contraseña...\n');

      const hashedPassword = await bcrypt.hash(padreTest.password, 10);

      await pool.execute(
        `UPDATE usuarios
         SET password = ?, nombre = ?, apellido = ?, username = ?, telefono = ?, estado = 'activo'
         WHERE id = ?`,
        [hashedPassword, padreTest.nombre, padreTest.apellido, padreTest.username, padreTest.telefono, existing[0].id]
      );

      console.log('✅ Usuario actualizado exitosamente!\n');
    } else {
      console.log('➕ Creando nuevo usuario padre...\n');

      const hashedPassword = await bcrypt.hash(padreTest.password, 10);

      await pool.execute(
        `INSERT INTO usuarios (email, password, nombre, apellido, username, rol, dni, telefono, estado, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
        [padreTest.email, hashedPassword, padreTest.nombre, padreTest.apellido,
         padreTest.username, padreTest.rol, padreTest.dni, padreTest.telefono]
      );

      console.log('✅ Usuario creado exitosamente!\n');
    }

    // Mostrar credenciales
    console.log('=' .repeat(60));
    console.log('🔑 CREDENCIALES DE ACCESO PARA PRUEBAS - ROL: PADRE');
    console.log('=' .repeat(60));
    console.log(`Email/Usuario: ${padreTest.email}`);
    console.log(`Contraseña:    ${padreTest.password}`);
    console.log(`Username:      ${padreTest.username}`);
    console.log('=' .repeat(60));
    console.log('\n💡 Usa estas credenciales para probar el portal de padres\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
}

// Ejecutar
createPadreTest();
