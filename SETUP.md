# 🚀 Guía de Configuración Inicial (Setup Guide)

Bienvenido a **Venaris Route AI**. Esta guía está diseñada para acompañarte paso a paso en la primera configuración y ejecución de la plataforma en tu entorno local. 

La plataforma consta de tres componentes principales:
1. **Backend Django & PostGIS** (Lógica, API y Base de Datos)
2. **Dashboard Web Frontend** (Panel para supervisores - React)
3. **Aplicación Móvil** (App para reponedores - React Native / Expo)

---

## 📋 1. Requisitos Previos del Sistema

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu máquina:

- **Git**: Para clonar el repositorio.
- **Docker y Docker Compose**: Para levantar la base de datos PostgreSQL/PostGIS y el backend sin complicaciones.
- **Node.js (v18 o superior)** y **npm/yarn**: Para ejecutar el Frontend y la App Móvil.
- **Python 3.11+** (Opcional, si deseas correr el backend fuera de Docker).
- **Expo Go** (App móvil): Instalada en tu dispositivo físico (iOS o Android) o contar con un emulador configurado en tu PC.

---

## ⚙️ 2. Clonación y Variables de Entorno

**1. Clona el repositorio:**

```bash
git clone https://github.com/AndrewFlovel/AiForGood.git
cd AiForGood
```

**2. Configura las variables de entorno base:**
El backend requiere un archivo `.env` para operar correctamente.

```bash
cp .env.example .env
```

Abre el archivo `.env` y verifica que los datos base estén correctos. Puedes usar las credenciales de prueba proporcionadas en `.env.example` para el entorno de desarrollo local. 
*Nota: Si tienes configurados servicios externos como Firebase o las APIs de Venado, añade las claves correspondientes en este archivo.*

---

## 🐘 3. Iniciar el Backend (Base de Datos y API)

Utilizaremos Docker para levantar rápidamente la base de datos (PostGIS) y el servidor Django. El archivo `docker-compose.yml` está configurado para ejecutar las migraciones necesarias y sembrar la base de datos con información inicial automáticamente.

**1. Verifica que el demonio de Docker esté corriendo en tu máquina.**

**2. Construye y levanta los contenedores en segundo plano:**
```bash
# Asegúrate de estar en la raíz del proyecto
docker compose up -d --build
```

**3. Verifica que los servicios estén corriendo:**
```bash
docker compose ps
```
*Deberías ver los contenedores `db` y `backend` con estado `Up` (o `healthy`).*

**4. (Opcional) Revisa los logs del backend si hay algún problema:**
```bash
docker compose logs -f backend
```
*(Presiona `Ctrl+C` para salir de los logs).*

**Verificación de Acceso:**
- El contenedor `db` se ejecutará en el puerto `5432`.
- El contenedor `backend` se ejecutará exponiendo la API en `http://localhost:8001/api/`.
- *Puedes usar las credenciales por defecto (creadas automáticamente por el comando `init_db` interno):*
  - **Usuario:** `admin`
  - **Contraseña:** `admin123`

---

## 📊 4. Iniciar el Dashboard Frontend

El panel para supervisores está desarrollado en React con Vite.

```bash
# 1. Entra a la carpeta del frontend
cd frontend

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

**Verificación del Frontend:**
- Abre tu navegador y dirígete a la URL que indica Vite (usualmente `http://localhost:5173`).
- Deberías ver la pantalla de inicio de sesión o el dashboard principal.

---

## 📱 5. Iniciar la Aplicación Móvil

La aplicación para los reponedores utiliza React Native y Expo.

```bash
# 1. Vuelve a la raíz y entra a la carpeta mobile-app
cd ../mobile-app

# 2. Instala las dependencias
npm install

# 3. Inicia Expo
npm run start
```

**Verificación de la App Móvil:**
- Verás un código QR en la terminal.
- **Para probar en un dispositivo físico:** Abre la app "Expo Go" en tu celular (o usa la cámara en iOS) y escanea el código QR. Tu teléfono debe estar en la misma red Wi-Fi que tu computadora.
- **Para probar en un emulador:** Presiona la tecla `a` (para Android) o `i` (para iOS) en la terminal donde se ejecuta Expo.

---

## 🎯 6. Validación de la Instalación (Smoke Test)

Para asegurarte de que todo se comunica correctamente:

1. **Prueba la API:** Abre en tu navegador o mediante una herramienta como Postman la URL `http://localhost:8001/api/auth/login/` y deberías ver que la API responde (probablemente con un error 405 Method Not Allowed si usas el navegador, lo cual es normal para un endpoint POST). 
   *⚠️ Nota importante: Si abres directamente `http://localhost:8001/` o `http://localhost:8001/api/`, Django arrojará un error **404 Page Not Found**. Esto es el comportamiento esperado, ya que la API de Django solo tiene rutas registradas bajo `/admin/`, `/api/auth/`, y `/api/logistica/`.*
2. **Corre los tests automatizados (Opcional):**
   Si quieres probar el entorno backend localmente (sin Docker):
   ```bash
   # En la raíz, crea tu entorno virtual y corre tests
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements/development.txt
   python test_api.py
   ```

## 🆘 Resolución de Problemas Comunes

- **Error de conexión a la base de datos en Docker:** Asegúrate de que los puertos `5432` u `8000/8001` no estén siendo ocupados por otra aplicación en tu computadora.
- **La App móvil no conecta con la API:** En tu app de Expo, reemplaza `localhost` con la dirección IP local de tu computadora (ej: `192.168.1.X`), ya que el celular no entiende `localhost` como tu PC.
- **Expo Go se cierra inmediatamente al escanear el QR:** Esto ocurre por dos razones principales:
  1. **Versión desactualizada de Expo Go:** Este proyecto usa **Expo SDK 56** (muy reciente). Asegúrate de actualizar la app "Expo Go" en tu teléfono desde la App Store / Play Store.
  2. **Conflicto con Development Build:** El proyecto incluye `expo-dev-client`. Por defecto, Expo puede intentar levantar un "Development Build" en lugar del clásico "Expo Go". Para forzar el modo Expo Go:
     - En la terminal donde corre Expo, **presiona la tecla `s`** para cambiar a modo Expo Go.
     - O cancela el proceso y ejecútalo así: `npx expo start --go -c` (el `-c` limpia la caché que podría estar corrupta).
- **Errores de Node Modules:** Borra la carpeta `node_modules` y el archivo `package-lock.json`, luego vuelve a ejecutar `npm install`.

¡Felicidades! 🎉 Has configurado exitosamente la plataforma local de Venado Route AI. Si tienes dudas respecto a la arquitectura, puedes consultar el [README.md](./README.md) principal.