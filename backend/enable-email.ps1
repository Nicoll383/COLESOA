# Script para restaurar el servicio de email original

Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "  Restaurando Email Service Original" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

$emailService = "src/services/email.service.js"
$emailServiceBackup = "src/services/email.service.js.backup"

# Restaurar el email service original desde el backup
if (Test-Path $emailServiceBackup) {
    Write-Host "Restaurando email service original..." -ForegroundColor Cyan
    Copy-Item $emailServiceBackup $emailService -Force
    Write-Host "✓ Email service restaurado" -ForegroundColor Green

    # Eliminar el backup
    Remove-Item $emailServiceBackup -Force
    Write-Host "✓ Backup eliminado" -ForegroundColor Green
} else {
    Write-Host "✗ No se encontró el backup" -ForegroundColor Red
    Write-Host "El archivo original podría haber sido eliminado" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  Email Service Restaurado" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Asegúrate de que nodemailer esté instalado" -ForegroundColor Yellow
Write-Host "  npm install nodemailer@6.9.7" -ForegroundColor Cyan
Write-Host ""
Write-Host "Luego reinicia el servidor:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
