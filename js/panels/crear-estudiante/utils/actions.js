import { toast } from '../../../core/domain-utils.js';

export function registerStudentCreateActions({ FormState, updatePreviews }) {
  window.updateStudentCreateField = (field, value) => {
    if (field === 'matricula') {
      value = value.replace(/\D/g, '').slice(0, 9);
      if (value.length > 2) value = `${value.slice(0, 2)}-${value.slice(2)}`;
      if (value.length > 7) value = `${value.slice(0, 7)}-${value.slice(7)}`;

      const input = document.getElementById('sc-mat');
      if (input) input.value = value;
    }

    FormState[field] = value;
    updatePreviews();
  };

  window.handleStudentCreatePhoto = (input) => {
    const file = input?.files?.[0];
    if (!file) {
      FormState.photoUrl = '';
      updatePreviews();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      FormState.photoUrl = event.target.result;
      updatePreviews();
    };
    reader.readAsDataURL(file);
  };

  window.confirmSaveStudent = async (isBulk = false) => {
    if (typeof window.saveEst !== 'function') {
      toast('Error: Motor de guardado no disponible', true);
      return;
    }

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

      await window.saveEst({ keepOpen: isBulk });

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
        window.go('estudiantes');
      }
    } catch (err) {
      console.error('[EduGest][student-create] Error:', err);
      toast('Error al guardar estudiante', true);
    }
  };
}
