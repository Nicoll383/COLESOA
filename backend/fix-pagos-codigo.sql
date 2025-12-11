-- Script para arreglar códigos de pago vacíos
-- Ejecutar este script en phpMyAdmin o MySQL Workbench

USE colegio_soa_db;

-- Ver pagos con código vacío
SELECT id, codigo_pago, concepto, monto, fecha_pago
FROM pagos
WHERE codigo_pago = '' OR codigo_pago IS NULL;

-- Eliminar pagos con código vacío (si existen y no son importantes)
-- DESCOMENTA LA SIGUIENTE LÍNEA SOLO SI QUIERES ELIMINAR ESTOS REGISTROS
-- DELETE FROM pagos WHERE codigo_pago = '' OR codigo_pago IS NULL;

-- Alternativamente, actualizar pagos existentes con códigos únicos
SET @counter = 0;
UPDATE pagos
SET codigo_pago = CONCAT('PAG-', YEAR(fecha_pago), '-', LPAD(@counter := @counter + 1, 6, '0'))
WHERE codigo_pago = '' OR codigo_pago IS NULL
ORDER BY id;

-- Verificar que todos los pagos tienen código ahora
SELECT COUNT(*) as pagos_sin_codigo
FROM pagos
WHERE codigo_pago = '' OR codigo_pago IS NULL;

SELECT 'Códigos de pago actualizados correctamente' AS resultado;
