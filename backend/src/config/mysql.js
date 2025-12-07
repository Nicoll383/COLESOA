const mysql = require('mysql2/promise');

let pool;

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '-05:00' // Perú timezone
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✓ Conectado a MySQL');
    connection.release();

    return pool;
  } catch (error) {
    console.error('✗ Error al conectar con MySQL:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('MySQL pool no inicializado. Llama a connectMySQL() primero.');
  }
  return pool;
};

// Método para obtener una conexión directamente
const getConnection = async () => {
  if (!pool) {
    throw new Error('MySQL pool no inicializado. Llama a connectMySQL() primero.');
  }
  return await pool.getConnection();
};

module.exports = {
  connectMySQL,
  getPool,
  getConnection
};
