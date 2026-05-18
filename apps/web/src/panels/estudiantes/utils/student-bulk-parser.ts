import { formatMatricula } from '../../../../../../js/core/domain-utils.ts';

type BulkStudentRow = {
  row?: number;
  matricula?: string;
  nombre?: string;
  apellido?: string;
  status?: string;
};

export function normalizeBulkStudentRow(row: BulkStudentRow = {}): BulkStudentRow {
  return {
    row: row.row,
    matricula: formatMatricula(row.matricula || ''),
    nombre: String(row.nombre || '').trim(),
    apellido: String(row.apellido || '').trim(),
    status: row.status || 'new',
  };
}

export function validateBulkStudentRow(row: BulkStudentRow = {}): boolean {
  return Boolean(row.matricula && row.nombre);
}

export function mapBulkStudentFields(parts: string[] = [], rowNumber = 0): BulkStudentRow | null {
  const row = normalizeBulkStudentRow({
    row: rowNumber,
    matricula: parts[0],
    nombre: parts[1],
    apellido: parts[2] || '',
    status: 'new',
  });
  return validateBulkStudentRow(row) ? row : null;
}

export function parseBulkStudentLine(line = '', rowNumber = 0): BulkStudentRow | null {
  const parts = line.split(/[,;\t]/).map((part) => part.trim());
  if (parts.length < 2) return null;
  return mapBulkStudentFields(parts, rowNumber);
}

export function parseBulkStudentText(text = ''): BulkStudentRow[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, idx) => parseBulkStudentLine(line, idx + 1))
    .filter(Boolean) as BulkStudentRow[];
}
