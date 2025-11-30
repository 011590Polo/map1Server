# Configuración de CORS para Producción

## Problema
Error de CORS cuando el cliente Angular (`https://map.robertogroup.org`) intenta acceder al servidor API (`https://mapapi.robertogroup.org`).

## Solución

### 1. Actualizar el archivo `.env` del servidor

Asegúrate de que el archivo `.env` en el servidor de producción incluya:

```env
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200,http://localhost:4401,http://127.0.0.1:4401,https://map.robertogroup.org,https://www.map.robertogroup.org
```

### 2. Reiniciar el servidor

Después de actualizar el `.env`, **reinicia el servidor Node.js** para que los cambios surtan efecto:

```bash
# Si usas PM2
pm2 restart fleet-tracking-server

# Si usas systemd
sudo systemctl restart fleet-tracking

# Si lo ejecutas directamente
# Detén el proceso y vuelve a iniciarlo
npm start
```

### 3. Verificar la configuración

El servidor ahora:
- ✅ Permite requests desde `https://map.robertogroup.org`
- ✅ Permite requests desde `https://www.map.robertogroup.org`
- ✅ Mantiene soporte para desarrollo local
- ✅ Muestra advertencias en consola si un origen no está permitido

### 4. Verificar que funciona

Puedes probar con curl:

```bash
curl -H "Origin: https://map.robertogroup.org" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://mapapi.robertogroup.org/api/health \
     -v
```

Deberías ver en los headers de respuesta:
```
Access-Control-Allow-Origin: https://map.robertogroup.org
```

## Notas Importantes

⚠️ **El servidor debe reiniciarse** después de cambiar el archivo `.env`

⚠️ **Verifica que el archivo `.env` esté en el servidor de producción** y no solo en desarrollo

⚠️ **Si usas un proxy reverso (nginx, Apache)**, también puede necesitar configuración de CORS adicional

## Troubleshooting

Si el error persiste después de reiniciar:

1. Verifica que el archivo `.env` esté en el directorio correcto del servidor
2. Verifica que `dotenv` esté instalado: `npm list dotenv`
3. Revisa los logs del servidor para ver si hay advertencias de CORS
4. Verifica que el servidor esté leyendo el archivo `.env` correctamente

