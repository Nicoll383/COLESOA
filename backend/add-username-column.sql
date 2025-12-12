-- Agregar columna username a tabla usuarios
-- Esta columna permite tener un nombre de usuario separado del email

USE colegio_soa_db;

-- Agregar columna username
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS username VARCHAR(100) AFTER email;

-- Actualizar username existentes basándose en el email
UPDATE usuarios
SET username = email
WHERE username IS NULL OR username = '';

-- Agregar índice para username
CREATE INDEX IF NOT EXISTS idx_username ON usuarios(username);

SELECT 'Columna username agregada exitosamente' as resultado;
