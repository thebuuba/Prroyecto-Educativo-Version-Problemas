import { S } from '../../../../../../js/core/state.ts';
import { closeM, forceCloseM } from '../../../../../../js/core/ui.ts';
import {
  BULK_IMPORT_STATE,
  analyzeBulkInput,
  handleBulkFileChange,
  openBulkEstM,
  saveBulkEst,
} from '../../../../../../js/core/student-logic.ts';

export function setBulkInputMode(mode: string): boolean {
  const nextMode = mode === 'file' ? 'file' : 'text';
  BULK_IMPORT_STATE.mode = nextMode;
  BULK_IMPORT_STATE.analyzed = false;

  const textWrap = document.getElementById('be-text-wrap');
  const fileWrap = document.getElementById('be-file-wrap');
  if (textWrap) textWrap.hidden = nextMode !== 'text';
  if (fileWrap) fileWrap.hidden = nextMode !== 'file';

  document.getElementById('be-mode-text')?.classList.toggle('btn-primary', nextMode === 'text');
  document.getElementById('be-mode-file')?.classList.toggle('btn-primary', nextMode === 'file');
  return true;
}

function downloadTextFile(filename: string, content: string, type = 'text/csv;charset=utf-8'): boolean {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function exportStudentTemplate(): boolean {
  return downloadTextFile('plantilla-estudiantes.csv', 'matricula,nombre,apellido\n00-0001-1,Juan,Perez\n');
}

export function exportBulkErrorReport(): boolean {
  const rows = (BULK_IMPORT_STATE.entries || [])
    .filter((entry: any) => entry?.status && entry.status !== 'new')
    .map((entry: any) => `${entry.row || ''},${entry.matricula || ''},${entry.nombre || ''},${entry.status || ''}`)
    .join('\n');
  return downloadTextFile('errores-carga-estudiantes.csv', `fila,matricula,nombre,estado\n${rows}\n`);
}

export async function openBulkUpload(sectionId = ''): Promise<boolean> {
  forceCloseM('m-est');
  await openBulkEstM(sectionId || S.activeGroupId || '');
  return true;
}

export async function previewBulkStudents(): Promise<boolean> {
  return (await analyzeBulkInput()) === true;
}

export async function confirmBulkStudents(): Promise<boolean> {
  await saveBulkEst();
  return true;
}

export function cancelBulkUpload(): boolean {
  closeM('m-est-bulk');
  return true;
}

export function importStudents(input?: HTMLInputElement): boolean {
  if (!input) return false;
  handleBulkFileChange(input);
  return true;
}

export function isBulkAnalyzed(): boolean {
  return BULK_IMPORT_STATE.analyzed === true;
}
