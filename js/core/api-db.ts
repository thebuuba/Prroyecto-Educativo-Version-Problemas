/**
 * Capa de Persistencia Local (IndexedDB / LocalStorage).
 * --------------------------------------------------------------------------
 * Este módulo gestiona el almacenamiento persistente del estado de la aplicación
 * en el navegador del cliente, utilizando IndexedDB para grandes volúmenes de 
 * datos y LocalStorage como mecanismo de respaldo y sincronización rápida.
 */

export const DB_NAME = 'EduGestDB';
export const STORE_NAME = 'app_state';
export const RECORD_KEY = 'eg_v3';
export const SAVE_DEBOUNCE_MS = 120;

/** Promesa de conexión única a la base de datos */
let dbPromise = null;

/** Temporizador para el guardado "debounced" (con retraso) */
let pendingTimer = null;

/** Mapa de escrituras pendientes para evitar sobrecarga del disco */
const pendingWrites = new Map();

/**
 * Verifica si el navegador actual soporta la API de IndexedDB.
 * @returns {boolean}
 */
export function supportsIndexedDb() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Abre la conexión con la base de datos IndexedDB local.
 * Crea el almacén de objetos (store) si la base de datos es nueva.
 * @returns {Promise<IDBDatabase|null>}
 */
export function openDb() {
  if (!supportsIndexedDb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB'));
  }).catch((error) => {
    console.warn('[EduGest][db] IndexedDB no disponible, se usará localStorage.', error);
    dbPromise = Promise.resolve(null);
    return null;
  });

  return dbPromise;
}

/**
 * Lee un valor de un almacén de IndexedDB por su clave.
 * @param {string} key - Clave del registro.
 * @returns {Promise<any|null>}
 */
export async function readIndexedDb(key) {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => reject(request.error || new Error('No se pudo leer IndexedDB'));
  }).catch(() => null);
}

/**
 * Escribe un valor en el almacén de IndexedDB.
 * @param {string} key - Clave del registro.
 * @param {any} value - Datos a guardar.
 * @returns {Promise<boolean>} Éxito de la operación.
 */
export async function writeIndexedDb(key, value) {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('No se pudo escribir IndexedDB'));
    tx.onabort = () => reject(tx.error || new Error('La transacción fue cancelada'));
  }).catch(() => false);
}

/**
 * Carga el estado crudo (JSON) desde IndexedDB, con respaldo en LocalStorage.
 * Si los datos existen en DB pero no en LocalStorage, los sincroniza.
 * @param {string} [storageKey=RECORD_KEY]
 * @returns {Promise<string|null>} JSON serializado del estado.
 */
export async function loadRawState(storageKey = RECORD_KEY) {
  try {
    const localRaw = window.localStorage.getItem(storageKey);
    if (typeof localRaw === 'string' && localRaw) {
      scheduleRawStateSave(storageKey, localRaw);
      return localRaw;
    }
  } catch (_) {}

  const fromDb = await readIndexedDb(storageKey);
  if (typeof fromDb === 'string' && fromDb) {
    try {
      window.localStorage.setItem(storageKey, fromDb);
    } catch (_) {}
    return fromDb;
  }

  return null;
}

/**
 * Procesa inmediatamente todas las escrituras de estado pendientes.
 * Refleja los cambios tanto en IndexedDB como en LocalStorage.
 * @returns {Promise<boolean>}
 */
export async function flushPendingSave() {
  if (!pendingWrites.size) return false;
  const writes = Array.from(pendingWrites.entries());
  pendingWrites.clear();
  let savedAtLeastOne = false;

  for (const [storageKey, nextWrite] of writes) {
    const raw = typeof nextWrite.raw === 'function' ? nextWrite.raw() : nextWrite.raw;
    if (typeof raw !== 'string' || !raw) continue;

    const saved = await writeIndexedDb(storageKey, raw);
    try {
      window.localStorage.setItem(storageKey, raw);
    } catch (_) {}
    if (saved) {
      savedAtLeastOne = true;
      continue;
    }
    savedAtLeastOne = true;
  }
  return savedAtLeastOne;
}

/**
 * Programa el guardado del estado de forma asíncrona.
 * Implementa una estrategia de "debounce" para evitar escrituras excesivas ante cambios rápidos.
 * @param {string} [storageKey=RECORD_KEY]
 * @param {string} raw - JSON serializado del estado.
 */
export function scheduleRawStateSave(storageKey = RECORD_KEY, raw) {
  if (typeof raw === 'string' && raw) {
    try {
      window.localStorage.setItem(storageKey, raw);
    } catch (_) {}
  }
  pendingWrites.set(storageKey, { raw });
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
  }

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;
    flushPendingSave();
  }, SAVE_DEBOUNCE_MS);
}
