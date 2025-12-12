-- ============================================
-- MIGRACIÓN: Agregar soporte completo para documentos
-- Fecha: 2025-12-12
-- Descripción: Crea tabla documentos_requeridos y ajusta documentos_estudiante
-- ============================================

USE colegio_soa_db;

-- 1. Crear tabla documentos_requeridos si no existe
CREATE TABLE IF NOT EXISTS documentos_requeridos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  obligatorio BOOLEAN DEFAULT true,
  tipo_archivo VARCHAR(100) DEFAULT 'PDF,JPG,PNG',
  orden INT DEFAULT 0,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insertar documentos requeridos si la tabla está vacía
INSERT INTO documentos_requeridos (nombre, descripcion, obligatorio, tipo_archivo, orden, estado)
SELECT * FROM (
  SELECT 'DNI del Estudiante' as nombre, 'Copia del DNI del estudiante (ambas caras)' as descripcion, true as obligatorio, 'PDF,JPG,PNG' as tipo_archivo, 1 as orden, 'activo' as estado
  UNION ALL SELECT 'DNI del Apoderado', 'Copia del DNI del padre o apoderado (ambas caras)', true, 'PDF,JPG,PNG', 2, 'activo'
  UNION ALL SELECT 'Partida de Nacimiento', 'Partida de nacimiento original o copia legalizada', true, 'PDF', 3, 'activo'
  UNION ALL SELECT 'Certificado de Estudios', 'Certificado de estudios del año anterior', true, 'PDF', 4, 'activo'
  UNION ALL SELECT 'Constancia de No Adeudo', 'Constancia de no adeudo del colegio anterior', true, 'PDF', 5, 'activo'
  UNION ALL SELECT 'Foto Tamaño Carnet', 'Fotografía reciente tamaño carnet', true, 'JPG,PNG', 6, 'activo'
  UNION ALL SELECT 'Ficha de Matrícula', 'Ficha de matrícula firmada por el apoderado', true, 'PDF', 7, 'activo'
) as temp
WHERE NOT EXISTS (SELECT 1 FROM documentos_requeridos LIMIT 1);

-- 3. Verificar si la tabla documentos_estudiante necesita ajustes
-- Agregar columna documento_requerido_id si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'documento_requerido_id'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN documento_requerido_id INT AFTER estudiante_id',
  'SELECT "Column documento_requerido_id already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Agregar columna matricula_id si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'matricula_id'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN matricula_id INT AFTER documento_requerido_id',
  'SELECT "Column matricula_id already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Agregar columna archivo_url si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'archivo_url'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN archivo_url VARCHAR(500) AFTER matricula_id',
  'SELECT "Column archivo_url already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Agregar columna fecha_subida si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'fecha_subida'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN fecha_subida TIMESTAMP NULL AFTER nombre_archivo',
  'SELECT "Column fecha_subida already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Agregar columna fecha_revision si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'fecha_revision'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN fecha_revision TIMESTAMP NULL AFTER fecha_subida',
  'SELECT "Column fecha_revision already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. Agregar columna revisado_por si no existe
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'colegio_soa_db'
  AND TABLE_NAME = 'documentos_estudiante'
  AND COLUMN_NAME = 'revisado_por'
);

SET @alter_sql = IF(@column_exists = 0,
  'ALTER TABLE documentos_estudiante ADD COLUMN revisado_por INT AFTER fecha_revision',
  'SELECT "Column revisado_por already exists" as message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Migración completada: Estructura de documentos actualizada' as resultado;
