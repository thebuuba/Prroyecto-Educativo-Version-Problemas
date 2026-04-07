export const DB_NAME = 'EduGestDB';
export const STORE_NAME = 'app_state';
export const RECORD_KEY = 'eg_v3';
export const SAVE_DEBOUNCE_MS = 120;

let dbPromise = null;
let pendingTimer = null;
const pendingWrites = new Map();

// Check if IndexedDB is supported
export function supportsIndexedDb() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

// Open the database
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
    console.warn('[EduGest][db] IndexedDB no disponible, se usara localStorage.', error);
    dbPromise = Promise.resolve(null);
    return null;
  });

  return dbPromise;
}

// Read from IndexedDB
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

// Write to IndexedDB
export async function writeIndexedDb(key, value) {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('No se pudo escribir IndexedDB'));
    tx.onabort = () => reject(tx.error || new Error('La transaccion fue cancelada'));
  }).catch(() => false);
}

// Load raw state
export async function loadRawState(storageKey = RECORD_KEY) {
  const fromDb = await readIndexedDb(storageKey);
  if (typeof fromDb === 'string' && fromDb) {
    try {
      window.localStorage.setItem(storageKey, fromDb);
    } catch (_) {}
    return fromDb;
  }

  try {
    const localRaw = window.localStorage.getItem(storageKey);
    if (typeof localRaw === 'string' && localRaw) {
      scheduleRawStateSave(storageKey, localRaw);
      return localRaw;
    }
  } catch (_) {}

  return null;
}

// Flush pending writes
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

// Schedule raw state save
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
