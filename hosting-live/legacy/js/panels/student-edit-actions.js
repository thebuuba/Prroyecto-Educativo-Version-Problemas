import { toast } from '../core/domain-utils.js';

export function registerStudentEditActions({ FormState, updateSync }) {
  window.updateStudentEditField = (field, value) => {
    if (field === 'matricula') {
      value = value.replace(/\D/g, '').slice(0, 9);
      if (value.length > 2) value = `${value.slice(0, 2)}-${value.slice(2)}`;
      if (value.length > 7) value = `${value.slice(0, 7)}-${value.slice(7)}`;
      const input = document.getElementById('se-mat');
      if (input) input.value = value;
    }

    FormState[field] = value;
    updateSync();
  };

  window.handleStudentEditPhoto = (input) => {
    const file = input?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      FormState.photoUrl = event.target.result;
      updateSync();
    };
    reader.readAsDataURL(file);
  };

  window.confirmSaveEditStudent = async () => {
    if (typeof window.saveEditStudent !== 'function') {
      toast('Error: Motor de edición no disponible', true);
      return;
    }

    try {
      await window.saveEditStudent();
    } catch (err) {
      console.error('[EduGest][student-edit] Error:', err);
      toast('Error al actualizar estudiante', true);
    }
  };

  window.handleDeleteStudent = (id) => {
    if (typeof window.delEst === 'function') {
      window.delEst(id);
    } else {
      toast('Motor de eliminación no disponible', true);
    }
  };
}
