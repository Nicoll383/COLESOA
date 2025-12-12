-- Crear tablas faltantes para el sistema escolar
USE colegio_soa_db;

-- Tabla para configuración de años escolares
CREATE TABLE IF NOT EXISTS `configuraciones_año_escolar` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `año_escolar` VARCHAR(9) NOT NULL UNIQUE,
  `fecha_inicio_matricula` DATE NOT NULL,
  `fecha_fin_matricula` DATE NOT NULL,
  `costo_matricula` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `costo_mensualidad` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `descuento_hermanos_porcentaje` DECIMAL(5, 2) DEFAULT 0.00,
  `descuento_pronto_pago_porcentaje` DECIMAL(5, 2) DEFAULT 0.00,
  `niveles_activos` JSON,
  `estado` ENUM('activo', 'inactivo', 'cerrado') DEFAULT 'activo',
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_año_escolar (`año_escolar`),
  INDEX idx_estado (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para asignar cursos a secciones
CREATE TABLE IF NOT EXISTS `seccion_cursos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seccion_id` INT NOT NULL,
  `curso_id` INT NOT NULL,
  `docente_id` INT,
  `año_escolar` VARCHAR(9) NOT NULL,
  `horas_semanales` INT DEFAULT 0,
  `aula` VARCHAR(50),
  `horario` JSON,
  `estado` ENUM('activo', 'inactivo') DEFAULT 'activo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_seccion_curso_año` (`seccion_id`, `curso_id`, `año_escolar`),
  FOREIGN KEY (`seccion_id`) REFERENCES `secciones`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`curso_id`) REFERENCES `cursos`(`id`) ON DELETE CASCADE,
  INDEX idx_año_escolar (`año_escolar`),
  INDEX idx_docente (`docente_id`),
  INDEX idx_estado (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración para año escolar actual
INSERT INTO `configuraciones_año_escolar`
  (`año_escolar`, `fecha_inicio_matricula`, `fecha_fin_matricula`, `costo_matricula`, `costo_mensualidad`, `estado`)
VALUES
  ('2025', '2024-11-01', '2025-03-31', 300.00, 350.00, 'activo')
ON DUPLICATE KEY UPDATE
  `costo_matricula` = 300.00,
  `costo_mensualidad` = 350.00;

SELECT 'Tablas creadas exitosamente' as resultado;
