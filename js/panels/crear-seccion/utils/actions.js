import { toast } from '../../../core/domain-utils.js';

export function registerSectionCreateActions({
  FormState,
  actualizarPreviews,
  actualizarSubjectGrid,
  obtenerAreaCatalogForCurrentGrade,
}) {
  window.updateSectionCreateField = (field, value) => {
    FormState[field] = value;

    if (field === 'gradeId') {
      FormState.area = '';
      FormState.subject = '';
      actualizarSubjectGrid();
    }

    if (field === 'area') {
      FormState.subject = '';
      actualizarSubjectGrid();

      const catalog = obtenerAreaCatalogForCurrentGrade().find((a) => a.area === value);
      if (catalog && catalog.subjects.length === 1) {
        FormState.subject = catalog.subjects[0];
        actualizarSubjectGrid();
      }
    }

    actualizarPreviews();
  };

  window.confirmSaveSection = async () => {
    if (typeof window.saveSec !== 'function') {
      toast('Error: Motor de guardado no disponible', true);
      return;
    }

    try {
      const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v;
      };
      setVal('sec-g', FormState.gradeId);
      setVal('sec-s', FormState.section);
      setVal('sec-m', FormState.subject);
      setVal('sec-area', FormState.area);
      setVal('sec-room-data', FormState.room);

      await window.saveSec();
    } catch (err) {
      console.error('[EduGest][section-create] Error:', err);
      toast('Error al guardar asignatura', true);
    }
  };
}
