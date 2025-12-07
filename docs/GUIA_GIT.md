# 📘 Guía de Git - Sistema Colegio SOA

Esta guía te ayudará a trabajar con Git en el proyecto del Sistema de Matrículas del Colegio SOA.

## 🌿 Branch de Desarrollo

Estamos trabajando en la branch:
```
claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

## 🔄 Flujo de Trabajo Básico

### 1. Verificar el Estado del Repositorio

Antes de hacer cualquier cambio, verifica en qué branch estás y el estado de tus archivos:

```bash
# Ver branch actual y archivos modificados
git status

# Ver qué branch tienes localmente
git branch

# Ver todas las branches (incluyendo remotas)
git branch -a
```

### 2. Hacer Cambios en el Código

Después de modificar, crear o eliminar archivos:

```bash
# Ver qué archivos cambiaron
git status

# Ver los cambios en detalle
git diff
```

### 3. Agregar Cambios al Staging Area

```bash
# Agregar un archivo específico
git add nombre-del-archivo.js

# Agregar todos los archivos modificados
git add .

# Agregar todos los archivos de una carpeta
git add backend/

# Ver qué está en staging
git status
```

### 4. Hacer Commit de los Cambios

```bash
# Commit con mensaje descriptivo
git commit -m "Descripción clara de los cambios"

# Ejemplos de buenos mensajes:
git commit -m "Agregar modelo de Usuario con roles"
git commit -m "Implementar autenticación JWT en backend"
git commit -m "Crear componente de formulario de matrícula"
git commit -m "Corregir validación de datos en inscripción"
```

### 5. Enviar Cambios al Repositorio Remoto

```bash
# Primera vez (establecer upstream)
git push -u origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1

# Siguientes veces
git push

# Si hay cambios remotos que necesitas integrar primero
git pull origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

## 📋 Comandos Paso a Paso - Actualizar Cambios

### Escenario 1: Hacer tus primeros cambios

```bash
# 1. Verificar que estás en la branch correcta
git status

# 2. Ver qué archivos modificaste
git status
git diff

# 3. Agregar los archivos modificados
git add .

# 4. Crear el commit
git commit -m "Descripción de tus cambios"

# 5. Subir al repositorio (primera vez)
git push -u origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

### Escenario 2: Actualizar cambios subsecuentes

```bash
# 1. Ver estado
git status

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Descripción del cambio"

# 4. Push (ya no necesitas -u)
git push
```

### Escenario 3: Sincronizar con cambios remotos

```bash
# 1. Traer cambios del servidor sin fusionar
git fetch origin

# 2. Ver diferencias con remoto
git log HEAD..origin/claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1

# 3. Fusionar cambios remotos con los locales
git pull origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1

# O en un solo paso:
git pull
```

## 🎯 Comandos Útiles Adicionales

### Ver Historial de Commits

```bash
# Ver historial completo
git log

# Ver historial resumido (una línea por commit)
git log --oneline

# Ver últimos 5 commits
git log -5

# Ver cambios de un commit específico
git show <commit-hash>
```

### Deshacer Cambios

```bash
# Descartar cambios en un archivo (antes de add)
git checkout -- nombre-archivo.js

# Quitar archivo del staging (después de add)
git reset HEAD nombre-archivo.js

# Descartar TODOS los cambios no commiteados (¡CUIDADO!)
git reset --hard HEAD
```

### Trabajo con Archivos

```bash
# Ver archivos ignorados por Git
cat .gitignore

# Ver archivos trackeados por Git
git ls-files

# Dejar de trackear un archivo sin eliminarlo
git rm --cached nombre-archivo.js
```

## 🔐 Buenas Prácticas

### Mensajes de Commit

✅ **Buenos mensajes:**
- `Agregar modelo de Estudiante con validaciones`
- `Implementar endpoint de registro de matrícula`
- `Corregir bug en cálculo de pagos`
- `Actualizar documentación de API`

❌ **Malos mensajes:**
- `cambios`
- `fix`
- `update`
- `asdfasdf`

### Frecuencia de Commits

- Haz commits pequeños y frecuentes
- Cada commit debe representar una unidad lógica de cambio
- Commit antes de tomar un break largo

### Antes de Push

```bash
# 1. Verifica que todo compile/funcione
npm run build  # o el comando correspondiente

# 2. Revisa qué vas a subir
git log origin/claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1..HEAD

# 3. Entonces haz push
git push
```

## 🆘 Solución de Problemas

### "No estoy en la branch correcta"

```bash
# Ver en qué branch estás
git branch

# Cambiar a la branch correcta
git checkout claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

### "Tengo conflictos al hacer pull"

```bash
# 1. Ver qué archivos tienen conflicto
git status

# 2. Abrir archivos y resolver conflictos (buscar <<<<<<, ======, >>>>>>)

# 3. Después de resolver, agregar los archivos
git add archivo-resuelto.js

# 4. Completar el merge
git commit -m "Resolver conflictos de merge"
```

### "Quiero deshacer mi último commit"

```bash
# Mantener los cambios en staging
git reset --soft HEAD~1

# Descartar el commit y los cambios (¡CUIDADO!)
git reset --hard HEAD~1
```

## 📚 Workflow Completo Recomendado

```bash
# Cada vez que vayas a trabajar:

# 1. Actualizar con cambios remotos
git pull

# 2. Trabajar en tu código
# ... hacer cambios ...

# 3. Verificar cambios
git status
git diff

# 4. Agregar y commitear
git add .
git commit -m "Mensaje descriptivo"

# 5. Subir cambios
git push

# 6. Repetir desde paso 2
```

## 📞 Ayuda

Si tienes problemas con Git:
- Ejecuta `git status` para ver el estado actual
- Lee los mensajes de error cuidadosamente
- Usa `git log` para ver el historial
- Consulta esta guía

## 🔗 Recursos Adicionales

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Pro Git Book](https://git-scm.com/book/es/v2)
- [Git Documentation](https://git-scm.com/doc)
