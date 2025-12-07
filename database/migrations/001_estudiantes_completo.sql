-- ============================================
-- MIGRACION: Gestión Completa de Estudiantes
-- ============================================

USE colegio_soa_db;

-- ============================================
-- TABLA: informacion_medica
-- Almacena información médica básica del estudiante
-- ============================================

CREATE TABLE IF NOT EXISTS informacion_medica (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL UNIQUE,
  tipo_sangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  esta_vacunado BOOLEAN DEFAULT FALSE,
  vacunas_completas TEXT COMMENT 'Lista de vacunas aplicadas',
  tiene_alergias BOOLEAN DEFAULT FALSE,
  alergias TEXT COMMENT 'Descripción de alergias',
  condiciones_medicas TEXT COMMENT 'Condiciones médicas especiales (asma, diabetes, etc.)',
  medicamentos_regulares TEXT COMMENT 'Medicamentos que toma regularmente',
  seguro_medico VARCHAR(200),
  numero_seguro VARCHAR(100),
  contacto_emergencia_nombre VARCHAR(200) NOT NULL,
  contacto_emergencia_telefono VARCHAR(20) NOT NULL,
  contacto_emergencia_relacion VARCHAR(50),
  observaciones_medicas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  INDEX idx_estudiante (estudiante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: historial_academico
-- Almacena el historial académico del estudiante
-- ============================================

CREATE TABLE IF NOT EXISTS historial_academico (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  año_escolar INT NOT NULL,
  grado_id INT NOT NULL,
  seccion_id INT,
  promedio_final DECIMAL(4, 2),
  estado_año ENUM('aprobado', 'desaprobado', 'retirado', 'trasladado') NOT NULL,
  colegio_procedencia VARCHAR(200) COMMENT 'Si es transferencia o primer registro',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
  FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL,
  UNIQUE KEY unique_estudiante_año (estudiante_id, año_escolar),
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_año (año_escolar),
  INDEX idx_grado (grado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: documentos_estudiante
-- Almacena documentos requeridos del estudiante (DNI, certificados, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS documentos_estudiante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INT NOT NULL,
  tipo_documento ENUM(
    'dni_copia',
    'partida_nacimiento',
    'certificado_estudios',
    'certificado_conducta',
    'certificado_salud',
    'foto_carnet',
    'recibo_agua',
    'recibo_luz',
    'otro'
  ) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tamaño_bytes INT,
  mime_type VARCHAR(100),
  es_obligatorio BOOLEAN DEFAULT FALSE,
  estado_verificacion ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
  observaciones TEXT,
  subido_por INT,
  verificado_por INT,
  fecha_verificacion DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_tipo (tipo_documento),
  INDEX idx_estado (estado_verificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: requisitos_matricula
-- Define los documentos obligatorios para matrícula
-- ============================================

CREATE TABLE IF NOT EXISTS requisitos_matricula (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo_documento VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NOT NULL,
  es_obligatorio BOOLEAN DEFAULT TRUE,
  orden INT DEFAULT 0,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar requisitos obligatorios por defecto
INSERT INTO requisitos_matricula (tipo_documento, descripcion, es_obligatorio, orden) VALUES
('dni_copia', 'Copia del DNI del estudiante', TRUE, 1),
('partida_nacimiento', 'Partida de nacimiento original', TRUE, 2),
('certificado_estudios', 'Certificado de estudios del año anterior', TRUE, 3),
('certificado_conducta', 'Certificado de conducta', TRUE, 4),
('certificado_salud', 'Certificado médico de salud', TRUE, 5),
('foto_carnet', 'Foto tamaño carnet (fondo blanco)', TRUE, 6),
('recibo_agua', 'Recibo de agua o luz (domicilio)', TRUE, 7);
