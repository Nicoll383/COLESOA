# Instrucciones para Ejecutar la Migración de Estudiantes

Esta migración agrega las tablas necesarias para la gestión completa de estudiantes:
- Información médica
- Historial académico
- Documentos del estudiante
- Requisitos de matrícula

## Pasos para Ejecutar la Migración

### Opción 1: Usando XAMPP phpMyAdmin (Recomendado)

1. Abre XAMPP Control Panel
2. Inicia el servicio MySQL si no está corriendo
3. Haz clic en el botón "Admin" del módulo MySQL (se abrirá phpMyAdmin en el navegador)
4. En el panel izquierdo, selecciona la base de datos `colegio_soa_db`
5. Haz clic en la pestaña "SQL" en la parte superior
6. Abre el archivo `database/migrations/001_estudiantes_completo.sql` con un editor de texto
7. Copia todo el contenido del archivo
8. Pégalo en el área de texto de phpMyAdmin
9. Haz clic en el botón "Continuar" o "Go"
10. Deberías ver un mensaje de éxito indicando que las tablas fueron creadas

### Opción 2: Usando MySQL Command Line

1. Abre una terminal o PowerShell
2. Navega a la carpeta del proyecto:
   ```bash
   cd C:\COLESOA
   ```
3. Ejecuta el siguiente comando:
   ```bash
   "C:\xampp\mysql\bin\mysql.exe" -u colesoa_user -p colegio_soa_db < database/migrations/001_estudiantes_completo.sql
   ```
4. Ingresa la contraseña cuando se te solicite: `colesoa_pass123`

### Verificar que la Migración se Ejecutó Correctamente

Después de ejecutar la migración, verifica que las nuevas tablas existan:

1. En phpMyAdmin, actualiza la lista de tablas (F5)
2. Deberías ver las siguientes tablas nuevas:
   - `informacion_medica`
   - `historial_academico`
   - `documentos_estudiante`
   - `requisitos_matricula`

3. Verifica que la tabla `requisitos_matricula` tenga datos:
   - Haz clic en la tabla
   - Debería tener 7 registros con los documentos obligatorios

## Tablas Creadas

### 1. informacion_medica
Almacena la información médica básica de cada estudiante:
- Tipo de sangre
- Estado de vacunación
- Alergias
- Condiciones médicas
- Medicamentos regulares
- Seguro médico
- Contacto de emergencia

### 2. historial_academico
Registra el historial académico año por año:
- Año escolar
- Grado y sección
- Promedio final
- Estado del año (aprobado/desaprobado/retirado/trasladado)
- Colegio de procedencia

### 3. documentos_estudiante
Almacena los documentos subidos por el estudiante:
- Tipo de documento
- Archivo (ruta y metadata)
- Estado de verificación (pendiente/aprobado/rechazado)
- Usuario que subió y verificó

### 4. requisitos_matricula
Define los documentos obligatorios para matrícula:
- DNI del estudiante
- Partida de nacimiento
- Certificado de estudios
- Certificado de conducta
- Certificado médico
- Foto carnet
- Recibo de servicios (domicilio)

## Validaciones Implementadas

El sistema ahora incluye las siguientes validaciones:

1. **Control de DNI Duplicado**: No se puede registrar un estudiante con un DNI ya existente
2. **Validación de Grados**: El sistema verifica que el estudiante se matricule en el grado correcto:
   - Si aprobó el año anterior, puede ir al siguiente grado
   - Si desaprobó, debe repetir el mismo grado
   - No puede retroceder de grado
   - No puede saltar grados
3. **Campos Obligatorios**: Se validan los campos requeridos antes de permitir la matrícula
4. **Verificación de Documentos**: El sistema puede verificar si todos los documentos obligatorios están completos

## Próximos Pasos

Después de ejecutar la migración:

1. Reinicia el backend si está corriendo
2. El módulo de Gestión de Estudiantes ya está completamente funcional
3. Puedes acceder desde el dashboard del Administrador o Secretaría
4. Ruta: http://localhost:5173/students

## En Caso de Error

Si encuentras algún error al ejecutar la migración:

1. Verifica que la base de datos `colegio_soa_db` exista
2. Verifica que el usuario `colesoa_user` tenga permisos suficientes
3. Si las tablas ya existen, puedes eliminarlas primero:
   ```sql
   DROP TABLE IF EXISTS documentos_estudiante;
   DROP TABLE IF EXISTS historial_academico;
   DROP TABLE IF EXISTS informacion_medica;
   DROP TABLE IF EXISTS requisitos_matricula;
   ```
4. Luego ejecuta nuevamente la migración
