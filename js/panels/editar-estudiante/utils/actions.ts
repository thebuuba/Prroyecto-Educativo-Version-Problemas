import { toast } from '../../../core/domain-utils.ts';
import { delEst } from '../../../core/deleters.ts';
import { saveEditStudent } from '../../../core/student-logic.ts';

let editActionsContext = null;

function getEditActionsContext() {
  if (!editActionsContext?.FormState || typeof editActionsContext.updateSync !== 'function') {
    console.warn('[EduGest][student-edit] Contexto de formulario no inicializado');
    return null;
  }
  return editActionsContext;
}

export function updateStudentEditField(field, value) {
  const ctx = getEditActionsContext();
  if (!ctx) return false;
  const { FormState, updateSync } = ctx;

  if (field === 'matricula') {
    value = value.replace(/\D/g, '').slice(0, 9);
    if (value.length > 2) value = `${value.slice(0, 2)}-${value.slice(2)}`;
    if (value.length > 7) value = `${value.slice(0, 7)}-${value.slice(7)}`;
    const input = document.getElementById('se-mat');
    if (input) input.value = value;
  }

  FormState[field] = value;
  updateSync();
  return true;
}

export function handleStudentEditPhoto(input) {
  const ctx = getEditActionsContext();
  if (!ctx) return false;
  const { FormState, updateSync } = ctx;
  const file = input?.files?.[0];
  if (!file) return false;

  const reader = new FileReader();
  reader.onload = (event) => {
    FormState.photoUrl = event.target.result;
    updateSync();
  };
  reader.readAsDataURL(file);
  return true;
}

export async function confirmSaveEditStudent() {
  if (!getEditActionsContext()) return false;

  try {
    await saveEditStudent();
    return true;
  } catch (err) {
    console.error('[EduGest][student-edit] Error:', err);
    toast('Error al actualizar estudiante', true);
    return false;
  }
}

export function handleDeleteStudent(id) {
  if (!id) return false;
  void delEst(id);
  return true;
}

export function registerStudentEditActions(context) {
  editActionsContext = context;
  window.updateStudentEditField = updateStudentEditField;
  window.handleStudentEditPhoto = handleStudentEditPhoto;
  window.confirmSaveEditStudent = confirmSaveEditStudent;
  window.handleDeleteStudent = handleDeleteStudent;
}
