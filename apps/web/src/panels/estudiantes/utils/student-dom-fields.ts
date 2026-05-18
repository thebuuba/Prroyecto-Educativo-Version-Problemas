import {
  buildStudentAvatarDataUrl,
  formatMatricula,
  v,
} from '../../../../../../js/core/domain-utils.ts';

type StudentLike = Record<string, any>;

function setValue(id: string, value: unknown): void {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (el) el.value = String(value ?? '');
}

function setText(id: string, value: unknown): void {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value ?? '');
}

function setImageSrc(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLImageElement | null;
  if (el) el.src = value;
}

export function readStudentCreateFields() {
  return {
    nombre: v('e-nom'),
    apellido: v('e-ape'),
    matriculaOriginal: v('e-mat'),
    selectedSectionId: String((document.getElementById('e-sec') as HTMLSelectElement | null)?.value || ''),
    photoUrl: String((document.getElementById('e-photo-data') as HTMLInputElement | null)?.value || '').trim(),
  };
}

export function writeStudentCreateMatricula(matricula = ''): void {
  setValue('e-mat', matricula);
}

export function focusStudentCreateName(): void {
  document.getElementById('e-nom')?.focus();
}

export function clearStudentCreateFields(): void {
  setValue('e-nom', '');
  setValue('e-ape', '');
  setValue('e-mat', '');
  setValue('e-photo-data', '');
}

export function readStudentEditFields() {
  return {
    id: v('ee-id'),
    nombre: v('ee-nom'),
    apellido: v('ee-ape'),
    matriculaOriginal: v('ee-mat'),
    selectedSectionId: String((document.getElementById('ee-sec') as HTMLSelectElement | null)?.value || ''),
    photoUrl: v('ee-photo-data'),
  };
}

export function writeStudentEditFields(student: StudentLike): void {
  const fullName = `${student?.nombre || ''} ${student?.apellido || ''}`;
  setValue('ee-id', student?.id || '');
  setValue('ee-nom', student?.nombre || '');
  setValue('ee-ape', student?.apellido || '');
  setValue('ee-mat', formatMatricula(student?.matricula || ''));
  setValue('ee-photo-data', student?.photoUrl || '');
  setImageSrc('ee-photo-preview', student?.photoUrl || buildStudentAvatarDataUrl(fullName));
}

export function clearStudentEditFields(): void {
  setValue('ee-id', '');
  setValue('ee-nom', '');
  setValue('ee-ape', '');
  setValue('ee-mat', '');
  setValue('ee-photo-data', '');
}

export function writeStudentViewFields(student: StudentLike, details: Record<string, unknown> = {}): void {
  const fullName = String(details.fullName || `${student?.nombre || ''} ${student?.apellido || ''}`);
  setText('sv-name', fullName);
  setText('sv-hero-name', fullName);
  setText('sv-mat', student?.matricula || '?');
  setText('sv-grade', details.gradeName || '?');
  setText('sv-section', details.sectionName || '?');
  setText('sv-subject', details.subjectName || 'General');
  setImageSrc('sv-photo', student?.photoUrl || buildStudentAvatarDataUrl(fullName));
  setValue('sv-id', student?.id || '');
}
