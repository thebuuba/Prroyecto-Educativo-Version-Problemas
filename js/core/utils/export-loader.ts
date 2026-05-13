/**
 * Planificador de tareas no críticas para ejecución durante el tiempo de inactividad del navegador.
 * Utiliza requestIdleCallback si está disponible, de lo contrario cae a setTimeout.
 */
export const scheduleNonCriticalTask = (() => {
  if (typeof window.requestIdleCallback === 'function') {
    return (task, timeout = 180) => window.requestIdleCallback(() => task(), { timeout });
  }
  return (task) => window.setTimeout(task, 32);
})();

// Soporte para librerías externas de exportación
let xlsxLibraryPromise = null;

/**
 * Asegura la carga dinámica de la librería SheetJS (XLSX).
 * @returns {Promise<Object>} Instancia de XLSX.
 */
export function ensureXlsxLibrary() {
  if (typeof window.XLSX !== 'undefined') return Promise.resolve(window.XLSX);
  if (xlsxLibraryPromise) return xlsxLibraryPromise;
  xlsxLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.XLSX !== 'undefined') resolve(window.XLSX);
      else reject(new Error('XLSX no disponible tras cargar el script.'));
    };
    script.onerror = () => reject(new Error('No se pudo cargar el generador XLSX.'));
    document.head.appendChild(script);
  }).catch((error) => {
    xlsxLibraryPromise = null;
    throw error;
  });
  return xlsxLibraryPromise;
}
