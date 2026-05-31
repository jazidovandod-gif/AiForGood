# Configuración de Google Drive API para Sincronización

Esta guía detalla los pasos necesarios para configurar la autenticación y permisos de Google Drive, asumiendo que ya posees un proyecto en Google Cloud Platform (GCP) con la **Google Drive API** habilitada.

## 1. Crear una Cuenta de Servicio (Service Account)

Para que el servidor (Django) pueda acceder a Google Drive de forma autónoma (sin intervención de un usuario en un navegador), utilizaremos una Cuenta de Servicio.

1. Ingresa a la [Consola de Google Cloud](https://console.cloud.google.com/).
2. Selecciona tu proyecto en el menú desplegable superior.
3. En el menú de navegación (hamburguesa) a la izquierda, ve a **IAM y administración** > **Cuentas de servicio**.
4. Haz clic en el botón **+ CREAR CUENTA DE SERVICIO** en la parte superior.
5. Completa los detalles de la cuenta de servicio:
   - **Nombre de la cuenta de servicio**: Ej. `drive-sync-service`
   - (El ID se generará automáticamente).
   - Haz clic en **CREAR Y CONTINUAR**.
6. En el paso 2 (Conceder acceso al proyecto), puedes dejarlo en blanco, ya que no necesitamos permisos sobre la infraestructura de GCP, solo sobre la API de Drive. Haz clic en **CONTINUAR**.
7. En el paso 3, haz clic en **LISTO**.

## 2. Generar y Descargar la Clave JSON

Ahora necesitamos descargar las credenciales de esta nueva cuenta.

1. En la lista de Cuentas de Servicio, busca la que acabas de crear (ej. `drive-sync-service@...`).
2. Haz clic en el correo electrónico de la cuenta de servicio (o en el ícono de los 3 puntos a la derecha y selecciona **Administrar claves**).
3. Ve a la pestaña **CLAVES**.
4. Haz clic en el botón **AGREGAR CLAVE** > **Crear clave nueva**.
5. Selecciona el tipo de clave **JSON** y haz clic en **CREAR**.
6. Se descargará automáticamente un archivo `.json` en tu computadora. **Guarda este archivo en un lugar seguro**. Contiene credenciales sensibles.

## 3. Configurar el Proyecto Django

1. Mueve el archivo JSON descargado dentro del directorio de tu proyecto (preferiblemente en una ubicación segura). Te sugerimos crear una carpeta como `config/credentials/` (asegúrate de agregar esta carpeta o el archivo a tu `.gitignore` para no subirlo al repositorio).
   - Ejemplo de ruta: `/ruta/a/tu/proyecto/config/credentials/google-credentials.json`
2. Abre tu archivo `.env` en la raíz del proyecto y agrega la siguiente variable de entorno, apuntando a la ubicación de tu archivo JSON:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS="config/credentials/google-credentials.json"
   ```

## 4. Obtener el ID de la Carpeta de Google Drive

Necesitamos identificar la carpeta exacta de la cual vamos a descargar los archivos.

1. Abre [Google Drive](https://drive.google.com/) en tu navegador.
2. Navega hasta la carpeta que contiene los archivos (por ejemplo, el catálogo de productos en Excel) que deseas sincronizar.
3. Observa la URL en tu navegador. Tendrá un formato similar a este:
   `https://drive.google.com/drive/folders/1aBcD_eFgHiJkL2MnOpQrStUvWxYz_345`
4. El texto largo después de `/folders/` es el **Folder ID**. Cópialo (`1aBcD_eFgHiJkL2MnOpQrStUvWxYz_345` en el ejemplo).
5. Abre nuevamente tu archivo `.env` y agrega el ID de la carpeta:

   ```env
   GOOGLE_DRIVE_FOLDER_ID="1aBcD_eFgHiJkL2MnOpQrStUvWxYz_345"
   ```

## 5. Compartir la Carpeta de Drive con la Cuenta de Servicio

**Este paso es crucial.** La Cuenta de Servicio es como un usuario invisible; no tiene acceso a tus carpetas personales de Drive a menos que se las compartas explícitamente.

1. Copia el **Correo electrónico** de la Cuenta de Servicio que creaste en el Paso 1 (ej. `drive-sync-service@tu-proyecto-123.iam.gserviceaccount.com`).
2. En Google Drive, haz clic derecho sobre la carpeta que vas a sincronizar y selecciona **Compartir**.
3. En el campo para agregar personas, pega el correo electrónico de la Cuenta de Servicio.
4. Asígnale permiso de **Lector** (es suficiente para descargar información; dale "Editor" si planeas que el script también suba archivos).
5. Desmarca la opción "Notificar a las personas" (las cuentas de servicio no leen correos) y haz clic en **Compartir**.

---

**¡Listo!** El proyecto ahora tiene las credenciales configuradas y los permisos correctos en Google Drive. El sistema leerá automáticamente la variable `GOOGLE_APPLICATION_CREDENTIALS` para autenticarse usando la librería cliente de Google.
