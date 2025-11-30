# Instalación del Servidor

## Pasos para instalar y ejecutar el servidor

### 1. Instalar dependencias

```bash
cd server
npm install
```

### 2. Iniciar el servidor

#### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```

### 3. Verificar que el servidor está funcionando

Abre tu navegador y visita:
- http://localhost:3000/api/health

Deberías ver:
```json
{
  "status": "ok",
  "message": "Fleet Tracking Server is running"
}
```

## Configuración del puerto

Por defecto el servidor corre en el puerto 3000. Para cambiar el puerto:

```bash
PORT=4000 npm start
```

O crea un archivo `.env`:
```
PORT=4000
```

## Base de datos

La base de datos SQLite se creará automáticamente en:
- `server/fleet_tracking.db`

No necesitas configurar nada adicional, la base de datos se inicializa automáticamente al iniciar el servidor.

## Solución de problemas

### Error: "Cannot find module"
Asegúrate de haber ejecutado `npm install` en la carpeta `server`.

### Error: "Port already in use"
Cambia el puerto usando la variable de entorno `PORT` o detén el proceso que está usando el puerto 3000.

### Error de CORS
El servidor está configurado para aceptar conexiones desde `http://localhost:4200` (Angular dev server). Si usas otro puerto, actualiza la configuración de CORS en `server.js`.

