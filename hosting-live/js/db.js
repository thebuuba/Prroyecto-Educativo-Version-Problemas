(function initEduGestDb(global) {
  const DB_NAME = 'EduGestDB';
  const STORE_NAME = 'app_state';
  const RECORD_KEY = 'eg_v3';
  const SAVE_DEBOUNCE_MS = 120;
  let dbPromise = null;
  let pendingTimer = null;
  const pendingWrites = new Map();

  // Gestiona supports indexed db.
  function supportsIndexedDb() {
    return typeof global.indexedDB !== 'undefined';
  }

  // Abre abrir db.
  function openDb() {
    if (!supportsIndexedDb()) return Promise.resolve(null);
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = global.indexedDB.open(DB_NAME, 1);

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

  // Lee read indexed db.
  async function readIndexedDb(key) {
    const db = await openDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error || new Error('No se pudo leer IndexedDB'));
    }).catch(() => null);
  }

  // Escribe write indexed db.
  async function writeIndexedDb(key, value) {
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

  // Carga cargar raw estado.
  async function loadRawState(storageKey = RECORD_KEY) {
    try {
      const localRaw = global.localStorage.getItem(storageKey);
      if (typeof localRaw === 'string' && localRaw) {
        scheduleRawStateSave(storageKey, localRaw);
        return localRaw;
      }
    } catch (_) {}

    // Fallback: legacy IndexedDB mirror.
    const fromDb = await readIndexedDb(storageKey);
    if (typeof fromDb === 'string' && fromDb) {
      try {
        global.localStorage.setItem(storageKey, fromDb);
      } catch (_) {}
      return fromDb;
    }

    return null;
  }

  // Gestiona flush pending guardar.
  async function flushPendingSave() {
    if (!pendingWrites.size) return false;
    const writes = Array.from(pendingWrites.entries());
    pendingWrites.clear();
    let savedAtLeastOne = false;

    for (const [storageKey, nextWrite] of writes) {
      const raw = typeof nextWrite.raw === 'function' ? nextWrite.raw() : nextWrite.raw;
      if (typeof raw !== 'string' || !raw) continue;

      const saved = await writeIndexedDb(storageKey, raw);
      try {
        global.localStorage.setItem(storageKey, raw);
      } catch (_) {}
      if (saved) {
        savedAtLeastOne = true;
        continue;
      }
      savedAtLeastOne = true;
    }
    return savedAtLeastOne;
  }

  // Programa programar raw estado guardar.
  function scheduleRawStateSave(storageKey = RECORD_KEY, raw) {
    if (typeof raw === 'string' && raw) {
      try {
        global.localStorage.setItem(storageKey, raw);
      } catch (_) {}
    }
    pendingWrites.set(storageKey, { raw });
    if (pendingTimer) {
      global.clearTimeout(pendingTimer);
    }

    pendingTimer = global.setTimeout(() => {
      pendingTimer = null;
      flushPendingSave();
    }, SAVE_DEBOUNCE_MS);
  }

  global.EduGestDB = {
    flushPendingSave,
    loadRawState,
    scheduleRawStateSave,
  };
})(window);
