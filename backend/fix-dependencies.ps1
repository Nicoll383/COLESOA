# Script de reparación para errores de dependencias
# Ejecutar en PowerShell desde la carpeta C:\COLESOA\backend

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Reparando dependencias del Backend" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Pull latest changes
Write-Host "Paso 1: Actualizando código desde el repositorio..." -ForegroundColor Yellow
git pull origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1

# Paso 2: Eliminar node_modules
Write-Host "`nPaso 2: Eliminando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "node_modules no existe (OK)" -ForegroundColor Green
}

# Paso 3: Eliminar package-lock.json
Write-Host "`nPaso 3: Eliminando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "package-lock.json eliminado" -ForegroundColor Green
} else {
    Write-Host "package-lock.json no existe (OK)" -ForegroundColor Green
}

# Paso 4: Limpiar caché de npm
Write-Host "`nPaso 4: Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "Caché limpiado" -ForegroundColor Green

# Paso 5: Reinstalar dependencias
Write-Host "`nPaso 5: Instalando dependencias..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Gray
npm install

# Paso 6: Verificar nodemailer
Write-Host "`nPaso 6: Verificando nodemailer..." -ForegroundColor Yellow
$nodemailerCheck = npm list nodemailer 2>&1
if ($nodemailerCheck -match "nodemailer@") {
    Write-Host "✓ nodemailer instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "✗ nodemailer NO instalado" -ForegroundColor Red
    Write-Host "Intentando instalación manual..." -ForegroundColor Yellow
    npm install nodemailer@^6.9.7
}

# Paso 7: Verificar express-fileupload
Write-Host "`nPaso 7: Verificando express-fileupload..." -ForegroundColor Yellow
$fileuploadCheck = npm list express-fileupload 2>&1
if ($fileuploadCheck -match "express-fileupload@") {
    Write-Host "✓ express-fileupload instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "✗ express-fileupload NO instalado" -ForegroundColor Red
    Write-Host "Intentando instalación manual..." -ForegroundColor Yellow
    npm install express-fileupload@^1.4.3
}

# Paso 8: Crear archivo .env si no existe
Write-Host "`nPaso 8: Verificando archivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env ya existe" -ForegroundColor Green
} else {
    Write-Host "Creando .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env creado. IMPORTANTE: Edita este archivo con tus credenciales" -ForegroundColor Green
}

# Resumen final
Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "  Reparación completada" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Edita el archivo .env con tus credenciales de MySQL y SMTP" -ForegroundColor White
Write-Host "2. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "3. Deberías ver el mensaje: '✅ Servicio de email listo para enviar mensajes'" -ForegroundColor White
Write-Host ""
Write-Host "Si aún tienes problemas, consulta FIX_NODEMAILER.md" -ForegroundColor Gray
