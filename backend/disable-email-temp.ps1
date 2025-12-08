# Script temporal para deshabilitar el servicio de email
# Esto permite que el servidor inicie mientras solucionamos el problema de nodemailer

Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "  Deshabilitando Email Service Temporalmente" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

$emailService = "src/services/email.service.js"
$emailServiceBackup = "src/services/email.service.js.backup"
$emailServiceMock = "src/services/email.service.mock.js"

# Hacer backup del email service original
if (Test-Path $emailService) {
    Write-Host "Creando backup del email service original..." -ForegroundColor Cyan
    Copy-Item $emailService $emailServiceBackup -Force
    Write-Host "✓ Backup creado: $emailServiceBackup" -ForegroundColor Green
}

# Copiar el mock al lugar del servicio real
if (Test-Path $emailServiceMock) {
    Write-Host "Activando email service mock..." -ForegroundColor Cyan
    Copy-Item $emailServiceMock $emailService -Force
    Write-Host "✓ Email service deshabilitado temporalmente" -ForegroundColor Green
} else {
    Write-Host "✗ No se encontró el archivo mock" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  Servidor listo para iniciar" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- El servidor iniciará sin problemas" -ForegroundColor White
Write-Host "- Los emails NO se enviarán (solo se verán en consola)" -ForegroundColor White
Write-Host "- Tu archivo original está en: $emailServiceBackup" -ForegroundColor White
Write-Host ""
Write-Host "Para restaurar el email service:" -ForegroundColor Yellow
Write-Host "  .\enable-email.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
