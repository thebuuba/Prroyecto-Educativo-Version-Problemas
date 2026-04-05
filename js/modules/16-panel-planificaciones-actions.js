// Reinicia el borrador de planificación y limpia el estado auxiliar del editor para empezar desde una base sana.
function lessonPlanResetDraft(groupId = '', periodId = S.activePeriodId) {
  ensureLessonPlansState();
  S.lessonPlanDraft = lessonPlanCreateBlank(groupId, periodId);
  S.lessonPlanUi.expandedClassIds = S.lessonPlanDraft.classes.map((lessonClass) => lessonClass.id);
  S.lessonPlanUi.activityDrafts = {};
  S.lessonPlanUi.activeSectionId = 'general';
  S.lessonPlanUi.generalErrors = {};
  S.lessonPlanUi.curriculumErrors = {};
  S.lessonPlanUi.curriculumBlockErrors = {};
}

// Crea una planificación nueva usando, si se pide, el grupo y período activos como contexto inicial.
function lessonPlanNew(options = {}) {
  const useContext = !!options.useContext;
  const groupId = useContext ? (options.groupId || S.activeGroupId || '') : '';
  const periodId = options.periodId || S.activePeriodId;
  lessonPlanResetDraft(groupId, periodId);
  lessonPlanSetMode('editor');
  lessonPlanSyncDraftRecord('draft');
  persist({ immediate: true });
  go('planificaciones');
  setTimeout(() => {
    scrollToLessonPlanComposer(false);
  }, 50);
}

// Alias semántico para reabrir una planificación existente en modo edición.
function lessonPlanEdit(id) {
  lessonPlanContinue(id);
}

// Rehidrata un borrador guardado y devuelve al usuario al paso exacto donde dejó la planificación.
function lessonPlanContinue(id) {
  ensureLessonPlansState();
  // Gestiona plan.
  const plan = (S.lessonPlans || []).find((item) => item.id === id);
  if (!plan) return;
  S.lessonPlanDraft = lessonPlanNormalizePlan(plan);
  S.lessonPlanUi.expandedClassIds = S.lessonPlanDraft.classes.map((lessonClass) => lessonClass.id);
  S.lessonPlanUi.activityDrafts = {};
  S.lessonPlanUi.activeSectionId = S.lessonPlanDraft.editorStep || 'general';
  S.lessonPlanUi.generalErrors = {};
  S.lessonPlanUi.curriculumErrors = {};
  S.lessonPlanUi.curriculumBlockErrors = {};
  lessonPlanSetMode('editor');
  persist({ immediate: true });
  go('planificaciones');
  setTimeout(() => {
    scrollToLessonPlanComposer(false);
  }, 50);
}

// Clona una planificación existente como nuevo borrador para reutilizar estructura sin tocar el original.
function lessonPlanDuplicate(id) {
  ensureLessonPlansState();
  // Gestiona plan.
  const plan = (S.lessonPlans || []).find((item) => item.id === id);
  if (!plan) return;
  const copy = lessonPlanNormalizePlan(plan);
  copy.id = uid();
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.status = 'draft';
  copy.editorStep = 'general';
  copy.general.title = `${copy.general.title || 'Planificación'} (copia)`;
  S.lessonPlanDraft = copy;
  S.lessonPlanUi.expandedClassIds = copy.classes.map((lessonClass) => lessonClass.id);
  S.lessonPlanUi.activityDrafts = {};
  S.lessonPlanUi.activeSectionId = 'general';
  S.lessonPlanUi.generalErrors = {};
  S.lessonPlanUi.curriculumErrors = {};
  S.lessonPlanUi.curriculumBlockErrors = {};
  lessonPlanSetMode('editor');
  lessonPlanSyncDraftRecord('draft');
  persist({ immediate: true });
  go('planificaciones');
  setTimeout(() => {
    scrollToLessonPlanComposer(false);
  }, 50);
}

// Valida el borrador actual, lo normaliza como planificación completa y lo mueve al listado final.
function saveLessonPlan() {
  ensureLessonPlansState();
  lessonPlanCancelAutosave();
  const draft = lessonPlanNormalizePlan(S.lessonPlanDraft);
  const groupId = draft.general.groupId || draft.groupId || S.activeGroupId;
  const periodId = draft.general.periodId || draft.periodId || S.activePeriodId || 'P1';
  if (!groupId) {
    toast('Selecciona primero la materia o curso de la planificación', true);
    return;
  }
  if (!draft.general.title) {
    toast('Escribe el título de la secuencia didáctica', true);
    return;
  }
  if (!draft.classes.length) {
    toast('La planificación necesita al menos una clase', true);
    return;
  }
  draft.groupId = groupId;
  draft.periodId = periodId;
  draft.general.groupId = groupId;
  draft.general.sectionId = draft.general.sectionId || groupId;
  draft.general.periodId = periodId;
  draft.general.classCount = draft.classes.length;
  draft.status = 'completed';
  draft.editorStep = 'preview';
  draft.updatedAt = Date.now();
  draft.classes = draft.classes.map((lessonClass, index) => lessonPlanNormalizeClass(lessonClass, index + 1));
  // Gestiona idx.
  const idx = (S.lessonPlans || []).findIndex((item) => item.id === draft.id);
  if (idx >= 0) S.lessonPlans[idx] = draft;
  else S.lessonPlans.unshift(draft);
  S.lessonPlanDraft = lessonPlanNormalizePlan(draft);
  lessonPlanSetMode('home');
  persist();
  go('planificaciones');
  toast('Planificación guardada');
}

// Elimina una planificación o borrador y restablece el editor si ese documento era el que estaba abierto.
function deleteLessonPlan(id) {
  ensureLessonPlansState();
  if (!confirm('¿Deseas eliminar esta planificación en proceso? Esta acción no se puede deshacer.')) return;
  S.lessonPlans = (S.lessonPlans || []).filter((plan) => plan.id !== id);
  if (S.lessonPlanDraft?.id === id) {
    lessonPlanResetDraft(S.activeGroupId, S.activePeriodId);
    lessonPlanSetMode('home');
  }
  persist();
  go('planificaciones');
  toast('Planificación eliminada');
}

// Sale del editor, descarga autosaves pendientes y devuelve al usuario al home de planificaciones.
function lessonPlanReturnHome() {
  lessonPlanFlushPendingAutosave();
  lessonPlanSetMode('home');
  persist({ immediate: true });
  closeM('m-lesson-plan-section');
  go('planificaciones');
}

// Lleva el viewport al compositor del editor y, si aplica, enfoca el primer campo relevante.
function scrollToLessonPlanComposer(allowFocus = true) {
  const target = document.getElementById('lesson-plan-composer');
  if (!target) return;
  target.scrollIntoView({ behavior: 'auto', block: 'start' });
  if (!allowFocus) return;
  const firstField = document.getElementById('lesson-plan-title');
  if (firstField) setTimeout(() => firstField.focus(), 80);
}

// Abre una ventana auxiliar de impresión/exportación para PDF o vistas formales de la planificación.
function lessonPlanOpenPrintWindow(title, html) {
  const w = window.open('', '_blank', 'width=1200,height=900');
  if (!w) {
    toast('El navegador bloqueó la ventana de exportación', true);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (_) {} }, 400);
}

// Construye el cuerpo HTML exportable con todos los bloques pedagógicos de una planificación concreta.
function lessonPlanBuildExportBody(plan) {
  const linkedActivities = plan.classes.flatMap((lessonClass) => lessonClass.activityLinks || []);
  const classDate = String(plan.general.classDate || plan.general.startDate || plan.classes?.[0]?.date || '').trim();
  const mainTitle = String(plan.general.themeTitle || plan.general.title || '').trim();
  return `
    <div class="lp-export">
      <div class="lp-export-head">
        <div>
          <div class="lp-export-kicker">Planificación docente</div>
          <h1>${escapeHtml(mainTitle || 'Sin título')}</h1>
          <div class="lp-export-meta">${escapeHtml(plan.general.center || '')} - ${escapeHtml(plan.general.teacher || '')}</div>
        </div>
        <div class="lp-export-badge">${escapeHtml(getGroupLabel(plan.groupId) || 'Curso')}</div>
      </div>
      <section class="lp-export-section">
        <h2>Datos generales</h2>
        <div class="lp-export-grid lp-export-grid-3">
          <div><strong>Área</strong><span>${escapeHtml(plan.general.area || 'Sin definir')}</span></div>
          <div><strong>Asignatura</strong><span>${escapeHtml(plan.general.subject || 'Sin definir')}</span></div>
          <div><strong>Subárea</strong><span>${escapeHtml(plan.general.subarea || 'Sin definir')}</span></div>
          <div><strong>Grado</strong><span>${escapeHtml(plan.general.gradeName || 'Sin definir')}</span></div>
          <div><strong>Sección</strong><span>${escapeHtml(plan.general.sectionName || 'Sin definir')}</span></div>
          <div><strong>Período</strong><span>${escapeHtml(periodName(plan.periodId))}</span></div>
          <div><strong>Título del tema</strong><span>${escapeHtml(mainTitle || 'Sin definir')}</span></div>
          <div><strong>Secuencia didáctica</strong><span>${escapeHtml(plan.general.sequenceName || 'No aplica')}</span></div>
          <div><strong>Fecha de la clase</strong><span>${escapeHtml(fmtDate(classDate) || 'Sin definir')}</span></div>
          <div><strong>Eje transversal</strong><span>${escapeHtml(plan.general.transversalAxis || 'Sin definir')}</span></div>
          <div><strong>Horario docente</strong><span>${escapeHtml(plan.general.scheduleLinked ? 'Vinculado' : 'Libre')}</span></div>
        </div>
      </section>
      <section class="lp-export-section">
        <h2>Base curricular</h2>
        <div class="lp-export-grid">
          <div><strong>Competencias fundamentales</strong><p>${escapeHtml(plan.curriculum.fundamentalCompetencies || 'Sin completar')}</p></div>
          <div><strong>Competencias específicas</strong><p>${escapeHtml(plan.curriculum.specificCompetencies || 'Sin completar')}</p></div>
          <div><strong>Contenidos conceptuales</strong><p>${escapeHtml(plan.curriculum.conceptualContents || 'Sin completar')}</p></div>
          <div><strong>Contenidos procedimentales</strong><p>${escapeHtml(plan.curriculum.proceduralContents || 'Sin completar')}</p></div>
          <div><strong>Contenidos actitudinales y valores</strong><p>${escapeHtml(plan.curriculum.attitudinalContents || 'Sin completar')}</p></div>
          <div><strong>Indicadores de logro</strong><p>${escapeHtml(plan.curriculum.indicators || 'Sin completar')}</p></div>
        </div>
      </section>
      <section class="lp-export-section">
        <h2>Estrategia de enseñanza y aprendizaje</h2>
        <div class="lp-export-grid">
          <div><strong>Estrategia general</strong><p>${escapeHtml(plan.strategy.teachingLearning || 'Sin completar')}</p></div>
          <div><strong>Metodología</strong><p>${escapeHtml(plan.strategy.methodology || 'Sin completar')}</p></div>
          <div><strong>Organización</strong><p>${escapeHtml(plan.strategy.organization || 'Sin completar')}</p></div>
          <div><strong>Adecuaciones / inclusión</strong><p>${escapeHtml(plan.strategy.inclusionNotes || 'Sin completar')}</p></div>
        </div>
      </section>
      <section class="lp-export-section">
        <h2>Secuencia de clases</h2>
        ${plan.classes.map((lessonClass) => {
          // Gestiona linked.
          const linked = (lessonClass.activityLinks || []).map((link) => {
            const found = findActivity(link.activityId);
            const activity = found?.activity || {};
            const instrument = getInstrumentById(link.instrumentId || activity.instrumentId || '');
            return `<li><strong>${escapeHtml(activity.name || 'Actividad vinculada')}</strong> - ${escapeHtml(lessonPlanBlockLabel(link.blockId))}${instrument ? ` - ${escapeHtml(instrument.name)}` : ''}</li>`;
          }).join('');
          return `
            <article class="lp-export-class">
              <div class="lp-export-class-head">
                <h3>Clase ${lessonClass.index}${lessonClass.title ? ` - ${escapeHtml(lessonClass.title)}` : ''}</h3>
                <div>${escapeHtml(fmtDate(lessonClass.date) || 'Sin fecha')} - ${escapeHtml(lessonClass.durationMinutes || 'Duración por definir')}</div>
              </div>
              <div class="lp-export-grid lp-export-grid-3">
                <div><strong>Intención pedagógica</strong><p>${escapeHtml(lessonClass.pedagogicalIntent || 'Sin completar')}</p></div>
                <div><strong>Recursos</strong><p>${escapeHtml([...(lessonClass.resourcesPreset || []), lessonClass.resourcesText || ''].filter(Boolean).join(', ') || 'Sin completar')}</p></div>
                <div><strong>Observaciones</strong><p>${escapeHtml(lessonClass.notes || 'Sin completar')}</p></div>
              </div>
              <div class="lp-export-stage-grid">
                <div><strong>Inicio</strong><p>${escapeHtml(lessonClass.start.description || 'Sin completar')}</p><small>${escapeHtml(lessonClass.start.questions || '')}</small></div>
                <div><strong>Desarrollo</strong><p>${escapeHtml(lessonClass.development.description || 'Sin completar')}</p><small>${escapeHtml(lessonClass.development.activities || '')}</small></div>
                <div><strong>Cierre</strong><p>${escapeHtml(lessonClass.closure.summary || 'Sin completar')}</p><small>${escapeHtml(lessonClass.closure.task || '')}</small></div>
              </div>
              <div><strong>Actividades vinculadas</strong>${linked ? `<ul>${linked}</ul>` : '<p>Sin actividades vinculadas</p>'}</div>
            </article>`;
        }).join('')}
      </section>
      <section class="lp-export-section">
        <h2>Evaluación vinculada</h2>
        ${linkedActivities.length ? `<ul>${linkedActivities.map((link) => {
          const found = findActivity(link.activityId);
          const activity = found?.activity || {};
          const instrument = getInstrumentById(link.instrumentId || activity.instrumentId || '');
          return `<li><strong>${escapeHtml(activity.name || 'Actividad')}</strong> - ${escapeHtml(lessonPlanBlockLabel(link.blockId))} - ${escapeHtml(link.technique || activity.technique || activity.tipo || 'Técnica por definir')}${instrument ? ` - ${escapeHtml(instrument.name)}` : ''}</li>`;
        }).join('')}</ul>` : '<p>Sin actividades vinculadas</p>'}
      </section>
    </div>`;
}

// Envuelve el cuerpo exportable en un documento completo con estilos de impresión.
function lessonPlanBuildExportHtml(plan) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(plan.general.themeTitle || plan.general.title || 'Planificación')}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    body{margin:0;background:#fff;color:#0f172a;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .lp-export{padding:18px;}
    .lp-export-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:18px;border:1px solid #d8e5f5;border-radius:18px;background:#eef5ff;}
    .lp-export-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6481a5;}
    .lp-export-head h1{margin:6px 0 4px;font-size:28px;line-height:1.1;color:#19355a;}
    .lp-export-meta{font-size:13px;color:#4c6788;}
    .lp-export-badge{padding:10px 16px;border-radius:999px;background:#dbe9fb;font-weight:800;color:#22406d;}
    .lp-export-section{margin-top:18px;padding:16px;border:1px solid #d8e5f5;border-radius:18px;}
    .lp-export-section h2{margin:0 0 12px;font-size:18px;color:#19355a;}
    .lp-export-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
    .lp-export-grid-3{grid-template-columns:repeat(3,minmax(0,1fr));}
    .lp-export-grid strong,.lp-export-stage-grid strong{display:block;margin-bottom:4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6481a5;}
    .lp-export-grid span,.lp-export-grid p,.lp-export-stage-grid p,.lp-export-stage-grid small{display:block;margin:0;color:#17365e;line-height:1.45;white-space:pre-wrap;}
    .lp-export-class{padding:14px;border:1px solid #dce7f4;border-radius:16px;margin-bottom:12px;background:#fbfdff;}
    .lp-export-class-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:12px;font-weight:700;color:#21416d;}
    .lp-export-class-head h3{margin:0;font-size:17px;}
    .lp-export-stage-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0;}
    ul{margin:8px 0 0 18px;padding:0;}
    li{margin-bottom:4px;line-height:1.45;}
  </style></head><body>${lessonPlanBuildExportBody(plan)}</body></html>`;
}

// Exporta una planificación guardada a una ventana imprimible orientada a PDF.
function lessonPlanExportPdf(id) {
  const plan = (S.lessonPlans || []).find((item) => item.id === id);
  if (!plan) return;
  lessonPlanOpenPrintWindow(plan.general.title || 'Planificación', lessonPlanBuildExportHtml(plan));
}

// Exporta el borrador actualmente abierto sin exigir que primero se guarde como planificación final.
function lessonPlanExportDraftPdf() {
  const plan = lessonPlanNormalizePlan(S.lessonPlanDraft);
  lessonPlanOpenPrintWindow(plan.general.themeTitle || plan.general.title || 'Planificación', lessonPlanBuildExportHtml(plan));
}

// Descarga una planificación guardada como documento Word usando el HTML formal de exportación.
function lessonPlanExportWord(id) {
  const plan = (S.lessonPlans || []).find((item) => item.id === id);
  if (!plan) return;
  const blob = new Blob(['\ufeff', lessonPlanBuildExportHtml(plan)], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(plan.general.title || 'planificacion').replace(/[^\w\-]+/g, '-').toLowerCase()}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
