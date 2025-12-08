-- ============================================
-- MIGRACIÓN: Agregar campos para sistema de cuotas mensuales
-- ============================================

USE colegio_soa_db;

-- Agregar campos para identificar mes y año de la cuota
ALTER TABLE pagos
ADD COLUMN mes INT NULL COMMENT 'Mes de la cuota (1-12)' AFTER tipo_pago,
ADD COLUMN año INT NULL COMMENT 'Año de la cuota' AFTER mes,
ADD COLUMN fecha_vencimiento DATE NULL COMMENT 'Fecha de vencimiento de la cuota' AFTER monto;

-- Modificar fecha_pago para permitir NULL (para cuotas pendientes)
ALTER TABLE pagos
MODIFY COLUMN fecha_pago DATETIME NULL;

-- Actualizar estado default a 'pendiente' para nuevas cuotas
ALTER TABLE pagos
MODIFY COLUMN estado ENUM('completado', 'pendiente', 'anulado', 'vencido') DEFAULT 'pendiente';

-- Agregar índice compuesto para buscar cuotas por matrícula, mes y año
ALTER TABLE pagos
ADD INDEX idx_cuota (matricula_id, mes, año);

-- Comentarios:
-- mes: 1=Marzo, 2=Abril, ..., 10=Diciembre (10 meses del año escolar)
-- estado 'vencido': se marcará automáticamente cuando pase la fecha_vencimiento
