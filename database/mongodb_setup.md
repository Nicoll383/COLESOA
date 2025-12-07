# CONFIGURACION DE MONGODB - COLEGIO SOA

## Base de Datos: colegio_soa_docs

Esta base de datos MongoDB almacena:
- Archivos y documentos (metadata)
- Reportes generados
- Logs del sistema
- Historial de actividades

## INSTRUCCIONES PARA MONGODB COMPASS

### 1. Conectarse a MongoDB

1. Abre MongoDB Compass
2. En "New Connection", usa esta URI:
   ```
   mongodb://localhost:27017
   ```
3. Haz clic en "Connect"

### 2. Crear la Base de Datos

1. En el panel izquierdo, haz clic en "CREATE DATABASE"
2. Database Name: `colegio_soa_docs`
3. Collection Name: `files`
4. Haz clic en "Create Database"

### 3. Crear Colecciones Adicionales

Haz clic en la base de datos `colegio_soa_docs` y crea estas colecciones:

1. **files** (ya creada)
   - Almacena metadata de archivos subidos (fotos, documentos, recibos)

2. **reports**
   - Para crear: Haz clic en "CREATE COLLECTION"
   - Collection Name: `reports`
   - Haz clic en "Create"
   - Almacena reportes generados

3. **audit_logs**
   - Para crear: Haz clic en "CREATE COLLECTION"
   - Collection Name: `audit_logs`
   - Haz clic en "Create"
   - Almacena logs de auditoría del sistema

### 4. Crear Usuario (Opcional)

Si quieres crear un usuario específico:

1. En MongoDB Compass, ve a la base de datos `admin`
2. Abre la shell de Mongo (icono >_mongosh en la parte inferior)
3. Ejecuta:

```javascript
use colegio_soa_docs

db.createUser({
  user: "colesoa_user",
  pwd: "colesoa_pass123",
  roles: [
    { role: "readWrite", db: "colegio_soa_docs" }
  ]
})
```

4. Actualiza el archivo `.env` del backend:
```
MONGO_URI=mongodb://colesoa_user:colesoa_pass123@localhost:27017/colegio_soa_docs
```

## ESTRUCTURA DE COLECCIONES

### Colección: files

Ejemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "originalName": "foto_estudiante.jpg",
  "fileName": "photos-1234567890-123456789.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "path": "/uploads/photos/photos-1234567890-123456789.jpg",
  "category": "student_photo",
  "relatedTo": "student",
  "relatedId": 1,
  "uploadedBy": 2,
  "uploadedAt": ISODate("2025-01-15T10:30:00.000Z"),
  "status": "active"
}
```

### Colección: reports

Ejemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "title": "Reporte de Matrículas 2025",
  "type": "enrollment",
  "format": "excel",
  "filters": {
    "año_escolar": 2025,
    "grado_id": 1
  },
  "filePath": "/reports/enrollment_2025_01_15.xlsx",
  "generatedBy": 1,
  "generatedAt": ISODate("2025-01-15T15:00:00.000Z"),
  "expiresAt": ISODate("2025-01-22T15:00:00.000Z"),
  "status": "completed"
}
```

### Colección: audit_logs

Ejemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "action": "create_enrollment",
  "userId": 2,
  "userName": "María González",
  "userRole": "secretaria",
  "resourceType": "matricula",
  "resourceId": 5,
  "details": {
    "estudiante_id": 1,
    "codigo_matricula": "MAT2025001",
    "monto": 500
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": ISODate("2025-01-15T09:15:30.000Z")
}
```

## DATOS DE PRUEBA (Opcional)

Si quieres agregar datos de prueba, abre mongosh y ejecuta:

```javascript
use colegio_soa_docs

// Insertar documento de prueba en files
db.files.insertOne({
  originalName: "documento_ejemplo.pdf",
  fileName: "documents-1234567890-123.pdf",
  mimeType: "application/pdf",
  size: 125678,
  path: "/uploads/documents/documents-1234567890-123.pdf",
  category: "document",
  relatedTo: "student",
  relatedId: 1,
  uploadedBy: 2,
  uploadedAt: new Date(),
  status: "active"
})

// Verificar
db.files.find().pretty()
```

## ÍNDICES RECOMENDADOS

Para mejorar el rendimiento:

```javascript
// Índices para files
db.files.createIndex({ "relatedTo": 1, "relatedId": 1 })
db.files.createIndex({ "uploadedBy": 1 })
db.files.createIndex({ "uploadedAt": -1 })
db.files.createIndex({ "status": 1 })

// Índices para reports
db.reports.createIndex({ "generatedBy": 1 })
db.reports.createIndex({ "generatedAt": -1 })
db.reports.createIndex({ "type": 1 })

// Índices para audit_logs
db.audit_logs.createIndex({ "userId": 1 })
db.audit_logs.createIndex({ "timestamp": -1 })
db.audit_logs.createIndex({ "action": 1 })
```

## VERIFICACIÓN

Para verificar que todo está correcto:

```javascript
// Mostrar todas las bases de datos
show dbs

// Usar la base de datos
use colegio_soa_docs

// Mostrar colecciones
show collections

// Deberías ver:
// - files
// - reports
// - audit_logs

// Ver estadísticas
db.stats()
```

## RESPALDO Y RESTAURACIÓN

### Hacer backup:
```bash
mongodump --db colegio_soa_docs --out ./backup
```

### Restaurar backup:
```bash
mongorestore --db colegio_soa_docs ./backup/colegio_soa_docs
```

## CONEXIÓN DESDE LA APLICACIÓN

El backend se conecta con esta URI (en `.env`):
```
MONGO_URI=mongodb://localhost:27017/colegio_soa_docs
```

O con usuario:
```
MONGO_URI=mongodb://colesoa_user:colesoa_pass123@localhost:27017/colegio_soa_docs
```
