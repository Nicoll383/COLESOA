const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updatePasswords() {
  try {
    // Conectar a MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'colesoa_user',
      password: 'colesoa_pass123',
      database: 'colegio_soa_db'
    });

    console.log('Conectado a MySQL');

    // Generar hash para "Password123!"
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\nActualizando contraseñas...');
    console.log('Nueva contraseña: Password123!');

    // Actualizar todos los usuarios con la nueva contraseña
    const [result] = await connection.execute(
      'UPDATE usuarios SET password = ?',
      [hashedPassword]
    );

    console.log(`\nContraseñas actualizadas: ${result.affectedRows} usuarios`);

    // Mostrar usuarios
    const [users] = await connection.execute(
      'SELECT id, email, nombre, apellido, rol FROM usuarios'
    );

    console.log('\nUsuarios actualizados:');
    console.log('======================================');
    users.forEach(user => {
      console.log(`${user.rol.padEnd(15)} | ${user.email}`);
    });
    console.log('======================================');
    console.log('\nTodos pueden usar: Password123!');

    await connection.end();
    console.log('\nListo! Ahora puedes hacer login.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
