-- Script para crear tablas faltantes en la base de datos
-- Ejecutar este script en phpMyAdmin o MySQL Workbench

USE colegio_soa_db;

-- Tabla: cursos
CREATE TABLE IF NOT EXISTS `cursos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `codigo` VARCHAR(20) UNIQUE NOT NULL,
  `descripcion` TEXT,
  `nivel` ENUM('inicial', 'primaria', 'secundaria') NOT NULL,
  `grado_id` INT,
  `creditos` INT DEFAULT 1,
  `horas_semanales` INT DEFAULT 2,
  `color` VARCHAR(7) DEFAULT '#3b82f6',
  `estado` ENUM('activo', 'inactivo') DEFAULT 'activo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`grado_id`) REFERENCES `grados`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columna color si la tabla ya existe
ALTER TABLE `cursos` ADD COLUMN IF NOT EXISTS `color` VARCHAR(7) DEFAULT '#3b82f6' AFTER `horas_semanales`;

-- Tabla: informacion_medica
CREATE TABLE IF NOT EXISTS `informacion_medica` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudiante_id` INT NOT NULL,
  `tipo_sangre` VARCHAR(5),
  `esta_vacunado` BOOLEAN DEFAULT TRUE,
  `vacunas_completas` BOOLEAN DEFAULT TRUE,
  `tiene_alergias` BOOLEAN DEFAULT FALSE,
  `alergias` TEXT,
  `condiciones_medicas` TEXT,
  `medicamentos_regulares` TEXT,
  `seguro_medico` VARCHAR(100),
  `numero_seguro` VARCHAR(50),
  `contacto_emergencia_nombre` VARCHAR(200),
  `contacto_emergencia_telefono` VARCHAR(20),
  `contacto_emergencia_relacion` VARCHAR(50),
  `observaciones_medicas` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_estudiante_medica` (`estudiante_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: documentos_estudiante
CREATE TABLE IF NOT EXISTS `documentos_estudiante` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudiante_id` INT NOT NULL,
  `tipo_documento` ENUM('dni', 'partida_nacimiento', 'certificado_estudios', 'certificado_medico', 'foto', 'otro') NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(500) NOT NULL,
  `tamanio` INT,
  `mime_type` VARCHAR(100),
  `descripcion` TEXT,
  `estado` ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` TEXT,
  `subido_por` INT,
  `verificado_por` INT,
  `fecha_verificacion` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subido_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`verificado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas faltantes si la tabla ya existe
ALTER TABLE `documentos_estudiante`
  ADD COLUMN IF NOT EXISTS `verificado_por` INT AFTER `subido_por`,
  ADD COLUMN IF NOT EXISTS `fecha_verificacion` TIMESTAMP NULL AFTER `verificado_por`;

-- Agregar foreign key si no existe
ALTER TABLE `documentos_estudiante`
  ADD CONSTRAINT `fk_documentos_verificado_por`
  FOREIGN KEY IF NOT EXISTS (`verificado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL;

-- Insertar algunos cursos de ejemplo para secundaria
INSERT INTO `cursos` (`nombre`, `codigo`, `descripcion`, `nivel`, `horas_semanales`) VALUES
('Matemáticas', 'MAT-SEC', 'Matemáticas para nivel secundaria', 'secundaria', 5),
('Comunicación', 'COM-SEC', 'Comunicación y lenguaje', 'secundaria', 5),
('Inglés', 'ING-SEC', 'Idioma Inglés', 'secundaria', 3),
('Ciencia y Tecnología', 'CYT-SEC', 'Ciencia y Tecnología', 'secundaria', 4),
('Ciencias Sociales', 'CSS-SEC', 'Historia, Geografía y Economía', 'secundaria', 4),
('Educación Física', 'EDF-SEC', 'Educación Física y Deportes', 'secundaria', 2),
('Arte y Cultura', 'ART-SEC', 'Arte y Cultura', 'secundaria', 2),
('Educación para el Trabajo', 'EPT-SEC', 'Educación para el Trabajo', 'secundaria', 2),
('Educación Religiosa', 'REL-SEC', 'Educación Religiosa', 'secundaria', 2),
('Tutoría', 'TUT-SEC', 'Tutoría y Orientación Educativa', 'secundaria', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar algunos cursos de ejemplo para primaria
INSERT INTO `cursos` (`nombre`, `codigo`, `descripcion`, `nivel`, `horas_semanales`) VALUES
('Matemática', 'MAT-PRI', 'Matemática para nivel primaria', 'primaria', 5),
('Comunicación', 'COM-PRI', 'Comunicación para nivel primaria', 'primaria', 5),
('Personal Social', 'PS-PRI', 'Personal Social', 'primaria', 3),
('Ciencia y Tecnología', 'CYT-PRI', 'Ciencia y Tecnología', 'primaria', 3),
('Inglés', 'ING-PRI', 'Idioma Inglés', 'primaria', 2),
('Arte y Cultura', 'ART-PRI', 'Arte y Cultura', 'primaria', 2),
('Educación Física', 'EDF-PRI', 'Educación Física', 'primaria', 2),
('Educación Religiosa', 'REL-PRI', 'Educación Religiosa', 'primaria', 1),
('Tutoría', 'TUT-PRI', 'Tutoría', 'primaria', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tabla: historial_academico
CREATE TABLE IF NOT EXISTS `historial_academico` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudiante_id` INT NOT NULL,
  `año_escolar` VARCHAR(9) NOT NULL,
  `grado_id` INT,
  `seccion_id` INT,
  `promedio_final` DECIMAL(4,2),
  `estado` ENUM('aprobado', 'desaprobado', 'retirado', 'traslado') DEFAULT 'aprobado',
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grado_id`) REFERENCES `grados`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`seccion_id`) REFERENCES `secciones`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_estudiante_año` (`estudiante_id`, `año_escolar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar tablas creadas
SELECT 'Tablas creadas exitosamente' AS resultado;
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'colegio_soa_db'
AND TABLE_NAME IN ('cursos', 'informacion_medica', 'documentos_estudiante', 'historial_academico');
