# Migración de Estructura de Documentos

## Problema
La tabla `documentos_requeridos` no existe en la base de datos, por lo que no se crean documentos pendientes automáticamente cuando se matricula a un estudiante.

## Solución
Ejecutar el script de migración `004_fix_documentos_structure.sql`

## Opción 1: Ejecutar desde MySQL Workbench o Cliente MySQL

1. Abre MySQL Workbench o tu cliente MySQL
2. Conéctate a la base de datos `colegio_soa_db`
3. Abre el archivo `004_fix_documentos_structure.sql`
4. Ejecuta todo el script (Ctrl+Shift+Enter en Workbench)

## Opción 2: Ejecutar desde línea de comandos

```bash
mysql -u root -p colegio_soa_db < database/migrations/004_fix_documentos_structure.sql
```

## Qué hace esta migración

1. ✅ Crea la tabla `documentos_requeridos` si no existe
2. ✅ Inserta 7 documentos requeridos por defecto:
   - DNI del Estudiante
   - DNI del Apoderado
   - Partida de Nacimiento
   - Certificado de Estudios
   - Constancia de No Adeudo
   - Foto Tamaño Carnet
   - Ficha de Matrícula

3. ✅ Agrega columnas faltantes a `documentos_estudiante` si es necesario:
   - `documento_requerido_id`
   - `matricula_id`
   - `archivo_url`
   - `fecha_subida`
   - `fecha_revision`
   - `revisado_por`

## Después de ejecutar la migración

1. Reinicia el servidor backend si está corriendo
2. Al matricular nuevos estudiantes, se crearán automáticamente los 7 documentos pendientes
3. Los padres podrán ver los documentos pendientes en su módulo
4. Podrán subir los documentos requeridos

## Verificar que funcionó

Ejecuta esta consulta para verificar:

```sql
-- Ver documentos requeridos
SELECT * FROM documentos_requeridos;

-- Ver estructura de documentos_estudiante
DESCRIBE documentos_estudiante;
```

Deberías ver 7 documentos requeridos y todas las columnas necesarias en documentos_estudiante.
