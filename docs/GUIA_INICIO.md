# 🚀 Guía de Inicio - Sistema Colegio SOA

Esta guía te ayudará a configurar y ejecutar el Sistema de Matrículas del Colegio SOA en tu máquina local.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- **npm** o **yarn** (viene con Node.js)
- **MySQL** (v8.0 o superior) - [Descargar](https://dev.mysql.com/downloads/)
- **MongoDB** (v6.0 o superior) - [Descargar](https://www.mongodb.com/try/download/community)
- **Git** - [Descargar](https://git-scm.com/)

### Verificar Instalaciones

Abre una terminal y ejecuta:

```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
mysql --version   # Debe mostrar 8.0.x o superior
mongod --version  # Debe mostrar 6.0.x o superior
git --version     # Debe mostrar 2.x.x o superior
```

## 📥 Clonar el Repositorio

```bash
# Si aún no has clonado el repositorio
git clone <URL-del-repositorio>
cd COLESOA

# Verificar que estás en la branch correcta
git checkout claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

## 🗄️ Configurar Bases de Datos

### MySQL

1. **Iniciar el servicio de MySQL**:
   ```bash
   # Linux
   sudo systemctl start mysql

   # macOS (con Homebrew)
   brew services start mysql

   # Windows
   # Usar MySQL Workbench o Services
   ```

2. **Crear la base de datos**:
   ```bash
   mysql -u root -p
   ```

   Luego en el prompt de MySQL:
   ```sql
   CREATE DATABASE colegio_soa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'colesoa_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
   GRANT ALL PRIVILEGES ON colegio_soa_db.* TO 'colesoa_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### MongoDB

1. **Iniciar el servicio de MongoDB**:
   ```bash
   # Linux
   sudo systemctl start mongod

   # macOS (con Homebrew)
   brew services start mongodb-community

   # Windows
   # Usar MongoDB Compass o Services
   ```

2. **Crear la base de datos** (se creará automáticamente al conectar):
   ```bash
   mongosh
   ```

   En el shell de MongoDB:
   ```javascript
   use colegio_soa_docs
   db.createUser({
     user: "colesoa_user",
     pwd: "tu_password_seguro",
     roles: [{ role: "readWrite", db: "colegio_soa_docs" }]
   })
   exit
   ```

## ⚙️ Configurar Backend

1. **Ir a la carpeta del backend**:
   ```bash
   cd backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env
   ```

   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Puerto del servidor
   PORT=3000

   # MySQL
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=colegio_soa_db
   MYSQL_USER=colesoa_user
   MYSQL_PASSWORD=tu_password_seguro

   # MongoDB
   MONGO_URI=mongodb://colesoa_user:tu_password_seguro@localhost:27017/colegio_soa_docs

   # JWT
   JWT_SECRET=tu_clave_secreta_muy_segura_aqui
   JWT_EXPIRES_IN=24h

   # Entorno
   NODE_ENV=development
   ```

4. **Ejecutar migraciones de base de datos**:
   ```bash
   npm run migrate
   ```

5. **Cargar datos de prueba (opcional)**:
   ```bash
   npm run seed
   ```

6. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   ✓ Servidor corriendo en http://localhost:3000
   ✓ Conectado a MySQL
   ✓ Conectado a MongoDB
   ```

## 🎨 Configurar Frontend

1. **Abrir una nueva terminal** y ir a la carpeta frontend:
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env
   ```

   Editar el archivo `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Sistema de Matrículas - Colegio SOA
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   ✓ Local: http://localhost:5173/
   ```

## 🌐 Acceder al Sistema

Abre tu navegador y ve a:
```
http://localhost:5173
```

### Usuarios de Prueba (si ejecutaste el seed)

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | admin@colegiosoa.edu.pe | Admin123! |
| Secretaría | secretaria@colegiosoa.edu.pe | Secret123! |
| Finanzas | finanzas@colegiosoa.edu.pe | Finance123! |
| Docente | docente@colegiosoa.edu.pe | Docente123! |
| Padre | padre@example.com | Padre123! |

## 📁 Estructura de Desarrollo

```
COLESOA/
├── backend/          # Servidor Node.js (Puerto 3000)
│   └── src/
│       ├── server.js      # Punto de entrada
│       ├── config/        # Configuraciones
│       ├── models/        # Modelos de BD
│       ├── controllers/   # Lógica de endpoints
│       ├── routes/        # Rutas de API
│       └── middlewares/   # Auth, validaciones
│
└── frontend/         # App Vue.js (Puerto 5173)
    └── src/
        ├── main.js        # Punto de entrada
        ├── App.vue        # Componente raíz
        ├── views/         # Páginas
        ├── components/    # Componentes
        ├── router/        # Rutas del frontend
        └── stores/        # Estado global (Pinia)
```

## 🛠️ Comandos Útiles

### Backend
```bash
cd backend

npm run dev          # Modo desarrollo con hot-reload
npm start           # Modo producción
npm test            # Ejecutar tests
npm run migrate     # Ejecutar migraciones
npm run seed        # Cargar datos de prueba
npm run lint        # Verificar código
```

### Frontend
```bash
cd frontend

npm run dev         # Modo desarrollo con hot-reload
npm run build       # Compilar para producción
npm run preview     # Previsualizar build de producción
npm test            # Ejecutar tests
npm run lint        # Verificar código
```

## 🔍 Verificar que Todo Funciona

### 1. Backend funcionando
```bash
# En otra terminal
curl http://localhost:3000/api/health

# Debería responder:
# {"status":"ok","timestamp":"..."}
```

### 2. MySQL conectado
```bash
mysql -u colesoa_user -p colegio_soa_db -e "SHOW TABLES;"
```

### 3. MongoDB conectado
```bash
mongosh "mongodb://colesoa_user:tu_password@localhost:27017/colegio_soa_docs" --eval "db.stats()"
```

## ❌ Solución de Problemas

### Error: "Port 3000 already in use"
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Error: "Cannot connect to MySQL"
- Verifica que MySQL esté corriendo: `sudo systemctl status mysql`
- Verifica credenciales en `.env`
- Verifica que la base de datos existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo: `sudo systemctl status mongod`
- Verifica la URI en `.env`
- Intenta conectar manualmente: `mongosh`

### Error: "npm install fails"
- Limpia caché: `npm cache clean --force`
- Elimina node_modules: `rm -rf node_modules package-lock.json`
- Reinstala: `npm install`

### Frontend no carga
- Verifica que el backend esté corriendo en puerto 3000
- Verifica CORS en el backend
- Revisa la consola del navegador (F12)

## 📚 Próximos Pasos

Una vez que tengas todo funcionando:

1. ✅ Familiarízate con la estructura del proyecto
2. ✅ Revisa la [documentación de la API](./API.md)
3. ✅ Revisa los [esquemas de base de datos](./DATABASE.md)
4. ✅ Lee la [guía de Git](./GUIA_GIT.md) para contribuir
5. ✅ Comienza a desarrollar nuevas funcionalidades

## 🆘 Necesitas Ayuda?

- Revisa la documentación en `/docs`
- Consulta los logs del servidor
- Verifica que todas las dependencias estén instaladas
- Asegúrate de que las bases de datos estén corriendo

## 🎯 Desarrollo de Funcionalidades

Ver las secciones específicas en la documentación:
- Módulo de Matrículas
- Módulo de Pagos
- Sistema de Usuarios y Roles
- Panel de Administración
- Portal de Padres

¡Listo para comenzar a desarrollar! 🚀
