-- ============================================
-- BASE DE DATOS MYSQL - COLEGIO SOA
-- Sistema de Matriculas Escolar
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS colegio_soa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE colegio_soa_db;

-- ============================================
-- TABLA: usuarios
-- Almacena todos los usuarios del sistema (admin, secretaria, finanzas, docentes, padres)
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: estudiantes
-- Almacena información de los estudiantes
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: apoderados
-- Almacena información de padres/apoderados
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: grados
-- Almacena grados escolares (1ro a 6to de primaria)
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: secciones
-- Almacena secciones por grado (Ejemplo: 1ro A, 1ro B, etc.)
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: matriculas
-- Almacena las matrículas de estudiantes
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pagos
-- Almacena los pagos realizados (matrícula, pensiones, etc.)
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: configuracion
-- Almacena configuraciones del sistema
-- ============================================

CREATE TABLE IF NOT EXISTS configuracion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Nota: Las contraseñas están hasheadas con bcrypt
-- Contraseña para todos: Password123!
-- Hash generado: $2a$10$XqKwXyJKQZ9vXqKwXyJKQeHqKwXyJKQZ9vXqKwXyJKQeHqKwXy

INSERT INTO usuarios (email, password, nombre, apellido, rol, telefono, dni, estado) VALUES
('admin@colegiosoa.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Administrador', 'administrador', '987654321', '12345678', 'activo'),
('secretaria@colegiosoa.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'González', 'secretaria', '987654322', '12345679', 'activo'),
('finanzas@colegiosoa.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan', 'Pérez', 'finanzas', '987654323', '12345680', 'activo'),
('docente1@colegiosoa.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana', 'Rodríguez', 'docente', '987654324', '12345681', 'activo'),
('docente2@colegiosoa.edu.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luis', 'Torres', 'docente', '987654325', '12345682', 'activo'),
('padre1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Roberto', 'Silva', 'padre', '987654326', '12345683', 'activo'),
('padre2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carmen', 'Flores', 'padre', '987654327', '12345684', 'activo');

-- Grados de primaria
INSERT INTO grados (nivel, grado, nombre, descripcion, estado) VALUES
('primaria', 1, 'Primer Grado', 'Primer grado de primaria', 'activo'),
('primaria', 2, 'Segundo Grado', 'Segundo grado de primaria', 'activo'),
('primaria', 3, 'Tercer Grado', 'Tercer grado de primaria', 'activo'),
('primaria', 4, 'Cuarto Grado', 'Cuarto grado de primaria', 'activo'),
('primaria', 5, 'Quinto Grado', 'Quinto grado de primaria', 'activo'),
('primaria', 6, 'Sexto Grado', 'Sexto grado de primaria', 'activo');

-- Secciones para el año escolar 2025
INSERT INTO secciones (grado_id, nombre, capacidad, docente_id, año_escolar, turno, aula, estado) VALUES
(1, 'A', 30, 4, 2025, 'mañana', 'Aula 101', 'activo'),
(1, 'B', 30, 5, 2025, 'mañana', 'Aula 102', 'activo'),
(2, 'A', 30, 4, 2025, 'mañana', 'Aula 201', 'activo'),
(2, 'B', 30, 5, 2025, 'mañana', 'Aula 202', 'activo'),
(3, 'A', 30, 4, 2025, 'mañana', 'Aula 301', 'activo'),
(4, 'A', 30, 5, 2025, 'mañana', 'Aula 401', 'activo'),
(5, 'A', 30, 4, 2025, 'mañana', 'Aula 501', 'activo'),
(6, 'A', 30, 5, 2025, 'mañana', 'Aula 601', 'activo');

-- Estudiantes de prueba
INSERT INTO estudiantes (codigo_estudiante, nombres, apellidos, fecha_nacimiento, dni, genero, direccion, distrito, provincia, departamento, telefono, estado) VALUES
('EST2025001', 'Pedro José', 'Silva Gómez', '2013-03-15', '76543210', 'M', 'Av. Los Pinos 123', 'San Isidro', 'Lima', 'Lima', '987654330', 'activo'),
('EST2025002', 'María Fernanda', 'Flores López', '2014-07-22', '76543211', 'F', 'Jr. Las Rosas 456', 'Miraflores', 'Lima', 'Lima', '987654331', 'activo'),
('EST2025003', 'Luis Alberto', 'Torres Vega', '2013-11-10', '76543212', 'M', 'Calle Los Alamos 789', 'Surco', 'Lima', 'Lima', '987654332', 'activo'),
('EST2025004', 'Ana Lucía', 'Mendoza Cruz', '2015-02-28', '76543213', 'F', 'Av. Principal 321', 'San Borja', 'Lima', 'Lima', '987654333', 'activo');

-- Apoderados
INSERT INTO apoderados (usuario_id, estudiante_id, tipo_apoderado, nombres, apellidos, dni, telefono, email, ocupacion) VALUES
(6, 1, 'padre', 'Roberto', 'Silva', '12345683', '987654326', 'padre1@example.com', 'Ingeniero'),
(7, 2, 'madre', 'Carmen', 'Flores', '12345684', '987654327', 'padre2@example.com', 'Doctora'),
(6, 3, 'padre', 'Roberto', 'Silva', '12345683', '987654326', 'padre1@example.com', 'Ingeniero'),
(7, 4, 'madre', 'Carmen', 'Flores', '12345684', '987654327', 'padre2@example.com', 'Doctora');

-- Configuración del sistema
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('nombre_colegio', 'Colegio SOA', 'Nombre oficial del colegio', 'string'),
('año_escolar_actual', '2025', 'Año escolar en curso', 'number'),
('monto_matricula_primaria', '500.00', 'Monto de matrícula para primaria', 'number'),
('monto_pension_primaria', '350.00', 'Monto de pensión mensual para primaria', 'number'),
('matricula_abierta', 'true', 'Estado de proceso de matrícula', 'boolean'),
('email_contacto', 'contacto@colegiosoa.edu.pe', 'Email de contacto del colegio', 'string'),
('telefono_contacto', '01-2345678', 'Teléfono de contacto del colegio', 'string'),
('direccion', 'Av. Principal 1234, Lima, Perú', 'Dirección del colegio', 'string');
