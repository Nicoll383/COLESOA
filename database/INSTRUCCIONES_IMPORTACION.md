# GUIA COMPLETA: IMPORTAR BASES DE DATOS

Esta guía te llevará paso a paso para configurar las bases de datos MySQL y MongoDB.

## PARTE 1: IMPORTAR MYSQL CON XAMPP

### Paso 1: Iniciar XAMPP

1. Abre el Panel de Control de XAMPP
2. Inicia estos servicios:
   - Apache: Haz clic en "Start"
   - MySQL: Haz clic en "Start"
3. Ambos deben mostrar fondo VERDE

### Paso 2: Abrir phpMyAdmin

1. En el Panel de XAMPP, haz clic en "Admin" junto a MySQL
2. Se abrirá phpMyAdmin en tu navegador
3. O ve directamente a: http://localhost/phpmyadmin

### Paso 3: Importar el Archivo SQL

**Método 1: Importación Automática (Recomendado)**

1. En phpMyAdmin, haz clic en la pestaña "Importar" (arriba)
2. Haz clic en "Seleccionar archivo"
3. Navega a: `C:\COLESOA\database\mysql_schema.sql`
4. Selecciona el archivo y haz clic en "Abrir"
5. Deja todas las opciones por defecto
6. Scroll hacia abajo y haz clic en "Continuar"
7. ESPERA a que termine (puede tomar 10-30 segundos)
8. Deberías ver: "Importación finalizada con éxito"

**Método 2: Copiar y Pegar (Si el Método 1 falla)**

1. Abre el archivo `mysql_schema.sql` con Notepad:
   ```
   C:\COLESOA\database\mysql_schema.sql
   ```
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)
4. Vuelve a phpMyAdmin
5. Haz clic en la pestaña "SQL" (arriba)
6. Pega el contenido en la caja de texto (Ctrl+V)
7. Haz clic en "Continuar" (abajo a la derecha)
8. Espera a que termine

### Paso 4: Verificar la Importación

1. En el panel izquierdo de phpMyAdmin, haz clic en "colegio_soa_db"
2. Deberías ver 8 tablas:
   ```
   - usuarios
   - estudiantes
   - apoderados
   - grados
   - secciones
   - matriculas
   - pagos
   - configuracion
   ```

### Paso 5: Verificar los Datos

1. Haz clic en la tabla "usuarios"
2. Haz clic en "Examinar" (arriba)
3. Deberías ver 7 usuarios:
   - admin@colegiosoa.edu.pe (administrador)
   - secretaria@colegiosoa.edu.pe (secretaria)
   - finanzas@colegiosoa.edu.pe (finanzas)
   - docente1@colegiosoa.edu.pe (docente)
   - docente2@colegiosoa.edu.pe (docente)
   - padre1@example.com (padre)
   - padre2@example.com (padre)

4. Haz clic en "grados" y verifica que hay 6 grados (1ro a 6to)
5. Haz clic en "estudiantes" y verifica que hay 4 estudiantes

### Paso 6: Crear Usuario de Base de Datos (Importante)

1. En phpMyAdmin, haz clic en "Cuentas de usuario" (arriba)
2. Haz clic en "Agregar cuenta de usuario"
3. Completa:
   - **Nombre de usuario**: `colesoa_user`
   - **Nombre de host**: `localhost`
   - **Contraseña**: `colesoa_pass123`
   - **Vuelva a escribir**: `colesoa_pass123`
4. Scroll hacia abajo a "Base de datos para la cuenta de usuario"
5. Marca: "Conceder todos los privilegios para la base de datos colegio_soa_db"
6. Haz clic en "Continuar"
7. Deberías ver: "Se ha añadido el nuevo usuario"

---

## PARTE 2: CONFIGURAR MONGODB CON COMPASS

### Paso 1: Verificar MongoDB

1. Abre PowerShell
2. Ejecuta:
   ```powershell
   Get-Service MongoDB
   ```
3. Debería decir: `Status: Running`
4. Si dice "Stopped", ejecuta:
   ```powershell
   Start-Service MongoDB
   ```

### Paso 2: Abrir MongoDB Compass

1. Busca "MongoDB Compass" en el menú de inicio
2. Ábrelo
3. Si te pregunta por telemetría, selecciona lo que prefieras

### Paso 3: Conectarse a MongoDB

1. En la pantalla de conexión, deberías ver:
   ```
   mongodb://localhost:27017
   ```
2. Haz clic en "Connect"
3. Deberías ver el panel principal de Compass

### Paso 4: Crear la Base de Datos

1. En el panel izquierdo, haz clic en "CREATE DATABASE" (botón verde)
2. Completa:
   - **Database Name**: `colegio_soa_docs`
   - **Collection Name**: `files`
3. Haz clic en "Create Database"

### Paso 5: Crear Colecciones Adicionales

1. En el panel izquierdo, haz clic en la base de datos `colegio_soa_docs`
2. Haz clic en el botón "+" junto a "Collections"
3. Crea estas colecciones:

   **Colección 1:**
   - Collection Name: `reports`
   - Haz clic en "Create Collection"

   **Colección 2:**
   - Collection Name: `audit_logs`
   - Haz clic en "Create Collection"

### Paso 6: Verificar Colecciones

Deberías ver 3 colecciones en `colegio_soa_docs`:
- files
- reports
- audit_logs

### Paso 7: Crear Índices (Opcional pero Recomendado)

1. Haz clic en la colección "files"
2. Haz clic en la pestaña "Indexes"
3. Haz clic en "CREATE INDEX"
4. En el campo de texto, escribe:
   ```json
   { "relatedTo": 1, "relatedId": 1 }
   ```
5. Haz clic en "Create Index"

Repite para estos índices adicionales:
- `{ "uploadedBy": 1 }`
- `{ "uploadedAt": -1 }`
- `{ "status": 1 }`

---

## PARTE 3: CONFIGURAR EL BACKEND

### Paso 1: Configurar Variables de Entorno

1. Abre PowerShell
2. Ve a la carpeta del backend:
   ```powershell
   cd C:\COLESOA\backend
   ```

3. Copia el archivo de ejemplo:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Abre el archivo .env:
   ```powershell
   notepad .env
   ```

5. Configúralo así:

```env
# Puerto del servidor
PORT=3000

# MySQL - XAMPP
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=colegio_soa_db
MYSQL_USER=colesoa_user
MYSQL_PASSWORD=colesoa_pass123

# MongoDB
MONGO_URI=mongodb://localhost:27017/colegio_soa_docs

# JWT
JWT_SECRET=mi_clave_secreta_super_segura_12345
JWT_EXPIRES_IN=24h

# Entorno
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# SMTP (déjalo vacío por ahora)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

6. Guarda y cierra (Ctrl+S)

### Paso 2: Instalar Dependencias

```powershell
# Asegúrate de estar en C:\COLESOA\backend
cd C:\COLESOA\backend

# Instalar dependencias
npm install
```

Espera a que termine (2-5 minutos).

### Paso 3: Probar la Conexión

```powershell
# Iniciar el servidor
npm run dev
```

Deberías ver:
```
Conectado a MySQL
Conectado a MongoDB
Servidor corriendo en http://localhost:3000
Ambiente: development
```

Si ves estos 3 mensajes: PERFECTO, las bases de datos están funcionando.

Si ves errores, continúa con la sección de solución de problemas.

---

## PARTE 4: CONFIGURAR Y LEVANTAR EL FRONTEND

### Paso 1: Configurar Frontend

1. Abre una NUEVA ventana de PowerShell
2. Ve al frontend:
   ```powershell
   cd C:\COLESOA\frontend
   ```

3. Copia el archivo .env:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Editar el .env:
   ```powershell
   notepad .env
   ```

5. Contenido:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Sistema de Matriculas - Colegio SOA
   VITE_APP_VERSION=1.0.0
   ```

6. Guarda y cierra

### Paso 2: Instalar Dependencias

```powershell
npm install
```

### Paso 3: Iniciar Frontend

```powershell
npm run dev
```

Deberías ver:
```
VITE v5.0.11  ready in 500 ms
Local: http://localhost:5173/
```

### Paso 4: Abrir en el Navegador

1. Abre tu navegador
2. Ve a: http://localhost:5173
3. Deberías ver la pantalla de LOGIN

### Paso 5: Probar Login

Usa estas credenciales:

**Administrador:**
```
Email: admin@colegiosoa.edu.pe
Password: Password123!
```

**Secretaria:**
```
Email: secretaria@colegiosoa.edu.pe
Password: Password123!
```

**Finanzas:**
```
Email: finanzas@colegiosoa.edu.pe
Password: Password123!
```

---

## RESUMEN DE VERIFICACIÓN

Marca lo que hayas completado:

### MySQL (XAMPP)
- [ ] XAMPP iniciado (Apache y MySQL en verde)
- [ ] Base de datos `colegio_soa_db` creada
- [ ] 8 tablas creadas
- [ ] 7 usuarios insertados
- [ ] Usuario `colesoa_user` creado
- [ ] Conectado desde phpMyAdmin

### MongoDB (Compass)
- [ ] MongoDB corriendo
- [ ] Base de datos `colegio_soa_docs` creada
- [ ] 3 colecciones creadas (files, reports, audit_logs)
- [ ] Conectado desde Compass

### Backend
- [ ] Archivo .env configurado
- [ ] Dependencias instaladas (node_modules existe)
- [ ] Backend corriendo sin errores
- [ ] Mensaje "Conectado a MySQL" visible
- [ ] Mensaje "Conectado a MongoDB" visible

### Frontend
- [ ] Archivo .env configurado
- [ ] Dependencias instaladas
- [ ] Frontend corriendo
- [ ] Página de login visible
- [ ] Login exitoso

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to MySQL"

**Verificación:**
```powershell
# Ver si MySQL está corriendo en XAMPP
# Debe estar en VERDE
```

**Solución 1:**
- Reinicia MySQL en XAMPP (Stop, luego Start)

**Solución 2:**
- Verifica usuario y contraseña en `.env`
- Debe coincidir con lo que creaste en phpMyAdmin

**Solución 3:**
- Si usas root sin contraseña:
```env
MYSQL_USER=root
MYSQL_PASSWORD=
```

### Error: "Cannot connect to MongoDB"

**Verificación:**
```powershell
Get-Service MongoDB
```

**Solución:**
```powershell
# Iniciar MongoDB
Start-Service MongoDB

# Verificar nuevamente
Get-Service MongoDB
```

### Error: "Port 3000 already in use"

```powershell
# Ver qué usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID [numero] /F
```

### Frontend no carga o muestra error

1. Verifica que el backend esté corriendo
2. Abre http://localhost:3000/api/health
3. Debería responder: `{"status":"ok",...}`

---

## PARA INICIAR EL SISTEMA CADA DÍA

### Orden de inicio:

1. **XAMPP**: Inicia Apache y MySQL (verde)
2. **MongoDB**: Verifica que esté corriendo
   ```powershell
   Get-Service MongoDB
   ```
3. **Backend** (Terminal 1):
   ```powershell
   cd C:\COLESOA\backend
   npm run dev
   ```
4. **Frontend** (Terminal 2):
   ```powershell
   cd C:\COLESOA\frontend
   npm run dev
   ```
5. **Navegador**: http://localhost:5173

---

## ESTRUCTURA DE LAS BASES DE DATOS

### MySQL (colegio_soa_db)
Almacena datos relacionales:
- Usuarios y roles
- Estudiantes
- Apoderados
- Grados y secciones
- Matrículas
- Pagos
- Configuración

### MongoDB (colegio_soa_docs)
Almacena documentos:
- Archivos subidos (metadata)
- Reportes generados
- Logs de auditoría
- Historial de actividades

Ambas bases de datos trabajan juntas:
- MySQL: Para datos estructurados y relaciones
- MongoDB: Para documentos, archivos y logs

---

Si tienes algún problema en cualquier paso, avísame exactamente en qué paso estás y qué error ves.
