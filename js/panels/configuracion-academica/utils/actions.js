import { toast } from '../../../core/domain-utils.js';

export function registerGradeSetupActions({
  FormState,
  subjectsForArea,
  actualizarGradeGrid,
  actualizarAreaGrid,
  actualizarSubjectGrid,
  actualizarSectionGrid,
  actualizarPreviews,
}) {
  window.updateGradeSetupField = (field, value) => {
    FormState[field] = value;

    if (field === 'level') {
      FormState.grade = '';
      FormState.area = '';
      FormState.subject = '';

      document.querySelectorAll('.grade-setup-card-btn').forEach((btn) => {
        const btnLevel = btn.dataset.level;
        const isSelected = btnLevel === value;
        if (isSelected) {
          btn.classList.add('border-blue-600', 'bg-blue-50/50');
          btn.classList.remove('border-slate-100', 'bg-slate-50/50');
          btn.querySelector('.grade-level-title')?.classList.add('text-blue-700');
          btn.querySelector('.grade-level-title')?.classList.remove('text-slate-600');
          btn.querySelector('.grade-level-check')?.classList.remove('hidden');
        } else {
          btn.classList.remove('border-blue-600', 'bg-blue-50/50');
          btn.classList.add('border-slate-100', 'bg-slate-50/50');
          btn.querySelector('.grade-level-title')?.classList.remove('text-blue-700');
          btn.querySelector('.grade-level-title')?.classList.add('text-slate-600');
          btn.querySelector('.grade-level-check')?.classList.add('hidden');
        }
      });

      actualizarGradeGrid();
      actualizarAreaGrid();
    }

    if (field === 'grade') actualizarGradeGrid();

    if (field === 'area') {
      FormState.subject = '';
      actualizarAreaGrid();
      const subjects = subjectsForArea(FormState.level, FormState.area);
      if (subjects.length === 1) {
        FormState.subject = subjects[0];
        actualizarSubjectGrid();
      }
    }

    if (field === 'subject') actualizarSubjectGrid();
    if (field === 'section') actualizarSectionGrid();

    actualizarPreviews();
  };

  window.confirmSaveGrade = async () => {
    if (!FormState.grade) {
      toast('Debes seleccionar un grado', true);
      return;
    }
    if (!FormState.area) {
      toast('Selecciona el área curricular', true);
      return;
    }
    if (!FormState.subject) {
      toast('Selecciona la asignatura', true);
      return;
    }

    if (typeof window.saveGrade === 'function') {
      try {
        await window.saveGrade(FormState);
      } catch (err) {
        console.error('[EduGest][setup] Fallo al guardar grado:', err);
        toast('Error al guardar el grado', true);
      }
    } else {
      toast('Error: Motor de guardado no inicializado', true);
    }
  };
}
