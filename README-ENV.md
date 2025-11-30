# Configuración de Variables de Entorno

Este servidor utiliza variables de entorno para configurar puertos, CORS y otras opciones.

## Archivos de Configuración

- `.env` - Archivo de configuración local (no se sube a Git)
- `.env.example` - Plantilla de ejemplo (se sube a Git)

## Configuración Inicial

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar el archivo `.env`** con tus configuraciones:
   ```env
   PORT=3000
   CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200,http://localhost:4401,http://127.0.0.1:4401
   DB_PATH=./fleet_tracking.db
   JSON_LIMIT=10mb
   NODE_ENV=development
   ```

## Variables Disponibles

### `PORT`
- **Descripción:** Puerto en el que el servidor escuchará
- **Valor por defecto:** `3000`
- **Ejemplo:** `PORT=3000`

### `CORS_ORIGINS`
- **Descripción:** Orígenes permitidos para CORS, separados por comas
- **Valor por defecto:** `http://localhost:4200,http://127.0.0.1:4200,http://localhost:4401,http://127.0.0.1:4401`
- **Ejemplo:** `CORS_ORIGINS=http://localhost:4200,http://localhost:4401,https://mi-dominio.com`

### `DB_PATH`
- **Descripción:** Ruta donde se guardará la base de datos SQLite
- **Valor por defecto:** `./fleet_tracking.db`
- **Ejemplo:** `DB_PATH=./data/fleet_tracking.db`

### `JSON_LIMIT`
- **Descripción:** Límite de tamaño para el body de las peticiones JSON
- **Valor por defecto:** `10mb`
- **Ejemplo:** `JSON_LIMIT=50mb`

### `NODE_ENV`
- **Descripción:** Entorno de ejecución (development, production)
- **Valor por defecto:** `development`
- **Ejemplo:** `NODE_ENV=production`

## Instalación de Dependencias

Asegúrate de tener `dotenv` instalado:

```bash
npm install
```

El paquete `dotenv` ya está incluido en las dependencias del proyecto.

## Uso en Producción

Para producción, configura las variables de entorno en tu servidor o plataforma de hosting:

- **Heroku:** Usa `heroku config:set VARIABLE=valor`
- **Docker:** Usa `docker run -e VARIABLE=valor`
- **Vercel/Netlify:** Configura en el panel de configuración
- **Servidor propio:** Exporta las variables antes de iniciar el servidor

## Notas Importantes

⚠️ **NUNCA** subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

✅ El archivo `.env.example` es seguro de subir y sirve como documentación.

