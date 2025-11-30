import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear conexión a la base de datos
const db = new Database(join(__dirname, 'fleet_tracking.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

/**
 * Inicializa la base de datos creando las tablas necesarias
 */
export function initDatabase() {
  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      num_usuario INTEGER,
      nombre TEXT,
      plataforma TEXT,
      modelo_dispositivo TEXT,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultima_conexion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migración: Agregar columna num_usuario si no existe
  try {
    db.exec(`
      ALTER TABLE usuarios ADD COLUMN num_usuario INTEGER;
    `);
    console.log('✅ Columna num_usuario agregada a usuarios');
    
    // Asignar números secuenciales a usuarios existentes que no lo tengan
    const stmtUpdate = db.prepare(`
      UPDATE usuarios 
      SET num_usuario = (
        SELECT COALESCE(MAX(num_usuario), 0) + ROW_NUMBER() OVER (ORDER BY fecha_registro)
        FROM usuarios u2 
        WHERE u2.rowid <= usuarios.rowid
      )
      WHERE num_usuario IS NULL;
    `);
    
    // Método alternativo más simple para SQLite
    const usuariosSinNum = db.prepare('SELECT id, rowid FROM usuarios WHERE num_usuario IS NULL ORDER BY fecha_registro, rowid').all();
    if (usuariosSinNum.length > 0) {
      const stmtMax = db.prepare('SELECT MAX(num_usuario) as max_num FROM usuarios');
      const result = stmtMax.get();
      let nextNum = result && result.max_num ? result.max_num + 1 : 1;
      
      const stmtAsignar = db.prepare('UPDATE usuarios SET num_usuario = ? WHERE id = ?');
      usuariosSinNum.forEach(usuario => {
        stmtAsignar.run(nextNum, usuario.id);
        nextNum++;
      });
      console.log(`✅ ${usuariosSinNum.length} números asignados a usuarios existentes`);
    }
  } catch (error) {
    // La columna ya existe, ignorar error
    if (!error.message.includes('duplicate column') && !error.message.includes('no such column')) {
      console.warn('⚠️  Advertencia al agregar columna num_usuario:', error.message);
    }
  }

  // Tabla de marcadores (actualizada para incluir user_id)
  db.exec(`
    CREATE TABLE IF NOT EXISTS marcadores (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      categoria TEXT NOT NULL CHECK(categoria IN ('alerta', 'peligro', 'informacion')),
      descripcion TEXT NOT NULL,
      archivo TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )
  `);

  // Migración: Agregar columna user_id a marcadores si no existe
  try {
    db.exec(`
      ALTER TABLE marcadores ADD COLUMN user_id TEXT;
    `);
    console.log('✅ Columna user_id agregada a marcadores');
  } catch (error) {
    // La columna ya existe, ignorar error
    if (!error.message.includes('duplicate column')) {
      console.warn('⚠️  Advertencia al agregar columna user_id:', error.message);
    }
  }

  // Tabla de coordenadas GPS (para tracking en tiempo real)
  db.exec(`
    CREATE TABLE IF NOT EXISTS coordenadas_gps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      accuracy REAL,
      timestamp TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )
  `);

  // Migración: Agregar columna user_id a coordenadas_gps si no existe
  try {
    db.exec(`
      ALTER TABLE coordenadas_gps ADD COLUMN user_id TEXT;
    `);
    console.log('✅ Columna user_id agregada a coordenadas_gps');
  } catch (error) {
    // La columna ya existe, ignorar error
    if (!error.message.includes('duplicate column')) {
      console.warn('⚠️  Advertencia al agregar columna user_id:', error.message);
    }
  }

  // Índices para mejorar el rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_marcadores_categoria ON marcadores(categoria);
    CREATE INDEX IF NOT EXISTS idx_marcadores_timestamp ON marcadores(timestamp);
    CREATE INDEX IF NOT EXISTS idx_marcadores_user_id ON marcadores(user_id);
    CREATE INDEX IF NOT EXISTS idx_coordenadas_timestamp ON coordenadas_gps(timestamp);
    CREATE INDEX IF NOT EXISTS idx_coordenadas_user_id ON coordenadas_gps(user_id);
    CREATE INDEX IF NOT EXISTS idx_usuarios_ultima_conexion ON usuarios(ultima_conexion);
  `);

  console.log('✅ Base de datos inicializada correctamente');
}

/**
 * ==================== USUARIOS ====================
 */

/**
 * Registra o actualiza un usuario
 */
export function registrarOActualizarUsuario(userData) {
  const { id, nombre, plataforma, modeloDispositivo } = userData;
  
  // Verificar si el usuario existe
  const stmtCheck = db.prepare('SELECT * FROM usuarios WHERE id = ?');
  const existe = stmtCheck.get(id);

  if (existe) {
    // Actualizar última conexión
    const stmtUpdate = db.prepare(`
      UPDATE usuarios 
      SET ultima_conexion = datetime('now'),
          nombre = COALESCE(?, nombre),
          plataforma = COALESCE(?, plataforma),
          modelo_dispositivo = COALESCE(?, modelo_dispositivo)
      WHERE id = ?
    `);
    stmtUpdate.run(nombre || null, plataforma || null, modeloDispositivo || null, id);
    return { ...existe, actualizado: true };
  } else {
    // Obtener el próximo número de usuario (máximo + 1)
    const stmtMax = db.prepare('SELECT MAX(num_usuario) as max_num FROM usuarios');
    const result = stmtMax.get();
    const nextNum = result && result.max_num ? result.max_num + 1 : 1;

    // Crear nuevo usuario con número asignado
    const stmtInsert = db.prepare(`
      INSERT INTO usuarios (id, num_usuario, nombre, plataforma, modelo_dispositivo, fecha_registro, ultima_conexion)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmtInsert.run(id, nextNum, nombre || null, plataforma || null, modeloDispositivo || null);
    
    const stmtGet = db.prepare('SELECT * FROM usuarios WHERE id = ?');
    return { ...stmtGet.get(id), actualizado: false };
  }
}

/**
 * Obtiene un usuario por ID
 */
export function getUsuarioById(id) {
  const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
  return stmt.get(id);
}

/**
 * Obtiene todos los usuarios conectados (últimos 24 horas)
 */
export function getUsuariosConectados() {
  const stmt = db.prepare(`
    SELECT * FROM usuarios 
    WHERE ultima_conexion > datetime('now', '-1 day')
    ORDER BY ultima_conexion DESC
  `);
  return stmt.all();
}

/**
 * ==================== MARCADORES ====================
 */

/**
 * Obtiene todos los marcadores
 */
export function getAllMarcadores() {
  const stmt = db.prepare(`
    SELECT m.*, 
           u.nombre as usuario_nombre, 
           u.plataforma as usuario_plataforma,
           u.num_usuario as usuario_num
    FROM marcadores m
    LEFT JOIN usuarios u ON m.user_id = u.id
    ORDER BY m.timestamp DESC
  `);
  return stmt.all();
}

/**
 * Obtiene un marcador por ID
 */
export function getMarcadorById(id) {
  const stmt = db.prepare(`
    SELECT m.*, 
           u.nombre as usuario_nombre, 
           u.plataforma as usuario_plataforma,
           u.num_usuario as usuario_num
    FROM marcadores m
    LEFT JOIN usuarios u ON m.user_id = u.id
    WHERE m.id = ?
  `);
  return stmt.get(id);
}

/**
 * Crea un nuevo marcador
 */
export function createMarcador(marcador) {
  const id = marcador.id || uuidv4();
  const stmt = db.prepare(`
    INSERT INTO marcadores (id, user_id, lat, lng, categoria, descripcion, archivo, timestamp, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  
  const result = stmt.run(
    id,
    marcador.user_id || null,
    marcador.lat,
    marcador.lng,
    marcador.categoria,
    marcador.descripcion,
    marcador.archivo || null,
    marcador.timestamp || new Date().toISOString()
  );

  return getMarcadorById(id);
}

/**
 * Actualiza un marcador existente
 */
export function updateMarcador(id, marcador) {
  const stmt = db.prepare(`
    UPDATE marcadores 
    SET lat = ?, lng = ?, categoria = ?, descripcion = ?, archivo = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(
    marcador.lat,
    marcador.lng,
    marcador.categoria,
    marcador.descripcion,
    marcador.archivo || null,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getMarcadorById(id);
}

/**
 * Elimina un marcador
 */
export function deleteMarcador(id) {
  const stmt = db.prepare('DELETE FROM marcadores WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Guarda una coordenada GPS
 */
export function saveCoordenadaGPS(coordenada) {
  const stmt = db.prepare(`
    INSERT INTO coordenadas_gps (user_id, lat, lng, accuracy, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    coordenada.user_id || null,
    coordenada.lat,
    coordenada.lng,
    coordenada.accuracy || null,
    coordenada.timestamp || new Date().toISOString()
  );

  return result.lastInsertRowid;
}

/**
 * Obtiene las últimas coordenadas GPS
 */
export function getUltimasCoordenadas(limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM coordenadas_gps 
    ORDER BY timestamp DESC 
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Obtiene coordenadas GPS en un rango de tiempo
 */
export function getCoordenadasPorRango(fechaInicio, fechaFin) {
  const stmt = db.prepare(`
    SELECT * FROM coordenadas_gps 
    WHERE timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
  `);
  return stmt.all(fechaInicio, fechaFin);
}

/**
 * Obtiene estadísticas de marcadores
 */
export function getEstadisticasMarcadores() {
  const stmt = db.prepare(`
    SELECT 
      categoria,
      COUNT(*) as total,
      MIN(timestamp) as primera_fecha,
      MAX(timestamp) as ultima_fecha
    FROM marcadores
    GROUP BY categoria
  `);
  return stmt.all();
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeDatabase() {
  db.close();
  console.log('✅ Conexión a la base de datos cerrada');
}

export default db;

