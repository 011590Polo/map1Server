import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorio base de almacenamiento
const STORAGE_BASE = join(__dirname, '..', 'storage');

// Crear directorios si no existen
const createDirectories = () => {
  const dirs = [
    join(STORAGE_BASE, 'videos'),
    join(STORAGE_BASE, 'imagenes'),
    join(STORAGE_BASE, 'documentos')
  ];
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = file.mimetype;
    let folder = 'documentos'; // Por defecto
    
    if (mimeType.startsWith('image/')) {
      folder = 'imagenes';
    } else if (mimeType.startsWith('video/')) {
      folder = 'videos';
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      folder = 'documentos';
    }
    
    cb(null, join(STORAGE_BASE, folder));
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-uuid-extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB límite por archivo
  }
});

// Función para obtener la URL pública del archivo
export const getFileUrl = (filename, folder = 'documentos') => {
  if (!filename) return null;
  return `/api/files/${folder}/${filename}`;
};

// Función para obtener la ruta completa del archivo
export const getFilePath = (filename, folder = 'documentos') => {
  if (!filename) return null;
  return join(STORAGE_BASE, folder, filename);
};

// Función para eliminar un archivo
export const deleteFile = (filename, folder = 'documentos') => {
  if (!filename) return;
  
  import('fs/promises').then(fs => {
    const filePath = getFilePath(filename, folder);
    fs.unlink(filePath).then(() => {
      console.log(`Archivo eliminado: ${filePath}`);
    }).catch(error => {
      console.error(`Error al eliminar archivo ${filePath}:`, error);
    });
  }).catch(error => {
    console.error('Error al importar fs/promises:', error);
  });
};

