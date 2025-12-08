# Configuración del Módulo de Emails

## Descripción
El sistema utiliza **nodemailer** para enviar emails a través de SMTP. Los emails se envían en los siguientes casos:

1. **Credenciales de Matrícula**: Cuando se confirma una matrícula, se envían las credenciales de acceso al padre y al estudiante.
2. **Notificaciones de Documentos**: Cuando un documento es aprobado o rechazado por la secretaría.

## Configuración con Gmail

### Paso 1: Crear una Contraseña de Aplicación en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Navega a **Seguridad**
3. En "Cómo inicias sesión en Google", activa la **Verificación en dos pasos** (si no la tienes activada)
4. Una vez activada, busca **Contraseñas de aplicaciones**
5. Selecciona "Correo" y "Otro (nombre personalizado)"
6. Escribe "Sistema SOA" o un nombre descriptivo
7. Google generará una contraseña de 16 caracteres
8. **Copia esta contraseña** (no la compartas con nadie)

### Paso 2: Configurar las Variables de Entorno

Crea o edita el archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Email - SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de aplicación de 16 caracteres
EMAIL_FROM=Sistema SOA <noreply@colesoa.edu.pe>
FRONTEND_LOGIN_URL=http://localhost:5173/login
```

**Importante:**
- `SMTP_USER`: Tu dirección de Gmail completa
- `SMTP_PASSWORD`: La contraseña de aplicación generada (no tu contraseña normal de Gmail)
- `EMAIL_FROM`: El nombre y email que aparecerá como remitente

### Paso 3: Reiniciar el Servidor

Después de configurar las variables de entorno, reinicia el servidor:

```bash
cd backend
npm run dev
```

Deberías ver el mensaje: `✅ Servicio de email listo para enviar mensajes`

## Configuración con Otros Proveedores

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@outlook.com
SMTP_PASSWORD=tu_contraseña
```

### Zoho Mail

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@zoho.com
SMTP_PASSWORD=tu_contraseña
```

### Servidor SMTP Personalizado

```env
SMTP_HOST=smtp.tuservidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_usuario
SMTP_PASSWORD=tu_contraseña
```

## Tipos de Emails

### 1. Credenciales de Matrícula

**Cuándo se envía:** Cuando se confirma una matrícula y se crean las cuentas de usuario.

**Destinatario:** Email del padre/apoderado

**Contenido:**
- Código de matrícula
- Usuario y contraseña del padre
- Usuario y contraseña del estudiante
- Link al portal de login
- Instrucciones para cambiar contraseña
- Recordatorio sobre documentos requeridos

**Método:** `emailService.enviarCredencialesMatricula()`

### 2. Notificación de Documento Aprobado

**Cuándo se envía:** Cuando la secretaria aprueba un documento.

**Destinatario:** Email del padre/apoderado

**Contenido:**
- Nombre del documento
- Nombre del estudiante
- Estado: Aprobado
- Link al portal

**Método:** `emailService.enviarNotificacionDocumento()`

### 3. Notificación de Documento Rechazado

**Cuándo se envía:** Cuando la secretaria rechaza un documento.

**Destinatario:** Email del padre/apoderado

**Contenido:**
- Nombre del documento
- Nombre del estudiante
- Estado: Rechazado
- Observaciones del rechazo
- Link al portal para volver a subir

**Método:** `emailService.enviarNotificacionDocumento()`

## Pruebas

### Probar el Envío de Emails

Puedes crear un script de prueba en `backend/test-email.js`:

```javascript
require('dotenv').config();
const emailService = require('./src/services/email.service');

async function testEmail() {
  try {
    const result = await emailService.enviarCredencialesMatricula({
      padreEmail: 'tu_email_de_prueba@gmail.com',
      padreNombre: 'Juan',
      padreApellido: 'Pérez',
      padreUsuario: 'jperez1234',
      padrePassword: 'TempPass123',
      estudianteNombre: 'María',
      estudianteApellido: 'Pérez',
      estudianteUsuario: 'mperez1234',
      estudiantePassword: 'TempPass456',
      codigoMatricula: 'MAT-2024-001'
    });

    console.log('Email enviado exitosamente:', result);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

testEmail();
```

Ejecuta el script:

```bash
node test-email.js
```

## Solución de Problemas

### Error: "Invalid login"

**Causa:** Usuario o contraseña incorrectos.

**Solución:**
- Verifica que `SMTP_USER` sea tu email completo
- Verifica que `SMTP_PASSWORD` sea la contraseña de aplicación (no tu contraseña normal)
- En Gmail, asegúrate de tener la verificación en dos pasos activada

### Error: "Connection timeout"

**Causa:** No se puede conectar al servidor SMTP.

**Solución:**
- Verifica que `SMTP_HOST` y `SMTP_PORT` sean correctos
- Verifica tu conexión a internet
- Verifica que tu firewall no esté bloqueando el puerto 587

### Error: "self signed certificate"

**Causa:** Problema con certificados SSL.

**Solución:**
- Asegúrate de que `SMTP_SECURE=false` para puerto 587
- Si usas puerto 465, cambia a `SMTP_SECURE=true`

### Los emails no llegan

**Posibles causas:**
1. Revisa la carpeta de spam
2. Verifica que el email del destinatario sea correcto
3. Revisa los logs del servidor para ver si hay errores
4. Verifica que el servicio SMTP esté funcionando

## Métodos Helper

### Generar Usuario

```javascript
const EmailService = require('./services/email.service');

const usuario = EmailService.generarUsuario('Juan', 'Pérez García', '12345678');
// Resultado: "jpgarcia5678"
```

### Generar Contraseña

```javascript
const EmailService = require('./services/email.service');

const password = EmailService.generarPassword(10);
// Resultado: "aB3xK9mN2p" (aleatorio)
```

## Plantillas HTML

Las plantillas de email incluyen:
- **Diseño responsive**: Se adaptan a dispositivos móviles
- **Estilos inline**: Compatibles con todos los clientes de email
- **Gradientes y colores**: Diseño profesional y atractivo
- **Botones de acción**: Links directos al portal
- **Advertencias visuales**: Resaltan información importante

## Seguridad

### Buenas Prácticas

1. **Nunca compartas** tu contraseña de aplicación de Gmail
2. **No hagas commit** del archivo `.env` al repositorio
3. **Usa variables de entorno** en producción
4. **Cambia las contraseñas** regularmente
5. **Usa contraseñas diferentes** para desarrollo y producción

### Variables de Entorno en Producción

En servidores de producción (Heroku, AWS, etc.), configura las variables de entorno directamente en el panel de control del servidor, no en archivos `.env`.

## Límites de Envío

### Gmail
- **500 emails por día** para cuentas gratuitas
- **2000 emails por día** para Google Workspace

Si necesitas enviar más emails, considera usar servicios especializados como:
- SendGrid
- Mailgun
- Amazon SES
- Postmark

## Monitoreo

Los emails fallidos no detienen la operación principal. Los errores se registran en la consola:

```javascript
console.error('Error al enviar email:', error);
```

Para producción, considera implementar:
- Sistema de logs (Winston, Morgan)
- Alertas de errores (Sentry, Rollbar)
- Cola de emails (Bull, RabbitMQ)

## Preguntas Frecuentes

**P: ¿Puedo usar mi contraseña normal de Gmail?**
R: No. Gmail requiere contraseñas de aplicación para mayor seguridad.

**P: ¿Los emails se envían en tiempo real?**
R: Sí, se envían inmediatamente después de la acción (aprobación, rechazo, etc.).

**P: ¿Qué pasa si falla el envío de email?**
R: El error se registra en los logs pero no afecta la operación principal (el documento se aprueba/rechaza de todas formas).

**P: ¿Puedo personalizar las plantillas de email?**
R: Sí, edita los métodos en `backend/src/services/email.service.js`.

**P: ¿Puedo enviar emails a múltiples destinatarios?**
R: Sí, modifica el parámetro `to` en el método `sendEmail()` para incluir múltiples emails separados por comas.
