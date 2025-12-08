-- ============================================
-- MIGRACIÓN: Agregar sistema de permisos granulares
-- ============================================

USE colegio_soa_db;

-- Agregar columna permisos a la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN permisos JSON NULL AFTER rol,
ADD COLUMN ultima_modificacion_permisos TIMESTAMP NULL;

-- Agregar estado 'confirmada' a las matrículas
ALTER TABLE matriculas
MODIFY COLUMN estado ENUM('pendiente', 'confirmada', 'pagada', 'cancelada', 'anulada') DEFAULT 'pendiente';

-- Comentarios explicativos
-- La columna permisos almacena un JSON con la siguiente estructura:
-- {
--   "estudiantes": {"ver": true, "crear": true, "editar": true, "eliminar": false},
--   "matriculas": {"ver": true, "crear": true, "editar": true, "eliminar": false},
--   "pagos": {"ver": true, "crear": true, "editar": true, "eliminar": false},
--   "documentos": {"ver": true, "aprobar": true, "rechazar": true},
--   "reportes": {"ver": true, "exportar": true},
--   "usuarios": {"ver": false, "crear": false, "editar": false, "eliminar": false}
-- }
