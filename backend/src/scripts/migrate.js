require('dotenv').config();
const { connectMySQL, getPool } = require('../config/mysql');

const createTables = async () => {
  const pool = getPool();

  try {
    console.log('📋 Creando tablas en MySQL...\n');

    // Tabla de usuarios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        rol ENUM('administrador', 'secretaria', 'finanzas', 'docente', 'padre') NOT NULL,
        telefono VARCHAR(20),
        dni VARCHAR(20) UNIQUE,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_rol (rol),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla usuarios creada');

    // Tabla de estudiantes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS estudiantes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        dni VARCHAR(20) UNIQUE NOT NULL,
        genero ENUM('M', 'F') NOT NULL,
        direccion TEXT,
        distrito VARCHAR(100),
        provincia VARCHAR(100),
        departamento VARCHAR(100),
        telefono VARCHAR(20),
        email VARCHAR(255),
        foto_url VARCHAR(500),
        estado ENUM('activo', 'retirado', 'trasladado') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_codigo (codigo_estudiante),
        INDEX idx_dni (dni),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla estudiantes creada');

    // Tabla de apoderados (padres)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS apoderados (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT,
        estudiante_id INT NOT NULL,
        tipo_apoderado ENUM('padre', 'madre', 'tutor', 'otro') NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        dni VARCHAR(20) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        direccion TEXT,
        ocupacion VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        INDEX idx_estudiante (estudiante_id),
        INDEX idx_usuario (usuario_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla apoderados creada');

    // Tabla de grados
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS grados (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nivel ENUM('primaria') DEFAULT 'primaria',
        grado INT NOT NULL,
        nombre VARCHAR(50) NOT NULL,
        descripcion TEXT,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_grado (nivel, grado),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla grados creada');

    // Tabla de secciones
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS secciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        grado_id INT NOT NULL,
        nombre VARCHAR(10) NOT NULL,
        capacidad INT DEFAULT 30,
        docente_id INT,
        año_escolar INT NOT NULL,
        turno ENUM('mañana', 'tarde') DEFAULT 'mañana',
        aula VARCHAR(20),
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
        FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        UNIQUE KEY unique_seccion (grado_id, nombre, año_escolar),
        INDEX idx_año (año_escolar),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla secciones creada');

    // Tabla de matrículas
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS matriculas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo_matricula VARCHAR(20) UNIQUE NOT NULL,
        estudiante_id INT NOT NULL,
        seccion_id INT NOT NULL,
        año_escolar INT NOT NULL,
        fecha_matricula DATE NOT NULL,
        tipo_matricula ENUM('nueva', 'continuidad', 'traslado') NOT NULL,
        estado ENUM('pendiente', 'pagada', 'cancelada', 'anulada') DEFAULT 'pendiente',
        monto_total DECIMAL(10, 2) NOT NULL,
        descuento DECIMAL(10, 2) DEFAULT 0,
        observaciones TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
        UNIQUE KEY unique_matricula_año (estudiante_id, año_escolar),
        INDEX idx_codigo (codigo_matricula),
        INDEX idx_año (año_escolar),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla matrículas creada');

    // Tabla de pagos
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pagos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo_pago VARCHAR(20) UNIQUE NOT NULL,
        matricula_id INT NOT NULL,
        tipo_pago ENUM('matricula', 'pensión', 'otros') NOT NULL,
        concepto VARCHAR(255) NOT NULL,
        monto DECIMAL(10, 2) NOT NULL,
        fecha_pago DATETIME NOT NULL,
        metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'deposito') NOT NULL,
        numero_operacion VARCHAR(100),
        estado ENUM('completado', 'pendiente', 'anulado') DEFAULT 'completado',
        recibo_url VARCHAR(500),
        observaciones TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_codigo (codigo_pago),
        INDEX idx_matricula (matricula_id),
        INDEX idx_fecha (fecha_pago),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla pagos creada');

    // Tabla de configuración del sistema
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INT PRIMARY KEY AUTO_INCREMENT,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_clave (clave)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabla configuración creada');

    console.log('\n✅ Todas las tablas fueron creadas exitosamente\n');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await connectMySQL();
    await createTables();
    console.log('🎉 Migración completada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
};

run();
