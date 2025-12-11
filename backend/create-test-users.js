require('dotenv').config();
const { connectMySQL } = require('./src/config/mysql');
const bcrypt = require('bcryptjs');

/**
 * Script para crear usuarios de prueba
 * Ejecutar: node create-test-users.js
 */

const testUsers = [
  {
    email: 'admin@colegio.com',
    password: 'admin123',
    nombre: 'Admin',
    apellido: 'Sistema',
    rol: 'administrador',
    dni: '12345678'
  },
  {
    email: 'secretaria@colegio.com',
    password: 'secretaria123',
    nombre: 'María',
    apellido: 'González',
    rol: 'secretaria',
    dni: '23456789'
  },
  {
    email: 'finanzas@colegio.com',
    password: 'finanzas123',
    nombre: 'Carlos',
    apellido: 'Pérez',
    rol: 'finanzas',
    dni: '34567890'
  },
  {
    email: 'docente@colegio.com',
    password: 'docente123',
    nombre: 'Ana',
    apellido: 'Martínez',
    rol: 'docente',
    dni: '45678901'
  },
  {
    email: 'padre@colegio.com',
    password: 'padre123',
    nombre: 'Juan',
    apellido: 'Rodríguez',
    rol: 'padre',
    dni: '56789012'
  }
];

async function createTestUsers() {
  let pool;

  try {
    console.log('🔧 Conectando a MySQL...\n');
    pool = await connectMySQL();

    console.log('🔧 Creando usuarios de prueba...\n');

    for (const user of testUsers) {
      try {
        // Verificar si el usuario ya existe (por email o DNI)
        const [existing] = await pool.execute(
          'SELECT id, email, dni FROM usuarios WHERE email = ? OR dni = ?',
          [user.email, user.dni]
        );

        if (existing.length > 0) {
          // Actualizar el usuario existente (sin cambiar el DNI si ya existe)
          const hashedPassword = await bcrypt.hash(user.password, 10);
          const existingUser = existing[0];

          await pool.execute(
            `UPDATE usuarios
             SET password = ?, nombre = ?, apellido = ?, rol = ?, email = ?, estado = 'activo'
             WHERE id = ?`,
            [hashedPassword, user.nombre, user.apellido, user.rol, user.email, existingUser.id]
          );

          console.log(`✅ Usuario actualizado: ${user.email}`);
          console.log(`   Contraseña: ${user.password}`);
          console.log(`   Rol: ${user.rol}`);
          console.log(`   DNI: ${existingUser.dni}\n`);
        } else {
          // Crear nuevo usuario
          const hashedPassword = await bcrypt.hash(user.password, 10);

          await pool.execute(
            `INSERT INTO usuarios (email, password, nombre, apellido, rol, dni, estado, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'activo', NOW())`,
            [user.email, hashedPassword, user.nombre, user.apellido, user.rol, user.dni]
          );

          console.log(`✅ Usuario creado: ${user.email}`);
          console.log(`   Contraseña: ${user.password}`);
          console.log(`   Rol: ${user.rol}\n`);
        }
      } catch (err) {
        console.error(`❌ Error con usuario ${user.email}:`, err.message);
      }
    }

    console.log('\n🎉 ¡Proceso completado!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('================================');
    testUsers.forEach(user => {
      console.log(`\n${user.rol.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Contraseña: ${user.password}`);
    });
    console.log('\n================================\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar
createTestUsers();
