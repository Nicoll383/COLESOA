# Guía de Despliegue con Docker - Sistema Colegio SOA

Esta guía te ayudará a desplegar el Sistema de Matrículas del Colegio SOA usando Docker Compose.

## Prerrequisitos

### Instalar Docker

**Windows:**
1. Descarga Docker Desktop desde [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Ejecuta el instalador
3. Reinicia tu computadora
4. Abre Docker Desktop y espera a que inicie

**macOS:**
1. Descarga Docker Desktop desde [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Arrastra Docker.app a Applications
3. Abre Docker desde Applications
4. Autoriza Docker cuando lo solicite

**Linux (Ubuntu/Debian):**
```bash
# Actualizar repositorios
sudo apt-get update

# Instalar dependencias
sudo apt-get install ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
sudo docker --version
sudo docker compose version
```

### Verificar Instalación

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker compose version
```

Deberías ver las versiones instaladas.

---

## Configuración Inicial

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Node Environment
NODE_ENV=production

# MySQL Configuration
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=colegio_soa_db
MYSQL_USER=colesoa_user
MYSQL_PASSWORD=tu_password_mysql_seguro

# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=tu_password_mongo_seguro
MONGO_DATABASE=colegio_soa_docs

# JWT Configuration
JWT_SECRET=tu_clave_jwt_muy_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

# SMTP Configuration (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

IMPORTANTE: Cambia TODAS las contraseñas por valores seguros en producción.

### 2. Verificar Estructura de Archivos

Asegúrate de tener esta estructura:

```
COLESOA/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
```

---

## Despliegue Completo (TODO EN UNO)

### Opción 1: Levantar Todo el Sistema

Este comando levanta TODOS los servicios de una vez:

```bash
# Desde la raíz del proyecto (COLESOA/)
docker compose up -d
```

Explicación de flags:
- `up`: Crea e inicia los contenedores
- `-d`: Modo detached (segundo plano)

### Qué hace este comando:

1. Descarga las imágenes necesarias (MySQL, MongoDB, Node, Nginx)
2. Construye las imágenes del backend y frontend
3. Crea una red para comunicación entre servicios
4. Crea volúmenes para persistencia de datos
5. Inicia todos los contenedores en orden:
   - MySQL (puerto 3306)
   - MongoDB (puerto 27017)
   - Backend (puerto 3000)
   - Frontend (puerto 5173)

### Ver el Progreso

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
docker compose logs -f mongodb
```

Presiona `Ctrl+C` para salir de los logs (no detiene los contenedores).

### Verificar que Todo Esté Corriendo

```bash
# Ver estado de todos los servicios
docker compose ps
```

Deberías ver algo como:

```
NAME                 STATUS    PORTS
colesoa_backend      Up        0.0.0.0:3000->3000/tcp
colesoa_frontend     Up        0.0.0.0:5173->5173/tcp
colesoa_mysql        Up        0.0.0.0:3306->3306/tcp
colesoa_mongodb      Up        0.0.0.0:27017->27017/tcp
```

---

## Ejecutar Migraciones y Seed

### Paso 1: Esperar a que MySQL Esté Listo

```bash
# Ver logs de MySQL hasta que vea "ready for connections"
docker compose logs mysql | grep "ready for connections"
```

### Paso 2: Ejecutar Migraciones

```bash
# Ejecutar migraciones en el contenedor del backend
docker compose exec backend npm run migrate
```

### Paso 3: Cargar Datos de Prueba

```bash
# Ejecutar seed
docker compose exec backend npm run seed
```

---

## Acceder al Sistema

Una vez que todo esté corriendo:

### Frontend
Abre tu navegador y ve a:
```
http://localhost:5173
```

### Backend API
```
http://localhost:3000/api/health
```

### Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@colegiosoa.edu.pe | Password123! |
| Secretaria | secretaria@colegiosoa.edu.pe | Password123! |
| Finanzas | finanzas@colegiosoa.edu.pe | Password123! |
| Docente | docente1@colegiosoa.edu.pe | Password123! |
| Padre | padre1@example.com | Password123! |

---

## Comandos Útiles de Docker Compose

### Gestión de Servicios

```bash
# Iniciar servicios
docker compose up -d

# Detener servicios (mantiene los datos)
docker compose stop

# Detener y eliminar contenedores (mantiene los datos en volúmenes)
docker compose down

# Detener y eliminar TODO (contenedores, volúmenes, redes)
docker compose down -v

# Reiniciar todos los servicios
docker compose restart

# Reiniciar un servicio específico
docker compose restart backend
```

### Ver Logs

```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio
docker compose logs backend

# Ver últimas 50 líneas
docker compose logs --tail=50
```

### Ejecutar Comandos en Contenedores

```bash
# Abrir terminal en el backend
docker compose exec backend sh

# Ejecutar comando en el backend
docker compose exec backend npm run migrate

# Acceder a MySQL
docker compose exec mysql mysql -u colesoa_user -p colegio_soa_db

# Acceder a MongoDB
docker compose exec mongodb mongosh -u admin -p
```

### Reconstruir Imágenes

Si haces cambios en el código:

```bash
# Reconstruir backend
docker compose build backend

# Reconstruir frontend
docker compose build frontend

# Reconstruir todo
docker compose build

# Reconstruir y reiniciar
docker compose up -d --build
```

### Ver Uso de Recursos

```bash
# Ver uso de CPU, memoria, etc.
docker stats
```

---

## Solución de Problemas

### Problema 1: Puerto ya en uso

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solución:**
```bash
# Opción A: Detener el servicio que usa el puerto
# En Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# En Mac/Linux
lsof -ti:3000 | xargs kill

# Opción B: Cambiar el puerto en docker-compose.yml
# Editar la sección ports del servicio problemático
```

### Problema 2: Contenedor se detiene inmediatamente

**Solución:**
```bash
# Ver logs del contenedor
docker compose logs [servicio]

# Ver logs completos
docker compose logs --tail=100 [servicio]

# Reiniciar servicio
docker compose restart [servicio]
```

### Problema 3: Error de conexión a base de datos

**Solución:**
```bash
# Verificar que MySQL/MongoDB estén corriendo
docker compose ps

# Ver logs de la base de datos
docker compose logs mysql
docker compose logs mongodb

# Reiniciar base de datos
docker compose restart mysql
docker compose restart mongodb

# Esperar a que estén "healthy"
docker compose ps | grep healthy
```

### Problema 4: Frontend no carga

**Solución:**
```bash
# Ver logs del frontend
docker compose logs frontend

# Verificar que el backend esté corriendo
curl http://localhost:3000/api/health

# Reconstruir frontend
docker compose build frontend
docker compose up -d frontend
```

### Problema 5: Cambios no se reflejan

**Solución:**
```bash
# Reconstruir y reiniciar
docker compose down
docker compose build
docker compose up -d
```

---

## Backup y Restauración

### Backup de MySQL

```bash
# Crear backup
docker compose exec mysql mysqldump -u root -p colegio_soa_db > backup_mysql_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T mysql mysql -u root -p colegio_soa_db < backup_mysql_20250101.sql
```

### Backup de MongoDB

```bash
# Crear backup
docker compose exec mongodb mongodump --uri="mongodb://admin:password@localhost:27017/colegio_soa_docs" --out=/backup

# Copiar backup a host
docker compose cp mongodb:/backup ./mongodb_backup

# Restaurar backup
docker compose exec mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/colegio_soa_docs" /backup/colegio_soa_docs
```

### Backup de Volúmenes

```bash
# Ver volúmenes
docker volume ls

# Backup completo de volumen MySQL
docker run --rm -v colesoa_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data
```

---

## Despliegue en Producción

### Configuraciones Adicionales para Producción

1. **Usar SSL/HTTPS**:
   - Obtén certificados SSL (Let's Encrypt)
   - Configura Nginx como reverse proxy
   - Activa el perfil de producción: `docker compose --profile production up -d`

2. **Variables de Entorno Seguras**:
   - Nunca subas el archivo `.env` a Git
   - Usa secretos seguros y únicos
   - Cambia TODAS las contraseñas por defecto

3. **Configurar Firewall**:
   ```bash
   # Solo permitir puertos necesarios
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Configurar Backups Automáticos**:
   - Crea un cron job para backups diarios
   - Guarda backups en ubicación externa
   - Prueba la restauración regularmente

5. **Monitoreo**:
   - Configura logs centralizados
   - Monitorea uso de recursos
   - Configura alertas de errores

---

## Actualizar el Sistema

```bash
# 1. Hacer backup
docker compose exec mysql mysqldump -u root -p colegio_soa_db > backup.sql

# 2. Descargar cambios del repositorio
git pull

# 3. Detener servicios
docker compose down

# 4. Reconstruir imágenes
docker compose build

# 5. Iniciar servicios
docker compose up -d

# 6. Ver logs
docker compose logs -f
```

---

## Comandos de Referencia Rápida

```bash
# Iniciar todo
docker compose up -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener todo
docker compose down

# Reconstruir y reiniciar
docker compose up -d --build

# Ejecutar migraciones
docker compose exec backend npm run migrate

# Ejecutar seed
docker compose exec backend npm run seed

# Acceder a contenedor
docker compose exec backend sh

# Ver uso de recursos
docker stats
```

---

## Resumen

Con Docker Compose puedes:

- Levantar TODO el sistema con UN solo comando
- No preocuparte por instalar MySQL, MongoDB, Node.js, etc.
- Tener el mismo entorno en desarrollo y producción
- Escalar servicios fácilmente
- Hacer backups y restauraciones simples

Para desplegar el sistema completo:

```bash
# 1. Configurar .env
cp .env.example .env
nano .env  # Editar variables

# 2. Levantar servicios
docker compose up -d

# 3. Ejecutar migraciones
docker compose exec backend npm run migrate

# 4. Cargar datos de prueba
docker compose exec backend npm run seed

# 5. Abrir navegador
# http://localhost:5173
```

LISTO - Tu sistema está corriendo completamente en Docker.
