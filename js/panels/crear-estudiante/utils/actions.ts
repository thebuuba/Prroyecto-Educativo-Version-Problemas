import { toast } from '../../../core/domain-utils.ts';
import { go } from '../../../core/routing.ts';
import { saveEst } from '../../../core/student-logic.ts';

let createActionsContext = null;

function getCreateActionsContext() {
  if (!createActionsContext?.FormState || typeof createActionsContext.updatePreviews !== 'function') {
    console.warn('[EduGest][student-create] Contexto de formulario no inicializado');
    return null;
  }
  return createActionsContext;
}

export function updateStudentCreateField(field, value) {
  const ctx = getCreateActionsContext();
  if (!ctx) return false;
  const { FormState, updatePreviews } = ctx;

  if (field === 'matricula') {
    value = value.replace(/\D/g, '').slice(0, 9);
    if (value.length > 2) value = `${value.slice(0, 2)}-${value.slice(2)}`;
    if (value.length > 7) value = `${value.slice(0, 7)}-${value.slice(7)}`;

    const input = document.getElementById('sc-mat');
    if (input) input.value = value;
  }

  FormState[field] = value;
  updatePreviews();
  return true;
}

export function handleStudentCreatePhoto(input) {
  const ctx = getCreateActionsContext();
  if (!ctx) return false;
  const { FormState, updatePreviews } = ctx;
  const file = input?.files?.[0];
  if (!file) {
    FormState.photoUrl = '';
    updatePreviews();
    return true;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    FormState.photoUrl = event.target.result;
    updatePreviews();
  };
  reader.readAsDataURL(file);
  return true;
}

export async function confirmSaveStudent(isBulk = false) {
  const ctx = getCreateActionsContext();
  if (!ctx) return false;
  const { FormState, updatePreviews } = ctx;

  try {
    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setVal('e-nom', FormState.nombre);
    setVal('e-ape', FormState.apellido);
    setVal('e-mat', FormState.matricula);
    setVal('e-sec', FormState.courseId);
    setVal('e-photo-data', FormState.photoUrl);

    await saveEst({ keepOpen: isBulk });

    if (isBulk) {
      FormState.nombre = '';
      FormState.apellido = '';
      FormState.matricula = '';
      FormState.photoUrl = '';

      const nomInput = document.getElementById('sc-nom');
      const apeInput = document.getElementById('sc-ape');
      const matInput = document.getElementById('sc-mat');
      if (nomInput) {
        nomInput.value = '';
        nomInput.focus();
      }
      if (apeInput) apeInput.value = '';
      if (matInput) matInput.value = '';

      updatePreviews();
    } else {
      go('estudiantes');
    }

    return true;
  } catch (err) {
    console.error('[EduGest][student-create] Error:', err);
    toast('Error al guardar estudiante', true);
    return false;
  }
}

export function registerStudentCreateActions(context) {
  createActionsContext = context;
  window.updateStudentCreateField = updateStudentCreateField;
  window.handleStudentCreatePhoto = handleStudentCreatePhoto;
  window.confirmSaveStudent = confirmSaveStudent;
}
