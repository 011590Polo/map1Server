# Sistema de Almacenamiento de Archivos

## 📁 Estructura de Carpetas

Los archivos se guardan en el servidor en la siguiente estructura:

```
/storage
  /videos      - Videos subidos
  /imagenes    - Imágenes subidas
  /documentos  - PDFs y otros documentos
```

## 🔧 Configuración

### Dependencias Instaladas
- `multer`: Para manejar la subida de archivos multipart/form-data

### Variables de Entorno
El límite de tamaño de archivo se configura en `.env`:
```env
JSON_LIMIT=100mb
```

## 📤 Funcionamiento

### 1. Subida de Archivos
- Los archivos se envían como `FormData` desde el cliente
- Se guardan físicamente en el servidor según su tipo MIME
- Solo se guarda la **URL del archivo** en la base de datos, NO el contenido

### 2. Tipos de Archivo Permitidos
- **Imágenes**: JPEG, JPG, PNG, GIF, WEBP
- **Videos**: MP4, MPEG, QuickTime
- **Documentos**: PDF, DOC, DOCX

### 3. Límites
- Tamaño máximo por archivo: **100MB**
- Configurable en `utils/fileUpload.js`

## 🔗 URLs de Archivos

Los archivos son accesibles mediante:
```
GET /api/files/{carpeta}/{nombre-archivo}
```

Ejemplo:
```
GET /api/files/imagenes/1234567890-987654321.jpg
```

## 🗑️ Eliminación de Archivos

Cuando se elimina un marcador:
- Se elimina el registro de la base de datos
- Se elimina el archivo físico del servidor automáticamente

## 🔄 Migración desde Base64

**ANTES:**
- Archivos guardados como Base64 en la base de datos
- Límite de tamaño muy restrictivo
- Base de datos muy pesada

**AHORA:**
- Archivos guardados como archivos físicos
- Solo URLs en la base de datos
- Sin límite práctico de tamaño (100MB por archivo)
- Base de datos ligera

## 📝 Notas Importantes

⚠️ **Los archivos en `/storage` NO se suben a Git** (están en `.gitignore`)

⚠️ **Backup**: Asegúrate de hacer backup de la carpeta `/storage` regularmente

⚠️ **Producción**: Considera usar un servicio de almacenamiento en la nube (S3, Cloudinary) para producción

