# Solución al Error de Nodemailer

## Error
```
TypeError: nodemailer.createTransporter is not a function
```

## Solución

### Opción 1: Reinstalar dependencias (Recomendado)

Ejecuta estos comandos en PowerShell en la carpeta `backend`:

```powershell
# 1. Eliminar node_modules y package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 2. Reinstalar todas las dependencias
npm install

# 3. Verificar que nodemailer esté instalado
npm list nodemailer

# 4. Iniciar el servidor
npm run dev
```

### Opción 2: Instalar solo nodemailer

Si solo falta nodemailer:

```powershell
npm install nodemailer@^6.9.7
npm run dev
```

### Opción 3: Limpiar caché de npm

Si los anteriores no funcionan:

```powershell
# Limpiar caché
npm cache clean --force

# Eliminar node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstalar
npm install

# Iniciar servidor
npm run dev
```

## Verificación

Después de la instalación, deberías ver:

```
✅ Servicio de email listo para enviar mensajes
```

Si ves este mensaje, el módulo de email está funcionando correctamente.

## Nota sobre .env

Recuerda que también necesitas configurar el archivo `.env` con tus credenciales SMTP. Crea el archivo `backend/.env` copiando de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Luego edita `.env` con tus credenciales de Gmail.
