# Guía para convertir tu PWA en una App Android (APK) usando Bubblewrap

Bubblewrap es la herramienta oficial de Google para "envolver" tu PWA en una aplicación Android nativa (TWA - Trusted Web Activity).

## Prerrequisitos

Antes de empezar, necesitas tener instalado:

1. **Node.js** (Ya lo tienes).
2. **Java Development Kit (JDK) 8 o superior**.
3. **Android SDK Command Line Tools** (Bubblewrap intentará descargarlo si no lo encuentra, pero es mejor tenerlo).
4. **Tu App DEBE estar desplegada públicamente** (en Vercel, Netlify, etc.) y tener HTTPS. Bubblewrap necesita leer el `manifest.json` desde la URL en vivo.

## Paso 1: Instalar la CLI de Bubblewrap

Abre tu terminal (PowerShell o CMD) y ejecuta:

```bash
npm install -g @bubblewrap/cli
```

## Paso 2: Inicializar el Proyecto Android

Crea una carpeta separada para los archivos de Android (para no mezclar con tu código web):

```bash
mkdir android-build
cd android-build
```

Luego, inicia el asistente de configuración. Te pedirá la URL de tu PWA desplegada:

```bash
bubblewrap init --manifest https://tu-dominio-en-vercel.app/manifest.json
```

**El asistente te hará varias preguntas:**

* **Domain:** Se rellenará solo.
* **App Name:** Se rellenará del manifest.
* **Launcher Icon:** Se descargará del manifest.
* **Splash Screen Color:** Se tomará del manifest.
* **KeyStore:** Si no tienes una "llave" de firma (para subir a Google Play), Bubblewrap te preguntará si quieres crear una nueva. Di que **SÍ** y guarda bien las contraseñas que pongas.

## Paso 3: Construir el APK

Una vez configurado, ejecuta:

```bash
bubblewrap build
```

Esto descargará las herramientas de Android necesarias (si no las tienes) y compilará el proyecto.

## Resultado

Al finalizar, tendrás dos archivos en la carpeta `android-build`:

1. **app-release-bundle.aab**: Este es el archivo que se sube a **Google Play Store**.
2. **app-release-signed.apk**: Este es el archivo instalable. Puedes enviártelo a tu móvil (por USB, Drive, Telegram, etc.) e instalarlo directamente.

## Nota Importante: "Asset Links"

Para que la barra de URL del navegador desaparezca y parezca una app 100% nativa, necesitas verificar que eres el dueño del dominio.
Bubblewrap te generará un archivo `assetlinks.json`.
Debes subir este archivo a tu web en esta ruta exacta:
`https://tu-dominio-en-vercel.app/.well-known/assetlinks.json`

Si no subes este archivo, la app funcionará, pero mostrará una pequeña barra de navegador arriba.
