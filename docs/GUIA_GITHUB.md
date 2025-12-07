# Guía de Configuración de GitHub - Paso a Paso

Esta guía te ayudará a configurar GitHub desde cero para el proyecto del Sistema de Matrículas del Colegio SOA.

## Tabla de Contenidos

1. [Crear Cuenta de GitHub](#1-crear-cuenta-de-github)
2. [Configurar Git en tu Computadora](#2-configurar-git-en-tu-computadora)
3. [Crear Repositorio en GitHub](#3-crear-repositorio-en-github)
4. [Conectar Repositorio Local con GitHub](#4-conectar-repositorio-local-con-github)
5. [Subir Código por Primera Vez](#5-subir-código-por-primera-vez)
6. [Configurar SSH (Opcional pero Recomendado)](#6-configurar-ssh-opcional-pero-recomendado)
7. [Trabajar con el Repositorio](#7-trabajar-con-el-repositorio)

---

## 1. Crear Cuenta de GitHub

### Paso 1.1: Ir a GitHub

1. Abre tu navegador web
2. Ve a [https://github.com](https://github.com)
3. Haz clic en "Sign up" (Registrarse)

### Paso 1.2: Completar el Registro

1. Ingresa tu email
2. Crea una contraseña segura
3. Elige un nombre de usuario (username)
4. Completa la verificación de que eres humano
5. Haz clic en "Create account"

### Paso 1.3: Verificar Email

1. Revisa tu bandeja de entrada
2. Busca el email de GitHub
3. Haz clic en el enlace de verificación

LISTO - Ya tienes tu cuenta de GitHub creada.

---

## 2. Configurar Git en tu Computadora

### Paso 2.1: Instalar Git

**En Windows:**
1. Descarga Git desde [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Ejecuta el instalador descargado
3. Sigue el asistente de instalación (deja las opciones por defecto)
4. Haz clic en "Install" y luego "Finish"

**En macOS:**
1. Abre la Terminal
2. Ejecuta: `xcode-select --install`
3. O instala con Homebrew: `brew install git`

**En Linux (Ubuntu/Debian):**
1. Abre la Terminal
2. Ejecuta: `sudo apt-get update`
3. Ejecuta: `sudo apt-get install git`

### Paso 2.2: Verificar Instalación

Abre una terminal (Command Prompt en Windows o Terminal en Mac/Linux) y ejecuta:

```bash
git --version
```

Deberías ver algo como: `git version 2.x.x`

### Paso 2.3: Configurar tu Identidad

Configura tu nombre y email (usa los mismos datos de tu cuenta de GitHub):

```bash
# Configurar nombre
git config --global user.name "Tu Nombre Completo"

# Configurar email
git config --global user.email "tu-email@example.com"

# Verificar configuración
git config --list
```

### Paso 2.4: Configurar Editor por Defecto (Opcional)

```bash
# Para usar VS Code
git config --global core.editor "code --wait"

# Para usar Notepad++ (Windows)
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"

# Para usar Vim
git config --global core.editor "vim"
```

LISTO - Git está configurado en tu computadora.

---

## 3. Crear Repositorio en GitHub

### Paso 3.1: Crear Nuevo Repositorio

1. Inicia sesión en [GitHub](https://github.com)
2. Haz clic en el botón "+" (arriba a la derecha)
3. Selecciona "New repository"

### Paso 3.2: Configurar el Repositorio

Completa los siguientes campos:

1. **Repository name**: `COLESOA` (o el nombre que prefieras)
2. **Description** (opcional): "Sistema de Matrículas Escolar - Colegio SOA"
3. **Visibility**:
   - Selecciona "Private" si quieres que solo tú lo veas
   - Selecciona "Public" si quieres que sea público
4. **Initialize repository**:
   - NO marques "Add a README file" (ya tenemos uno)
   - NO marques "Add .gitignore" (ya tenemos uno)
   - NO selecciones License por ahora

5. Haz clic en "Create repository"

### Paso 3.3: Copiar la URL del Repositorio

Después de crear el repositorio, GitHub te mostrará una página con instrucciones.

Copia la URL que aparece. Será algo como:
- HTTPS: `https://github.com/tu-usuario/COLESOA.git`
- SSH: `git@github.com:tu-usuario/COLESOA.git`

LISTO - Tu repositorio en GitHub está creado.

---

## 4. Conectar Repositorio Local con GitHub

### Paso 4.1: Abrir Terminal en tu Proyecto

1. Navega a la carpeta de tu proyecto:

```bash
cd /ruta/a/tu/proyecto/COLESOA
```

### Paso 4.2: Inicializar Git (si aún no lo has hecho)

```bash
# Ver si ya está inicializado
git status

# Si dice "not a git repository", inicializa:
git init
```

### Paso 4.3: Verificar Branch Actual

```bash
# Ver branch actual
git branch

# Si no es "main" o la branch correcta, cambiarla:
git checkout -b claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

### Paso 4.4: Agregar Repositorio Remoto

```bash
# Agregar GitHub como remoto (usa tu URL)
git remote add origin https://github.com/tu-usuario/COLESOA.git

# Verificar que se agregó correctamente
git remote -v
```

Deberías ver algo como:
```
origin  https://github.com/tu-usuario/COLESOA.git (fetch)
origin  https://github.com/tu-usuario/COLESOA.git (push)
```

LISTO - Tu repositorio local está conectado con GitHub.

---

## 5. Subir Código por Primera Vez

### Paso 5.1: Verificar Archivos

```bash
# Ver qué archivos hay
git status
```

### Paso 5.2: Agregar Archivos

```bash
# Agregar todos los archivos
git add .

# Verificar que se agregaron
git status
```

### Paso 5.3: Hacer el Primer Commit

```bash
# Crear commit
git commit -m "Initial commit - Sistema de Matriculas Colegio SOA"
```

### Paso 5.4: Subir a GitHub

```bash
# Subir por primera vez
git push -u origin claude/school-enrollment-system-017tVphpBH1CkmnHsJ3eqJW1
```

Si te pide usuario y contraseña:
- Usuario: tu nombre de usuario de GitHub
- Contraseña: tu token de acceso personal (ver sección siguiente)

### Paso 5.5: Crear Token de Acceso (si es necesario)

Si GitHub te pide contraseña y no funciona, necesitas un token:

1. Ve a GitHub.com
2. Haz clic en tu foto de perfil > Settings
3. Scroll hasta el final > Developer settings
4. Personal access tokens > Tokens (classic)
5. Generate new token > Generate new token (classic)
6. Asigna un nombre: "COLESOA Project"
7. Marca el checkbox: "repo" (completo)
8. Scroll abajo y haz clic en "Generate token"
9. COPIA EL TOKEN (lo verás solo una vez)
10. Usa este token como "contraseña" cuando Git te lo pida

LISTO - Tu código está en GitHub.

---

## 6. Configurar SSH (Opcional pero Recomendado)

SSH te permite conectarte sin ingresar contraseña cada vez.

### Paso 6.1: Verificar si Tienes Claves SSH

```bash
ls -al ~/.ssh
```

Si ves archivos como `id_rsa.pub` o `id_ed25519.pub`, ya tienes claves.

### Paso 6.2: Generar Nueva Clave SSH (si no tienes)

```bash
# Generar clave (usa tu email de GitHub)
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Presiona Enter para aceptar ubicación por defecto
# Presiona Enter dos veces para no poner contraseña (opcional)
```

### Paso 6.3: Copiar la Clave Pública

```bash
# En Windows
type %USERPROFILE%\.ssh\id_ed25519.pub

# En Mac/Linux
cat ~/.ssh/id_ed25519.pub
```

Copia TODO el texto que aparece (empieza con `ssh-ed25519`).

### Paso 6.4: Agregar Clave a GitHub

1. Ve a GitHub.com
2. Haz clic en tu foto > Settings
3. En el menú lateral: SSH and GPG keys
4. Haz clic en "New SSH key"
5. Title: "Mi Computadora" (o el nombre que quieras)
6. Key: Pega la clave que copiaste
7. Haz clic en "Add SSH key"

### Paso 6.5: Cambiar URL del Repositorio a SSH

```bash
# Cambiar de HTTPS a SSH
git remote set-url origin git@github.com:tu-usuario/COLESOA.git

# Verificar
git remote -v
```

### Paso 6.6: Probar Conexión

```bash
ssh -T git@github.com
```

Deberías ver: `Hi tu-usuario! You've successfully authenticated...`

LISTO - SSH configurado correctamente.

---

## 7. Trabajar con el Repositorio

### 7.1 Workflow Diario

```bash
# 1. Verificar estado
git status

# 2. Traer cambios del servidor
git pull

# 3. Hacer tus cambios en el código
# ... editar archivos ...

# 4. Ver qué cambió
git status
git diff

# 5. Agregar cambios
git add .

# 6. Hacer commit
git commit -m "Descripción de tus cambios"

# 7. Subir a GitHub
git push
```

### 7.2 Ver Historial

```bash
# Ver todos los commits
git log

# Ver commits de forma resumida
git log --oneline

# Ver commits con gráfico
git log --graph --oneline --all
```

### 7.3 Verificar en GitHub

1. Ve a [https://github.com/tu-usuario/COLESOA](https://github.com/tu-usuario/COLESOA)
2. Deberías ver todos tus archivos
3. Puedes ver el historial en la pestaña "Commits"

### 7.4 Invitar Colaboradores (Opcional)

Si trabajas en equipo:

1. Ve a tu repositorio en GitHub
2. Haz clic en "Settings"
3. En el menú lateral: "Collaborators"
4. Haz clic en "Add people"
5. Ingresa el username o email del colaborador
6. Haz clic en "Add [nombre] to this repository"

---

## Solución de Problemas Comunes

### Problema 1: "Permission denied (publickey)"

**Solución:**
```bash
# Verifica que tengas la clave SSH
ls -al ~/.ssh

# Prueba la conexión
ssh -T git@github.com

# Si falla, revisa la sección 6 para configurar SSH
```

### Problema 2: "Repository not found"

**Solución:**
```bash
# Verifica la URL del remoto
git remote -v

# Si es incorrecta, cambiala:
git remote set-url origin https://github.com/USUARIO-CORRECTO/COLESOA.git
```

### Problema 3: "fatal: refusing to merge unrelated histories"

**Solución:**
```bash
git pull origin main --allow-unrelated-histories
```

### Problema 4: Olvidé mi Token de Acceso

**Solución:**
Genera uno nuevo siguiendo el Paso 5.5

---

## Comandos de Referencia Rápida

```bash
# Configuración inicial
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Iniciar repositorio
git init
git remote add origin URL

# Workflow básico
git pull                    # Traer cambios
git status                  # Ver estado
git add .                   # Agregar todo
git commit -m "mensaje"     # Guardar cambios
git push                    # Subir a GitHub

# Ver información
git log                     # Historial
git remote -v               # Ver remotos
git branch                  # Ver branches

# Deshacer cambios
git checkout -- archivo     # Descartar cambios en archivo
git reset HEAD archivo      # Quitar de staging
git reset --hard HEAD       # Descartar TODO (cuidado!)
```

---

## Recursos Adicionales

- [Documentación oficial de Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Pro Git Book (Español)](https://git-scm.com/book/es/v2)

---

## Conclusión

Ahora tienes GitHub completamente configurado y sabes cómo:

- Crear una cuenta de GitHub
- Configurar Git en tu computadora
- Crear y conectar repositorios
- Subir y bajar código
- Trabajar día a día con Git y GitHub

Para más ayuda con comandos de Git día a día, consulta la [Guía de Git](./GUIA_GIT.md).
