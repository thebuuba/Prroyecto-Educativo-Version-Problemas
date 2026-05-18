export const BULK_IMPORT_STATE = {
  mode: 'text',
  analyzed: false,
  entries: [],
  sourceName: '',
  lastRows: 0,
};

export function getBulkStudentsState() {
  return BULK_IMPORT_STATE;
}

export function setBulkStudentsState(nextState: Record<string, unknown> = {}) {
  Object.assign(BULK_IMPORT_STATE, nextState);
  return BULK_IMPORT_STATE;
}

export function clearBulkStudentsState() {
  BULK_IMPORT_STATE.mode = 'text';
  BULK_IMPORT_STATE.analyzed = false;
  BULK_IMPORT_STATE.entries = [];
  BULK_IMPORT_STATE.sourceName = '';
  BULK_IMPORT_STATE.lastRows = 0;
  return BULK_IMPORT_STATE;
}

export function setBulkFile(fileOrName: File | string | null | undefined) {
  const sourceName = typeof fileOrName === 'string' ? fileOrName : String(fileOrName?.name || '');
  BULK_IMPORT_STATE.mode = 'file';
  BULK_IMPORT_STATE.sourceName = sourceName;
  return BULK_IMPORT_STATE;
}

export function getBulkFile() {
  return BULK_IMPORT_STATE.sourceName;
}

export function setBulkMode(mode = 'text') {
  BULK_IMPORT_STATE.mode = mode === 'file' ? 'file' : 'text';
  BULK_IMPORT_STATE.analyzed = false;
  return BULK_IMPORT_STATE.mode;
}

export function getBulkMode() {
  return BULK_IMPORT_STATE.mode;
}
