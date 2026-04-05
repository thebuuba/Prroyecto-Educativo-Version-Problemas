/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

// Devuelve el modo visible del modulo para decidir si mostramos listado o editor completo.
function lessonPlanUiMode() {
  ensureLessonPlansState();
  return S.lessonPlanUi.mode === 'editor' ? 'editor' : 'home';
}

// Cambia el modo principal de planificaciones entre inicio y editor.
function lessonPlanSetMode(mode = 'home') {
  ensureLessonPlansState();
  S.lessonPlanUi.mode = mode === 'editor' ? 'editor' : 'home';
}

// Programa un autosave corto del borrador para no perder cambios mientras se edita la planificación.
function lessonPlanQueueAutosave() {
  ensureLessonPlansState();
  if (lessonPlanUiMode() !== 'editor') return;
  lessonPlanCancelAutosave();
  S.lessonPlanUi.autosaveTimer = setTimeout(() => {
    lessonPlanPersistDraftNow('draft');
  }, 320);
}

// Fuerza el guardado pendiente antes de salir del editor o cerrar la página.
function lessonPlanFlushPendingAutosave() {
  ensureLessonPlansState();
  if (lessonPlanUiMode() !== 'editor') return;
  if (!S.lessonPlanUi.autosaveTimer && !lessonPlanShouldKeep(S.lessonPlanDraft)) return;
  lessonPlanPersistDraftNow('draft');
}

// Expande o contrae una clase del editor para enfocar la edición en ese bloque.
function lessonPlanToggleClassExpansion(classId) {
  ensureLessonPlansState();
  const list = Array.isArray(S.lessonPlanUi.expandedClassIds) ? S.lessonPlanUi.expandedClassIds : [];
  if (list.includes(classId)) S.lessonPlanUi.expandedClassIds = list.filter((item) => item !== classId);
  else S.lessonPlanUi.expandedClassIds = [...list, classId];
  lessonPlanRefreshOpenSectionModal();
}

// Lee la sección activa del asistente de planificación para mantener navegación y validaciones alineadas.
function lessonPlanActiveSection() {
  ensureLessonPlansState();
  return String(S.lessonPlanUi.activeSectionId || '');
}

// Cambia la sección activa del editor, persiste el paso actual y reubica el scroll en el compositor.
function lessonPlanSetActiveSection(sectionId) {
  ensureLessonPlansState();
  const next = String(sectionId || '');
  S.lessonPlanUi.activeSectionId = next || 'general';
  if (S.lessonPlanDraft && typeof S.lessonPlanDraft === 'object') {
    S.lessonPlanDraft.editorStep = S.lessonPlanUi.activeSectionId;
    lessonPlanQueueAutosave();
  }
  lessonPlanRefreshOpenSectionModal();
  setTimeout(() => {
    scrollToLessonPlanComposer(false);
  }, 20);
}

// Abre una nueva planificación usando el grupo seleccionado como contexto inicial.
function openPlanningForGroup(groupId) {
  if (groupId) setActiveGroup(groupId);
  lessonPlanNew({ groupId: groupId || S.activeGroupId || '', periodId: S.activePeriodId, useContext: true });
}

// Renderiza la experiencia completa de planificaciones: listado, borradores, editor guiado y vista previa formal.
function renderLessonPlansPage() {
  ensureLessonPlansState();
  const draft = lessonPlanDraft();
  const plans = lessonPlansForGroup(S.activeGroupId);
  const drafts = lessonPlanDrafts();
  const isEditorMode = lessonPlanUiMode() === 'editor';
  // Gestiona activo grupo.
  const activeGroup = (S.secciones || []).find((section) => section.id === (draft.general.groupId || S.activeGroupId)) || null;
  // Gestiona activo grado.
  const activeGrade = (S.grades || []).find((item) => item.id === (activeGroup?.gradeId || draft.general.gradeId)) || null;
  const allCourseActivities = allActivities(draft.general.periodId || S.activePeriodId).filter(({ activity }) => (activity.courseId || '') === (draft.general.groupId || S.activeGroupId));
  const instruments = (S.instruments || [])
    .filter((instrument) => (instrument.periodId || 'P1') === (draft.general.periodId || S.activePeriodId))
    .filter((instrument) => !(draft.general.groupId || S.activeGroupId) || instrument.courseId === (draft.general.groupId || S.activeGroupId))
    .map((instrument) => ({ ...instrument, typeLabel: LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS.find((item) => item.value === instrument.type)?.label || instrument.type }));
  const completedMarkup = plans.filter((plan) => (plan.status || 'draft') === 'completed').length ? `
    <div class="lesson-plan-list">
      ${plans.filter((plan) => (plan.status || 'draft') === 'completed').map((plan) => {
        const activityCount = plan.classes.reduce((sum, lessonClass) => sum + ((lessonClass.activityLinks || []).length || 0), 0);
        return `
          <article class="lesson-plan-card">
            <div class="lesson-plan-card-head">
              <div>
                <div class="lesson-plan-card-date">${escapeHtml(fmtDate(plan.general.classDate || plan.general.startDate) || 'Sin fecha')} ? ${escapeHtml(periodName(plan.periodId))}</div>
                <h3 class="lesson-plan-card-title">${escapeHtml(plan.general.themeTitle || plan.general.title || 'Planificación')}</h3>
                <div class="lesson-plan-card-copy">${escapeHtml(plan.general.subject || activeGroup?.materia || '')} ? ${escapeHtml(plan.general.gradeName || activeGroup?.grado || '')} ${escapeHtml(plan.general.sectionName || activeGroup?.sec || '')}</div>
              </div>
              <div class="lesson-plan-card-actions">
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanEdit('${plan.id}')">Editar</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanDuplicate('${plan.id}')">Duplicar</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanExportPdf('${plan.id}')"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">PDF</button>
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanExportWord('${plan.id}')"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Word</button>
                <button class="btn btn-danger btn-sm" type="button" onclick="deleteLessonPlan('${plan.id}')">Eliminar</button>
              </div>
            </div>
            <div class="lesson-plan-card-grid">
              <div><strong>Base curricular</strong><p>${escapeHtml(plan.curriculum.specificCompetencies || 'Sin completar')}</p></div>
              <div><strong>Estrategias</strong><p>${escapeHtml(plan.strategy.teachingLearning || 'Sin completar')}</p></div>
              <div><strong>Clases</strong><p>${plan.classes.length} clase(s) ? ${activityCount} actividad(es) vinculada(s)</p></div>
              <div><strong>Recursos generales</strong><p>${escapeHtml([...(plan.resources?.preset || []), plan.resources?.notes || ''].filter(Boolean).join(', ') || 'Sin completar')}</p></div>
            </div>
          </article>`;
      }).join('')}
    </div>` : '';
  const draftCards = drafts.length ? `
    <div class="lesson-plan-draft-list">
      ${drafts.map((plan) => {
        // Gestiona grupo.
        const group = (S.secciones || []).find((section) => section.id === lessonPlanStoredGroupId(plan)) || null;
        // Gestiona grado.
        const grade = (S.grades || []).find((item) => item.id === (group?.gradeId || plan.general?.gradeId)) || null;
        const gradeLabel = plan.general?.gradeName || lessonPlanFullGradeName(group, grade) || '';
        const sectionLabel = plan.general?.sectionName || group?.sec || '';
        const classDate = lessonPlanClassDateLongLabel(plan.general?.classDate || plan.general?.startDate || '');
        return `
          <article class="lesson-plan-draft-card">
            <div class="lesson-plan-draft-copy">
              <div class="lesson-plan-draft-title">${escapeHtml(plan.general?.themeTitle || plan.general?.title || 'Sin título')}</div>
              <div class="lesson-plan-draft-meta">${escapeHtml(`${gradeLabel}${sectionLabel ? ` - ${sectionLabel}` : ''}` || 'Curso por definir')}</div>
              <div class="lesson-plan-draft-meta">${escapeHtml(plan.general?.subject || group?.materia || 'Asignatura por definir')}</div>
              <div class="lesson-plan-draft-meta">${escapeHtml(classDate || 'Fecha de la clase sin definir')}</div>
              <div class="lesson-plan-draft-updated">Última modificación: ${escapeHtml(lessonPlanRelativeUpdatedAt(plan.updatedAt || plan.createdAt || 0))}</div>
            </div>
            <div class="lesson-plan-draft-actions">
              <button class="btn btn-primary" type="button" onclick="lessonPlanContinue('${plan.id}')">Continuar</button>
              <button class="btn btn-danger btn-sm" type="button" onclick="deleteLessonPlan('${plan.id}')">Eliminar</button>
            </div>
          </article>`;
      }).join('')}
    </div>` : `<div class="empty lesson-plans-empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Aún no tienes planificaciones en proceso.</div><div class="es">Crea tu primera planificación y el sistema guardará el avance automáticamente como borrador.</div></div>`;
  const summary = lessonPlanDraftCompletionSummary(draft);
  const selectedTransversalAxis = String(draft.general.transversalAxis || '').trim();
  const transversalAxisDescription = lessonPlanTransversalAxisDescription(selectedTransversalAxis);
  const classDateValue = lessonPlanClassDateValue(draft);
  const classDateLongLabel = lessonPlanClassDateLongLabel(classDateValue);
  const nextScheduleDate = lessonPlanSuggestedNextClassDate(draft.general.groupId || S.activeGroupId, classDateValue || lessonPlanTodayIso());
  const usesTemporaryGrade = lessonPlanUsesTemporaryGrade(draft);
  const availableGrades = lessonPlanAvailableGrades();
  const selectedGradeId = usesTemporaryGrade ? LESSON_PLAN_TEMP_GRADE_VALUE : String(draft.general.gradeId || '');
  const availableAreaOptions = lessonPlanAreaOptions(draft.general.gradeId || '', draft.general.gradeName || '');
  const availableSectionOptions = lessonPlanSectionOptionsForGradeId(draft.general.gradeId || '');
  const availableSubjectOptions = lessonPlanSubjectOptionsForGradeId(draft.general.gradeId || '', draft.general.sectionName || '', draft.general.area || '', draft.general.gradeName || '');
  const hasSelectedArea = !!String(draft.general.area || '').trim();
  const subjectFieldUsesManualFallback = hasSelectedArea && !availableSubjectOptions.length;
  const subjectSelectionNeedsChoice = !!String(draft.general.area || '').trim() && availableSubjectOptions.length > 1;
  const gradeError = lessonPlanGeneralError('grade');
  const sectionError = lessonPlanGeneralError('section');
  const subjectError = lessonPlanGeneralError('subject');
  const themeTitleError = lessonPlanGeneralError('themeTitle');
  const sequenceNameError = lessonPlanGeneralError('sequenceName');
  const themeOrSequenceError = themeTitleError || sequenceNameError;
  const transversalAxisError = lessonPlanGeneralError('transversalAxis');
  const generalContent = `
    <div class="lesson-plan-form-grid lesson-plan-form-grid-3 lesson-plan-general-grid">
      <label class="fg"><span class="lbl">Centro educativo</span><input class="inp" type="text" placeholder="Ej. Colegio Católico Cardenal Beras" value="${escapeHtml(draft.general.center || '')}" oninput="lessonPlanSetGeneralTextField('center',this.value)"></label>
      <label class="fg"><span class="lbl">Nombre del docente</span><input class="inp" type="text" placeholder="Ej. Alexauris Diaz Diaz" value="${escapeHtml(draft.general.teacher || '')}" oninput="lessonPlanSetGeneralTextField('teacher',this.value)"></label>
      <label class="fg ${gradeError ? 'lesson-plan-field-invalid' : ''}">
        <span class="lbl">Grado</span>
        <select class="sel lesson-plan-select-arrow ${gradeError ? 'is-invalid' : ''}" id="lesson-plan-grade-select" onchange="lessonPlanSetGradeSelection(this.value)">
          <option value="">Selecciona un grado</option>
          ${availableGrades.map((grade) => `<option value="${grade.id}" ${selectedGradeId===grade.id?'selected':''}>${escapeHtml(lessonPlanFullGradeName(null, grade) || grade.name || '')}</option>`).join('')}
          <option value="${LESSON_PLAN_TEMP_GRADE_VALUE}" ${selectedGradeId===LESSON_PLAN_TEMP_GRADE_VALUE?'selected':''}>+ Crear grado temporal</option>
        </select>
        ${usesTemporaryGrade ? `<input class="inp lesson-plan-inline-input ${gradeError ? 'is-invalid' : ''}" id="lesson-plan-grade-name" type="text" placeholder="Ej. 4to de secundaria" value="${escapeHtml(draft.general.gradeName || '')}" oninput="lessonPlanSetGeneralTextField('gradeName',this.value,'grade')" onblur="lessonPlanValidateGeneralField('grade')">` : ''}
        ${gradeError ? `<small class="lesson-plan-field-error">${escapeHtml(gradeError)}</small>` : ''}
      </label>
      <label class="fg ${lessonPlanGeneralError('area') ? 'lesson-plan-field-invalid' : ''}">
        <span class="lbl">Área</span>
        <div class="field-inline-actions">
          <select class="sel ${availableAreaOptions.length > 0 ? 'lesson-plan-select-arrow' : ''} ${lessonPlanGeneralError('area') ? 'is-invalid' : ''}" id="lesson-plan-area" onchange="lessonPlanSetAreaSelection(this.value)">
            <option value="">Selecciona un área</option>
            ${availableAreaOptions.map((area) => `<option value="${escapeHtml(area)}" ${String(draft.general.area || '')===area?'selected':''}>${escapeHtml(area)}</option>`).join('')}
          </select>
          <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanCreateCustomArea()">+ Área</button>
        </div>
        ${lessonPlanGeneralError('area') ? `<small class="lesson-plan-field-error">${escapeHtml(lessonPlanGeneralError('area'))}</small>` : ''}
      </label>
      <label class="fg ${sectionError ? 'lesson-plan-field-invalid' : ''}">
        <span class="lbl">Sección</span>
        ${!usesTemporaryGrade && availableSectionOptions.length ? `
          <select class="sel ${availableSectionOptions.length > 1 ? 'lesson-plan-select-arrow' : ''} ${sectionError ? 'is-invalid' : ''}" id="lesson-plan-section-select" onchange="lessonPlanSetSectionSelection(this.value)">
            <option value="">Selecciona una sección</option>
            ${availableSectionOptions.map((section) => `<option value="${section.value}" ${String(draft.general.sectionName || '')===section.value?'selected':''}>${escapeHtml(section.label || '')}</option>`).join('')}
          </select>
        ` : `
          <input class="inp ${sectionError ? 'is-invalid' : ''}" id="lesson-plan-section-name" type="text" placeholder="Selecciona una sección" value="${escapeHtml(draft.general.sectionName || '')}" oninput="lessonPlanSetGeneralTextField('sectionName',this.value,'section')" onblur="lessonPlanValidateGeneralField('section')">
        `}
        ${sectionError ? `<small class="lesson-plan-field-error">${escapeHtml(sectionError)}</small>` : ''}
      </label>
      <label class="fg ${subjectError ? 'lesson-plan-field-invalid' : ''}">
        <span class="lbl">Asignatura / Subárea</span>
        <div class="field-inline-actions">
          ${subjectFieldUsesManualFallback ? `
            <input class="inp ${subjectError ? 'is-invalid' : ''}" id="lesson-plan-subject" type="text" placeholder="Escribe una asignatura" value="${escapeHtml(curriculumCatalogDisplayText(draft.general.subject || draft.general.subarea || ''))}" oninput="lessonPlanSetSubjectInputValue(this.value)" onblur="lessonPlanSetSubjectSelection(this.value,false); lessonPlanSyncGeneralFieldUi('subject')">
          ` : `
            <select class="sel ${subjectSelectionNeedsChoice ? 'lesson-plan-select-arrow' : ''} ${subjectError ? 'is-invalid' : ''}" id="lesson-plan-subject-select" onchange="lessonPlanSetSubjectSelection(this.value)" ${hasSelectedArea ? '' : 'disabled'}>
              <option value="">${hasSelectedArea ? 'Selecciona una asignatura' : 'Selecciona un área primero'}</option>
              ${availableSubjectOptions.map((subject) => `<option value="${escapeHtml(subject.value)}" ${String(curriculumCatalogDisplayText(draft.general.subject || draft.general.subarea || ''))===subject.value?'selected':''}>${escapeHtml(subject.label || '')}</option>`).join('')}
            </select>
          `}
          <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanCreateCustomSubject()">+ Asignatura</button>
        </div>
        ${subjectError ? `<small class="lesson-plan-field-error">${escapeHtml(subjectError)}</small>` : ''}
        ${subjectSelectionNeedsChoice ? `<small class="lesson-plan-field-help">Este grado tiene más de una asignatura asociada. Selecciona la que corresponda para esta planificación.</small>` : ''}
      </label>
      <label class="fg"><span class="lbl">Período</span><select class="sel" onchange="lessonPlanSetGeneralSelect('periodId',this.value,true)">${academicCalendarPeriods().map((period) => `<option value="${period.id}" ${(draft.general.periodId||S.activePeriodId)===period.id?'selected':''}>${escapeHtml(period.name)}</option>`).join('')}</select></label>
      <label class="fg ${themeOrSequenceError ? 'lesson-plan-field-invalid' : ''}"><span class="lbl">Título del tema</span><input class="inp ${themeOrSequenceError ? 'is-invalid' : ''}" id="lesson-plan-title" type="text" placeholder="Ej. El péndulo" value="${escapeHtml(draft.general.themeTitle || draft.general.title || '')}" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" oninput="lessonPlanSetThemeTitle(this.value)" onblur="lessonPlanFinalizeThemeTitle(this.value)">${themeOrSequenceError ? `<small class="lesson-plan-field-error">${escapeHtml(themeOrSequenceError)}</small>` : ''}</label>
      <label class="fg ${themeOrSequenceError ? 'lesson-plan-field-invalid' : ''}"><span class="lbl">Secuencia didáctica (opcional)</span><input class="inp ${themeOrSequenceError ? 'is-invalid' : ''}" id="lesson-plan-sequence-name" type="text" placeholder="Ej. Secuencia 3: Movimiento y fuerza" value="${escapeHtml(draft.general.sequenceName || '')}" oninput="lessonPlanSetSequenceName(this.value)" onblur="lessonPlanFinalizeSequenceName(this.value)"><small class="lesson-plan-field-help">Escribe solo el nombre de la secuencia, si trabajas con una.</small></label>
      <label class="fg ${transversalAxisError ? 'lesson-plan-field-invalid' : ''}">
        <span class="lbl">Eje transversal</span>
        <select class="sel lesson-plan-select-arrow ${transversalAxisError ? 'is-invalid' : ''}" id="lesson-plan-axis-select" onchange="lessonPlanSetTransversalAxis(this.value)">
          <option value="">Selecciona un eje transversal</option>
          ${LESSON_PLAN_TRANSVERSAL_AXES.map((axis) => `<option value="${escapeHtml(axis.value)}" ${selectedTransversalAxis===axis.value?'selected':''}>${escapeHtml(axis.value)}</option>`).join('')}
        </select>
        ${transversalAxisError ? `<small class="lesson-plan-field-error">${escapeHtml(transversalAxisError)}</small>` : ''}
        ${transversalAxisDescription ? `<div class="lesson-plan-axis-note lesson-plan-axis-note-compact">${escapeHtml(transversalAxisDescription)}</div>` : ''}
      </label>
      <div class="fg lesson-plan-schedule-field">
        <span class="lbl">Vincular con horario docente</span>
        <button class="attendance-link-switch ${draft.general.scheduleLinked ? 'is-linked' : 'is-unlinked'}" type="button" aria-pressed="${draft.general.scheduleLinked ? 'true' : 'false'}" onclick="lessonPlanToggleScheduleLinked(${draft.general.scheduleLinked ? 'false' : 'true'})">
          <span class="attendance-link-switch-track"><span class="attendance-link-switch-thumb"></span></span>
          <span class="attendance-link-switch-copy"><strong>${draft.general.scheduleLinked ? 'Vinculado al horario' : 'No vinculado (fecha manual)'}</strong></span>
        </button>
        <small class="lesson-plan-field-help">${draft.general.scheduleLinked ? 'La planificación tomará automáticamente la próxima fecha disponible según tu horario docente.' : 'La planificación no estará ligada a una fecha automática. Podrás usarla en cualquier momento.'}</small>
        ${draft.general.scheduleLinked && nextScheduleDate ? `<small class="lesson-plan-field-help lesson-plan-field-help-accent">Próxima fecha sugerida: ${escapeHtml(lessonPlanClassDateLongLabel(nextScheduleDate) || nextScheduleDate)}</small>` : ''}
      </div>
      <label class="fg ${lessonPlanGeneralError('classDate') ? 'lesson-plan-field-invalid' : ''}"><span class="lbl">Fecha de la clase ${draft.general.scheduleLinked ? '<i class="ri-link" title="Sincronizada con horario"></i>' : ''}</span><input class="inp ${lessonPlanGeneralError('classDate') ? 'is-invalid' : ''}" id="lesson-plan-class-date" type="date" value="${escapeHtml(classDateValue || '')}" placeholder="dd/mm/aaaa" onchange="lessonPlanSetClassDate(this.value)" ${draft.general.scheduleLinked ? 'disabled' : ''}>${lessonPlanGeneralError('classDate') ? `<small class="lesson-plan-field-error">${escapeHtml(lessonPlanGeneralError('classDate'))}</small>` : ''}${classDateLongLabel ? `<small class="lesson-plan-field-help">${escapeHtml(classDateLongLabel)}</small>` : ''}</label>
    </div>`;
  const curriculumFundamentalError = lessonPlanCurriculumError('fundamentalCompetencies');
  const curriculumSpecificError = lessonPlanCurriculumError('specificCompetencies');
  const curriculumConceptualError = lessonPlanCurriculumError('conceptualContents');
  const curriculumIndicatorsError = lessonPlanCurriculumError('indicators');
  const selectedFundamentalCompetencies = lessonPlanSelectedFundamentalCompetencies(draft);
  const specificCompetencyMap = lessonPlanSpecificCompetencyMap(draft);
  const curriculumContent = `
    <div class="lesson-plan-curriculum-shell">
      <section class="lesson-plan-curriculum-section">
        <div class="lesson-plan-curriculum-section-head lesson-plan-curriculum-section-head-refined">
          <div class="lesson-plan-curriculum-icon lesson-plan-curriculum-icon-fundamental" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="7" r="2.2" fill="currentColor"></circle>
              <circle cx="18" cy="7" r="2.2" fill="currentColor"></circle>
              <circle cx="12" cy="17" r="2.2" fill="currentColor"></circle>
              <path d="M7.9 8.3 10.6 14.2M16.1 8.3 13.4 14.2M8.6 7h6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </div>
          <div class="lesson-plan-curriculum-heading-body">
            <span class="lesson-plan-curriculum-heading-kicker">Eje base</span>
            <h4>Competencias fundamentales</h4>
            <p>Selecciona las competencias base que acompañarán la clase.</p>
          </div>
        </div>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-fundamental ${curriculumFundamentalError ? 'lesson-plan-field-invalid' : ''}">
          <span class="lesson-plan-curriculum-block-title">Competencias fundamentales</span>
          ${renderLessonPlanSelectablePills('fundamentalCompetencies', LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS)}
          <textarea class="inp lesson-plan-textarea ${curriculumFundamentalError ? 'is-invalid' : ''}" id="lesson-plan-curriculum-fundamental" rows="3" aria-hidden="true" tabindex="-1" style="display:none;">${escapeHtml(draft.curriculum.fundamentalCompetencies || '')}</textarea>
          ${curriculumFundamentalError ? `<small class="lesson-plan-field-error">${escapeHtml(curriculumFundamentalError)}</small>` : ''}
        </label>
      </section>
      <section class="lesson-plan-curriculum-section">
        <div class="lesson-plan-curriculum-section-head lesson-plan-curriculum-section-head-refined">
          <div class="lesson-plan-curriculum-icon lesson-plan-curriculum-icon-specific" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 12h16M4 6h9M4 18h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              <circle cx="17.5" cy="6" r="1.3" fill="currentColor"></circle>
              <circle cx="11.5" cy="12" r="1.3" fill="currentColor"></circle>
              <circle cx="14.5" cy="18" r="1.3" fill="currentColor"></circle>
            </svg>
          </div>
          <div class="lesson-plan-curriculum-heading-body">
            <span class="lesson-plan-curriculum-heading-kicker">Selección guiada</span>
            <h4>Competencias específicas</h4>
            <p>Elige los indicadores específicos que se adaptan al grado y la asignatura.</p>
          </div>
        </div>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-specific ${curriculumSpecificError ? 'lesson-plan-field-invalid' : ''}">
          <span class="lesson-plan-curriculum-block-title">Competencias específicas</span>
          <textarea class="inp lesson-plan-textarea ${curriculumSpecificError ? 'is-invalid' : ''}" id="lesson-plan-curriculum-specific" rows="4" oninput="lessonPlanSetCurriculumTextField('specificCompetencies',this.value)">${escapeHtml(draft.curriculum.specificCompetencies || '')}</textarea>
          ${curriculumSpecificError ? `<small class="lesson-plan-field-error">${escapeHtml(curriculumSpecificError)}</small>` : ''}
        </label>
      </section>
      <section class="lesson-plan-curriculum-section">
        <div class="lesson-plan-curriculum-section-head lesson-plan-curriculum-section-head-refined">
          <div class="lesson-plan-curriculum-icon lesson-plan-curriculum-icon-conceptual" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 5h10l2 4-7 10L5 9l2-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
              <path d="M12 9v6M9.5 12h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
          </div>
          <div class="lesson-plan-curriculum-heading-body">
            <span class="lesson-plan-curriculum-heading-kicker">Contenido clave</span>
            <h4>Conceptos / contenidos conceptuales</h4>
            <p>Resume el tema central y deja visibles los subtemas que vas a trabajar.</p>
          </div>
        </div>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-conceptual ${curriculumConceptualError ? 'lesson-plan-field-invalid' : ''}">
          <span class="lesson-plan-curriculum-block-title">Conceptos</span>
          <textarea class="inp lesson-plan-textarea ${curriculumConceptualError ? 'is-invalid' : ''}" id="lesson-plan-curriculum-conceptual" rows="4" oninput="lessonPlanSetCurriculumTextField('conceptualContents',this.value)">${escapeHtml(draft.curriculum.conceptualContents || '')}</textarea>
          ${curriculumConceptualError ? `<small class="lesson-plan-field-error">${escapeHtml(curriculumConceptualError)}</small>` : ''}
        </label>
      </section>
      <section class="lesson-plan-curriculum-section">
        <div class="lesson-plan-curriculum-section-head lesson-plan-curriculum-section-head-refined">
          <div class="lesson-plan-curriculum-icon lesson-plan-curriculum-icon-procedural" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" stroke-width="1.7"></rect>
              <path d="M7 9h10M7 13h7M7 17h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
          </div>
          <div class="lesson-plan-curriculum-heading-body">
            <span class="lesson-plan-curriculum-heading-kicker">Aplicación</span>
            <h4>Procedimientos</h4>
            <p>Describe las acciones, secuencias y actividades de aprendizaje.</p>
          </div>
        </div>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-procedural">
          <span class="lesson-plan-curriculum-block-title">Procedimientos</span>
          <textarea class="inp lesson-plan-textarea" id="lesson-plan-curriculum-procedural" rows="4" oninput="lessonPlanSetCurriculumTextField('proceduralContents',this.value)">${escapeHtml(draft.curriculum.proceduralContents || '')}</textarea>
        </label>
      </section>
      <section class="lesson-plan-curriculum-section">
        <div class="lesson-plan-curriculum-section-head lesson-plan-curriculum-section-head-refined">
          <div class="lesson-plan-curriculum-icon lesson-plan-curriculum-icon-attitudinal" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 20s-7-4.3-7-10a4.2 4.2 0 0 1 7-3.2A4.2 4.2 0 0 1 19 10c0 5.7-7 10-7 10z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
              <path d="M8 10.5h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
          </div>
          <div class="lesson-plan-curriculum-heading-body">
            <span class="lesson-plan-curriculum-heading-kicker">Cierre formativo</span>
            <h4>Actitudes, valores e indicadores</h4>
            <p>Verifica que la planificación deje visible el desarrollo actitudinal y sus evidencias.</p>
          </div>
        </div>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-attitudinal">
          <span class="lesson-plan-curriculum-block-title">Actitudes y valores</span>
          <textarea class="inp lesson-plan-textarea" id="lesson-plan-curriculum-attitudinal" rows="3" oninput="lessonPlanSetCurriculumTextField('attitudinalContents',this.value)">${escapeHtml(draft.curriculum.attitudinalContents || '')}</textarea>
        </label>
        <label class="fg lesson-plan-curriculum-card lesson-plan-curriculum-card-procedural ${curriculumIndicatorsError ? 'lesson-plan-field-invalid' : ''}">
          <span class="lesson-plan-curriculum-block-title">Indicadores de logro</span>
          ${needsConceptualSelection ? '' : `<small class="lesson-plan-field-help">${escapeHtml(indicatorContextText)}</small>`}
          ${needsConceptualSelection ? `
            <div class="lesson-plan-empty-mini lesson-plan-empty-curriculum-state">Selecciona uno o varios contenidos conceptuales para generar indicadores de logro curriculares.</div>
          ` : indicatorItems.length ? `
            <div class="lesson-plan-procedural-list">
              ${indicatorItems.map((item) => {
                const itemKey = String(item.key || '').trim();
                const safeKey = itemKey.replace(/'/g, "\\'");
                const isExpanded = lessonPlanIndicatorItemIsExpanded(itemKey);
                const editorValue = String(item.text || '').trim();
                return `
                  <article class="lesson-plan-procedural-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}">
                    <div class="lesson-plan-procedural-card-head">
                      <h5>${escapeHtml(item.title || 'Indicador de logro')}</h5>
                    </div>
                    ${isExpanded ? `
                      <div class="lesson-plan-procedural-editor-wrap">
                        <textarea class="inp lesson-plan-procedural-editor-textarea" rows="5" aria-label="Indicador de logro ${escapeHtml(item.title || '')}" oninput="lessonPlanSetIndicatorItemText('${safeKey}', this.value)">${escapeHtml(editorValue)}</textarea>
                      </div>
                    ` : `
                      <div class="lesson-plan-procedural-editor-wrap">
                        <div class="lesson-plan-procedural-preview" title="${escapeHtml(editorValue)}">${escapeHtml(editorValue)}</div>
                      </div>
                    `}
                    <div class="lesson-plan-procedural-card-actions">
                      <button class="btn btn-ghost btn-sm lesson-plan-specific-toggle" type="button" onclick="lessonPlanToggleIndicatorExpanded('${safeKey}')">${isExpanded ? 'Ver menos' : 'Ver más'}</button>
                      <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanToggleDerivedItemEnabled('indicator','${safeKey}')">Quitar</button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="lesson-plan-empty-mini lesson-plan-empty-curriculum-state">No se encontraron indicadores vinculados de forma directa. Puedes agregar indicadores manualmente.</div>
            <textarea class="inp lesson-plan-textarea ${curriculumIndicatorsError ? 'is-invalid' : ''}" rows="3" placeholder="Agrega manualmente indicadores de logro para esta planificación" oninput="lessonPlanSetCurriculumTextField('indicators',this.value)">${escapeHtml(draft.curriculum.indicators || '')}</textarea>
          `}
          <textarea class="inp lesson-plan-textarea ${curriculumIndicatorsError ? 'is-invalid' : ''}" id="lesson-plan-curriculum-indicators" rows="3" aria-hidden="true" tabindex="-1" style="display:none;">${escapeHtml(draft.curriculum.indicators || '')}</textarea>
          ${curriculumIndicatorsError ? `<small class="lesson-plan-field-error">${escapeHtml(curriculumIndicatorsError)}</small>` : ''}
        </label>
      </section>
    </div>`;
  const strategyContent = `
    <div class="lesson-plan-form-grid">
      <label class="fg"><span class="lbl">Estrategia de enseñanza y aprendizaje</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetField('strategy.teachingLearning',this.value)">${escapeHtml(draft.strategy.teachingLearning || '')}</textarea></label>
      <label class="fg"><span class="lbl">Metodología</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetField('strategy.methodology',this.value)">${escapeHtml(draft.strategy.methodology || '')}</textarea></label>
      <label class="fg"><span class="lbl">Organización del trabajo</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetField('strategy.organization',this.value)">${escapeHtml(draft.strategy.organization || '')}</textarea></label>
      <label class="fg"><span class="lbl">Adecuaciones / inclusión</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetField('strategy.inclusionNotes',this.value)">${escapeHtml(draft.strategy.inclusionNotes || '')}</textarea></label>
    </div>`;
  const resourcesContent = `
    <div class="lesson-plan-resource-blocks">
      <div>
        <div class="lesson-plan-resource-title">Recursos didácticos</div>
        <div class="lesson-plan-pill-row">${renderLessonPlanResourcePills(draft.resources.preset || [])}</div>
      </div>
      <div>
        <div class="lesson-plan-resource-title">Recursos del medio / otros</div>
        <label class="fg"><span class="lbl">Otros recursos generales</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetField('resources.notes',this.value)">${escapeHtml(draft.resources.notes || '')}</textarea></label>
      </div>
    </div>`;
  const designContent = `
    <div class="lesson-plan-section-block">
      <div class="lesson-plan-section-head">
        <h3>Diseño general de la clase</h3>
        <p>Define la estrategia y luego completa cada clase de la secuencia.</p>
      </div>
      ${strategyContent}
    </div>
    <div class="lesson-plan-section-block">
      <div class="lesson-plan-section-head">
        <h3>Clases diarias</h3>
        <p>Organiza inicio, desarrollo, actividad, evaluación, recursos y cierre.</p>
      </div>
      <div class="lesson-plan-class-stack">${draft.classes.map((lessonClass) => renderLessonPlanClassCard(lessonClass, allCourseActivities, instruments)).join('')}</div>
    </div>`;
  const evaluationResourceCount = draft.classes.reduce((sum, lessonClass) => sum + ((lessonClass.activityLinks || []).length || 0), 0);
  const evaluationResourcesContent = `
    <div class="lesson-plan-section-block">
      <div class="lesson-plan-section-head">
        <h3>Técnicas e instrumentos de evaluación</h3>
        <p>Aquí ves lo que ya está vinculado desde las actividades de cada clase.</p>
      </div>
      ${(draft.classes.some((lessonClass) => (lessonClass.activityLinks || []).length))
        ? `<div class="lesson-plan-linked-list">${draft.classes.flatMap((lessonClass) => (lessonClass.activityLinks || []).map((link) => {
            const found = findActivity(link.activityId);
            const activity = found?.activity || {};
            const instrument = getInstrumentById(link.instrumentId || activity.instrumentId || '');
            return `
              <div class="lesson-plan-linked-item">
                <div>
                  <strong>${escapeHtml(`Clase ${lessonClass.index}${lessonClass.title ? ` - ${lessonClass.title}` : ''}`)}</strong>
                  <span>${escapeHtml(activity.name || 'Actividad')} - ${escapeHtml(link.technique || activity.technique || activity.tipo || 'Técnica por definir')} - ${escapeHtml(instrument?.name || 'Instrumento por definir')}</span>
                </div>
              </div>`;
          })).join('')}</div>`
        : '<div class="lesson-plan-empty-mini">Todavía no hay técnicas ni instrumentos vinculados. Puedes agregarlos dentro del diseño de cada clase.</div>'}
    </div>
    <div class="lesson-plan-section-block">
      <div class="lesson-plan-section-head">
        <h3>Recursos</h3>
        <p>Selecciona los recursos generales de la secuencia y agrega otros si hace falta.</p>
      </div>
      ${resourcesContent}
    </div>`;
  const sections = [
    { id: 'general', title: 'Datos generales', shortLabel: 'Datos generales', meta: classDateValue ? escapeHtml(fmtDate(classDateValue)) : 'Clase diaria', description: 'Centro, docente, materia, horario y fecha de la clase.', content: generalContent },
    { id: 'curriculum', title: 'Base curricular', shortLabel: 'Base curricular', meta: draft.curriculum.indicators ? 'Con avances' : 'Pendiente', description: 'Selecciona los elementos curriculares que se trabajarán en esta clase.', content: curriculumContent },
    { id: 'design', title: 'Diseño de clase', shortLabel: 'Diseño de clase', meta: `${summary.readyClasses}/${summary.totalClasses} listas`, description: 'Aquí organizas la estrategia general y el desarrollo de cada clase.', content: designContent },
    { id: 'evaluation', title: 'Técnicas e instrumentos de evaluación y recursos', shortLabel: 'Técnicas e instrumentos de evaluación y recursos', meta: evaluationResourceCount ? `${evaluationResourceCount} vínculo(s)` : 'Pendiente', description: 'Revisa la evaluación vinculada y completa los recursos que acompañan la planificación.', content: evaluationResourcesContent },
    { id: 'preview', title: 'Vista general', shortLabel: 'Vista general', meta: `${summary.linkedActivities} actividad(es)`, description: 'Aquí ves cómo se proyecta la planificación en formato profesional.', content: renderLessonPlanTemplatePreview(draft) },
  ];
  const activeSectionId = lessonPlanSectionOrder().includes(String(S.lessonPlanUi.activeSectionId || '').trim())
    ? String(S.lessonPlanUi.activeSectionId || '').trim()
    : 'general';
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
  if (!isEditorMode) {
    return `
      <div class="lesson-plans-page">
        <div class="card lesson-plans-hero">
          <div class="cp lesson-plans-hero-inner">
            <div>
              <div class="planner-eyebrow">Planificación docente</div>
              <div class="lesson-plans-title">Planificaciones</div>
            </div>
          </div>
        </div>
        <div class="lesson-plans-home-grid">
          <section class="card lesson-plan-home-card">
            <div class="ch"><span class="ch-title">NUEVA PLANIFICACIÓN</span></div>
            <div class="cp lesson-plan-home-cta">
              <p class="lesson-plan-home-copy">Crea una planificación nueva y continúa luego sin perder el avance.</p>
              <button class="btn btn-primary btn-lg" type="button" onclick="lessonPlanNew()">+ NUEVA PLANIFICACIÓN</button>
            </div>
          </section>
          <section class="card lesson-plan-home-card">
            <div class="ch"><span class="ch-title">Planificaciones en proceso</span></div>
            <div class="cp">
              ${draftCards}
            </div>
          </section>
          ${completedMarkup ? `
            <section class="card lesson-plan-home-card">
              <div class="ch"><span class="ch-title">Planificaciones completadas</span></div>
              <div class="cp">${completedMarkup}</div>
            </section>` : ''}
        </div>
      </div>`;
  }
  return `
    <div class="lesson-plans-page">
      <div class="lesson-plans-layout lesson-plans-layout-single">
        <section class="card lesson-plan-composer-card lesson-plan-composer-card-full" id="lesson-plan-composer">
          <div class="ch">
            <div class="lesson-plan-editor-head">
              <div class="lesson-plan-editor-head-copy">
                <span class="lesson-plan-editor-kicker">NUEVA PLANIFICACIÓN</span>
                <h2 class="lesson-plan-editor-title">${lessonPlanModalProgress(activeSectionId)}</h2>
                <p class="lesson-plan-editor-subtitle">Completa cada paso con datos claros y consistentes.</p>
              </div>
              <div class="lesson-plan-editor-actions">
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanReturnHome()">Volver al panel de planificación</button>
                ${lessonPlanModalNav(activeSectionId)}
              </div>
            </div>
          </div>
          <div class="cp lesson-plan-form">
            ${lessonPlanStepRail(activeSectionId)}
            <section class="lesson-plan-section lesson-plan-active-panel lesson-plan-editor-panel ${activeSection.id === 'general' ? 'lesson-plan-section-compact' : ''}">
              ${activeSection.id === 'general'
                ? activeSection.content
                : `<div class="lesson-plan-section-head">
                    <h3>${escapeHtml(activeSection.title)}</h3>
                    <p>${escapeHtml(activeSection.description)}</p>
                  </div>
                  ${activeSection.content}`}
            </section>
          </div>
        </section>
      </div>
    </div>`;
}

// Re-renderiza solo el editor actual cuando cambian datos internos sin salir del módulo.
function lessonPlanRenderCurrentEditor() {
  if (currentPage !== 'planificaciones') return false;
  if (lessonPlanUiMode() !== 'editor') return false;
  if (!STATIC_DOM.view || !RENDERS.planificaciones) return false;
  if (STATIC_DOM.topActions) STATIC_DOM.topActions.innerHTML = '';
  RENDERS.planificaciones(STATIC_DOM.view);
  injectPanelContextControls(STATIC_DOM.view);
  STATIC_DOM.view.classList.remove('is-panel-transition');
  return true;
}

// Refresca el modal de sección abierto para que refleje el estado más reciente del editor paso a paso.
function lessonPlanRefreshOpenSectionModal() {
  if (lessonPlanRenderCurrentEditor()) return;
  if (lessonPlanUiMode() === 'editor') go('planificaciones');
}

RENDERS.planificaciones = function(c) {
  if (!(S.secciones || []).length) {
    c.innerHTML = `<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">No hay materias creadas</div><div class="es">Crea primero un grado o una materia para empezar a planificar.</div><button class="btn btn-primary" onclick="go('estudiantes')">Ir a estudiantes</button></div></div>`;
    return;
  }
  const html = renderLessonPlansPage();
  c.innerHTML = typeof fixQuestionMarkCorruption === 'function'
    ? fixQuestionMarkCorruption(html)
    : html;
};

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

// Resume el avance del borrador para alimentar indicadores rápidos del editor y la vista previa.
function lessonPlanDraftCompletionSummary(draft) {
  const totalClasses = draft.classes.length || 0;
  const plannedDates = draft.classes.filter((lessonClass) => lessonClass.date).length;
  const linkedActivities = draft.classes.reduce((sum, lessonClass) => sum + ((lessonClass.activityLinks || []).length || 0), 0);
  const readyClasses = draft.classes.filter((lessonClass) => lessonClass.start.description && lessonClass.development.description && lessonClass.closure.summary).length;
  return { totalClasses, plannedDates, linkedActivities, readyClasses };
}
// Pinta tarjetas de avance para saltar entre los hitos principales del proceso de planificación.
function renderLessonPlanSummaryCards(draft) {
  const summary = lessonPlanDraftCompletionSummary(draft);
  return `
    <div class="lesson-plan-summary-grid">
      <button class="lesson-plan-summary-card" type="button" onclick="lessonPlanSetActiveSection('general')">
        <span>Paso 1</span>
        <strong>Datos base</strong>
        <small>${escapeHtml(draft.general.subject || 'Selecciona la materia')}</small>
      </button>
      <button class="lesson-plan-summary-card" type="button" onclick="lessonPlanSetActiveSection('curriculum')">
        <span>Paso 2</span>
        <strong>Base curricular</strong>
        <small>${draft.curriculum.indicators ? 'Con indicadores' : 'Pendiente'}</small>
      </button>
      <button class="lesson-plan-summary-card" type="button" onclick="lessonPlanSetActiveSection('classes')">
        <span>Paso 3</span>
        <strong>Clases diarias</strong>
        <small>${summary.readyClasses}/${summary.totalClasses} completas</small>
      </button>
      <button class="lesson-plan-summary-card" type="button" onclick="lessonPlanSetActiveSection('preview')">
        <span>Vista</span>
        <strong>Plantilla formal</strong>
        <small>${summary.linkedActivities} actividades vinculadas</small>
      </button>
    </div>`;
}
// Genera los accesos visuales a cada sección del editor guiado de planificaciones.
function renderLessonPlanSectionButtons(sections = []) {
  const sectionIcons = {
    general: '/assets/icons/curso.png',
    curriculum: '/assets/icons/matriz.png',
    design: '/assets/icons/actividad.png',
    evaluation: '/assets/icons/instrumentos.png',
    preview: '/assets/icons/reportes.png',
  };
  return `<div class="lesson-plan-nav-grid">${sections.map((section) => `
    <button class="card cp lesson-plan-nav-btn" data-section="${section.id}" type="button" onclick="lessonPlanSetActiveSection('${section.id}')">
      <div class="lesson-plan-nav-btn-media lesson-plan-nav-btn-media-${section.id}">
        <img src="${sectionIcons[section.id] || '/assets/icons/curso.png'}" alt="" width="34" height="34" decoding="async">
      </div>
      <span>${escapeHtml(section.shortLabel || section.title)}</span>
    </button>
  `).join('')}</div>`;
}
// Gestiona clase plan sección order.
function lessonPlanSectionOrder() {
  return ['general', 'curriculum', 'design', 'evaluation', 'preview'];
}
// Gestiona clase plan sección index.
function lessonPlanSectionIndex(sectionId) {
  return lessonPlanSectionOrder().indexOf(String(sectionId || '').trim());
}
// Devuelve el indicador textual de progreso para el modal paso a paso del editor.
function lessonPlanModalProgress(sectionId) {
  const order = lessonPlanSectionOrder();
  const index = lessonPlanSectionIndex(sectionId);
  if (index < 0) return '';
  const labels = {
    general: 'Datos generales',
    curriculum: 'Base curricular',
    design: 'Dise\u00f1o de clase',
    evaluation: 'Evaluaci\u00f3n, t\u00e9cnica, recursos',
    preview: 'Vista general',
  };
  return `<div class="lesson-plan-modal-progress">Paso ${index + 1} de ${order.length} - ${escapeHtml(labels[sectionId] || sectionId)}</div>`;
}
// Construye la barra visual que muestra en qué paso está el usuario dentro del flujo de planificación.
function lessonPlanStepRail(sectionId) {
  const order = lessonPlanSectionOrder();
  const labels = {
    general: 'Datos generales',
    curriculum: 'Base curricular',
    design: 'Dise\u00f1o de clase',
    evaluation: 'Evaluaci\u00f3n y recursos',
    preview: 'Vista general',
  };
  return `
    <div class="lesson-plan-step-rail" aria-label="Progreso de planificaci\u00f3n">
      ${order.map((id, index) => `
        <div class="lesson-plan-step-pill ${id === sectionId ? 'is-active' : ''} ${index < lessonPlanSectionIndex(sectionId) ? 'is-complete' : ''}">
          <span class="lesson-plan-step-pill-index">${index + 1}</span>
          <span>${escapeHtml(labels[id] || id)}</span>
        </div>
      `).join('')}
    </div>`;
}
// Avanza al siguiente paso del editor solo cuando la sección actual cumple sus validaciones mínimas.
function lessonPlanAdvanceSection(sectionId) {
  const order = lessonPlanSectionOrder();
  const index = lessonPlanSectionIndex(sectionId);
  if (index < 0) return;
  if (sectionId === 'general' && !lessonPlanValidateGeneralSection()) return;
  if (sectionId === 'curriculum' && !lessonPlanValidateCurriculumSection()) return;
  const nextId = index < order.length - 1 ? order[index + 1] : '';
  if (nextId) lessonPlanSetActiveSection(nextId);
  else saveLessonPlan();
}
// Renderiza la navegación inferior del modal para retroceder, avanzar o finalizar la planificación.
function lessonPlanModalNav(sectionId) {
  const order = lessonPlanSectionOrder();
  const index = lessonPlanSectionIndex(sectionId);
  if (index < 0) return '';
  const prevId = index > 0 ? order[index - 1] : '';
  const nextId = index < order.length - 1 ? order[index + 1] : '';
  return `
    <div class="lesson-plan-modal-nav">
      <button class="btn btn-outline" type="button" ${prevId ? `onclick="lessonPlanSetActiveSection('${prevId}')"` : 'disabled'}>Atr\u00e1s</button>
      <button class="btn btn-primary" type="button" onclick="lessonPlanAdvanceSection('${sectionId}')">${nextId ? 'Siguiente' : 'Finalizar'}</button>
    </div>`;
}
// Muestra las actividades ya vinculadas a una clase y ofrece el punto de salida para desvincularlas.
function renderLessonPlanLinkedActivities(lessonClass) {
  if (!(lessonClass.activityLinks || []).length) {
    return '<div class="lesson-plan-empty-mini">Todav?a no hay actividades vinculadas en esta clase.</div>';
  }
  return `<div class="lesson-plan-linked-list">${lessonClass.activityLinks.map((link) => {
    const found = findActivity(link.activityId);
    const activity = found?.activity || {};
    const instrument = getInstrumentById(link.instrumentId || activity.instrumentId || '');
    return `
      <div class="lesson-plan-linked-item">
        <div>
          <strong>${escapeHtml(activity.name || 'Actividad')}</strong>
          <span>${escapeHtml(lessonPlanBlockLabel(link.blockId))}${link.evidence ? ` ? ${escapeHtml(link.evidence)}` : ''}${instrument ? ` ? ${escapeHtml(instrument.name)}` : ''}</span>
        </div>
        <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanRemoveActivityLink('${lessonClass.id}','${link.activityId}')">Quitar</button>
      </div>`;
  }).join('')}</div>`;
}
// Renderiza la ficha completa de una clase, incluyendo tiempos, etapas, recursos y actividades enlazadas.
function renderLessonPlanClassCard(lessonClass, allCourseActivities, instruments) {
  const expanded = (S.lessonPlanUi.expandedClassIds || []).includes(lessonClass.id);
  const classDraft = lessonPlanActivityDraft(lessonClass.id);
  return `
    <article class="lesson-plan-class-card">
      <div class="lesson-plan-class-head">
        <div>
          <div class="lesson-plan-class-index">Clase ${lessonClass.index}</div>
          <strong>${escapeHtml(lessonClass.title || 'Sin subtítulo')}</strong>
          <small>${escapeHtml(fmtDate(lessonClass.date) || 'Fecha por definir')} ? ${escapeHtml(lessonClass.durationMinutes || 'Duraci?n por definir')}</small>
        </div>
        <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanToggleClassExpansion('${lessonClass.id}')">${expanded ? 'Contraer' : 'Expandir'}</button>
      </div>
      ${expanded ? `
        <div class="lesson-plan-class-body">
          <div class="lesson-plan-step-grid">
            <section class="lesson-plan-step-card">
              <div class="lesson-plan-step-tag">Datos</div>
              <div class="lesson-plan-form-grid">
                <label class="fg"><span class="lbl">Fecha</span><input class="inp" type="date" value="${escapeHtml(lessonClass.date || '')}" onchange="lessonPlanSetClassField('${lessonClass.id}','date',this.value)"></label>
                <label class="fg"><span class="lbl">Tema o subtítulo</span><input class="inp" type="text" value="${escapeHtml(lessonClass.title || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','title',this.value)"></label>
              </div>
            </section>
            <section class="lesson-plan-step-card">
              <div class="lesson-plan-step-tag">Tiempo</div>
              <div class="lesson-plan-form-grid">
                <label class="fg"><span class="lbl">Duraci?n</span><select class="sel" onchange="lessonPlanSetClassDurationHours('${lessonClass.id}',this.value)">${LESSON_PLAN_CLASS_DURATION_OPTIONS.map((option) => `<option value="${option.value}" ${(lessonClass.durationHours||'1')===option.value?'selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
                <div class="lesson-plan-time-chip">${escapeHtml(lessonClass.durationMinutes || lessonPlanDurationLabel(lessonClass.durationHours || '1'))}</div>
              </div>
            </section>
          </div>
          <section class="lesson-plan-inline-section">
            <div class="lesson-plan-inline-head"><h4>Curricular</h4></div>
            <label class="fg"><span class="lbl">Intenci?n pedag?gica</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetClassField('${lessonClass.id}','pedagogicalIntent',this.value)">${escapeHtml(lessonClass.pedagogicalIntent || '')}</textarea></label>
          </section>
          <div class="lesson-plan-stage-grid">
            <section class="lesson-plan-stage-card">
              <h4>Inicio</h4>
              <label class="fg"><span class="lbl">Descripci?n del inicio</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetClassField('${lessonClass.id}','start.description',this.value)">${escapeHtml(lessonClass.start.description || '')}</textarea></label>
              <label class="fg"><span class="lbl">Preguntas generadoras</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','start.questions',this.value)">${escapeHtml(lessonClass.start.questions || '')}</textarea></label>
              <label class="fg"><span class="lbl">Activaci?n de conocimientos previos</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','start.priorKnowledge',this.value)">${escapeHtml(lessonClass.start.priorKnowledge || '')}</textarea></label>
              <label class="fg"><span class="lbl">Intenci?n del inicio</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','start.intention',this.value)">${escapeHtml(lessonClass.start.intention || '')}</textarea></label>
              <label class="fg"><span class="lbl">Tiempo estimado</span><input class="inp" type="text" value="${escapeHtml(lessonClass.start.time || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','start.time',this.value)"></label>
            </section>
            <section class="lesson-plan-stage-card">
              <h4>Desarrollo</h4>
              <label class="fg"><span class="lbl">Descripci?n del desarrollo</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetClassField('${lessonClass.id}','development.description',this.value)">${escapeHtml(lessonClass.development.description || '')}</textarea></label>
              <label class="fg"><span class="lbl">Acci?n del docente</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','development.teacherAction',this.value)">${escapeHtml(lessonClass.development.teacherAction || '')}</textarea></label>
              <label class="fg"><span class="lbl">Acci?n de los estudiantes</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','development.studentAction',this.value)">${escapeHtml(lessonClass.development.studentAction || '')}</textarea></label>
              <label class="fg"><span class="lbl">Explicaci?n del contenido</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','development.contentExplanation',this.value)">${escapeHtml(lessonClass.development.contentExplanation || '')}</textarea></label>
              <label class="fg"><span class="lbl">Actividad o actividades</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','development.activities',this.value)">${escapeHtml(lessonClass.development.activities || '')}</textarea></label>
              <label class="fg"><span class="lbl">Socializaci?n o revisi?n</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','development.socialization',this.value)">${escapeHtml(lessonClass.development.socialization || '')}</textarea></label>
              <label class="fg"><span class="lbl">Tiempo estimado</span><input class="inp" type="text" value="${escapeHtml(lessonClass.development.time || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','development.time',this.value)"></label>
            </section>
            <section class="lesson-plan-stage-card">
              <h4>Cierre</h4>
              <label class="fg"><span class="lbl">S?ntesis final</span><textarea class="inp lesson-plan-textarea" rows="3" oninput="lessonPlanSetClassField('${lessonClass.id}','closure.summary',this.value)">${escapeHtml(lessonClass.closure.summary || '')}</textarea></label>
              <label class="fg"><span class="lbl">Metacognici?n</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','closure.metacognition',this.value)">${escapeHtml(lessonClass.closure.metacognition || '')}</textarea></label>
              <label class="fg"><span class="lbl">Conclusiones</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','closure.conclusions',this.value)">${escapeHtml(lessonClass.closure.conclusions || '')}</textarea></label>
              <label class="fg"><span class="lbl">Tarea o asignaci?n</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','closure.task',this.value)">${escapeHtml(lessonClass.closure.task || '')}</textarea></label>
              <label class="fg"><span class="lbl">Tiempo estimado</span><input class="inp" type="text" value="${escapeHtml(lessonClass.closure.time || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','closure.time',this.value)"></label>
            </section>
          </div>
          <section class="lesson-plan-inline-section">
            <div class="lesson-plan-inline-head"><h4>Recursos de la clase</h4></div>
            <div class="lesson-plan-pill-row">${renderLessonPlanClassResourcePills(lessonClass.id, lessonClass.resourcesPreset || [])}</div>
            <label class="fg"><span class="lbl">Otros recursos</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','resourcesText',this.value)">${escapeHtml(lessonClass.resourcesText || '')}</textarea></label>
          </section>
          <section class="lesson-plan-inline-section">
            <div class="lesson-plan-inline-head"><h4>Actividades vinculadas</h4></div>
            ${renderLessonPlanLinkedActivities(lessonClass)}
            <div class="lesson-plan-activity-builder">
              <div class="lesson-plan-form-grid">
                <label class="fg"><span class="lbl">Actividad existente</span><select class="sel" onchange="lessonPlanLinkExistingActivity('${lessonClass.id}',this.value,this.options[this.selectedIndex]?.dataset.block||'B1')"><option value="">Seleccionar actividad ya creada</option>${allCourseActivities.map(({ block, activity }) => `<option value="${activity.id}" data-block="${block}">${escapeHtml(activity.name)} ? ${escapeHtml(lessonPlanBlockLabel(block))}</option>`).join('')}</select></label>
                <label class="fg"><span class="lbl">Nombre de nueva actividad</span><input class="inp" type="text" value="${escapeHtml(classDraft.name || '')}" oninput="lessonPlanSetActivityDraftField('${lessonClass.id}','name',this.value)"></label>
                <label class="fg"><span class="lbl">Tipo</span><select class="sel" onchange="lessonPlanSetActivityDraftField('${lessonClass.id}','type',this.value)">${LESSON_PLAN_ACTIVITY_TYPES.map((option) => `<option value="${option.value}" ${classDraft.type===option.value?'selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
                <label class="fg"><span class="lbl">Bloque de competencia</span><select class="sel" onchange="lessonPlanSetActivityDraftField('${lessonClass.id}','blockId',this.value)">${BLOCKS.map((blockId) => `<option value="${blockId}" ${classDraft.blockId===blockId?'selected':''}>${escapeHtml(lessonPlanBlockLabel(blockId))}</option>`).join('')}</select></label>
                <label class="fg"><span class="lbl">Puntaje m?ximo</span><input class="inp" type="number" min="1" step="1" value="${escapeHtml(String(classDraft.points || 20))}" oninput="lessonPlanSetActivityDraftField('${lessonClass.id}','points',this.value)"></label>
                <label class="fg"><span class="lbl">T?cnica de evaluaci?n</span><select class="sel" onchange="lessonPlanSetActivityDraftField('${lessonClass.id}','technique',this.value)"><option value="">Seleccionar t?cnica</option>${LESSON_PLAN_TECHNIQUE_OPTIONS.map((option) => `<option value="${escapeHtml(option)}" ${classDraft.technique===option?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></label>
              </div>
              <div class="lesson-plan-form-grid">
                <label class="fg"><span class="lbl">Descripci?n</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetActivityDraftField('${lessonClass.id}','description',this.value)">${escapeHtml(classDraft.description || '')}</textarea></label>
                <label class="fg"><span class="lbl">Evidencia esperada</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetActivityDraftField('${lessonClass.id}','evidence',this.value)">${escapeHtml(classDraft.evidence || '')}</textarea></label>
              </div>
              <div class="lesson-plan-form-grid">
                <label class="fg"><span class="lbl">Instrumento existente</span><select class="sel" onchange="lessonPlanSetActivityDraftField('${lessonClass.id}','instrumentId',this.value)"><option value="">Sin instrumento por ahora</option>${instruments.map((instrument) => `<option value="${instrument.id}" ${classDraft.instrumentId===instrument.id?'selected':''}>${escapeHtml(instrument.name)} ? ${escapeHtml(instrument.typeLabel || instrument.type || '')}</option>`).join('')}</select></label>
                <label class="fg"><span class="lbl">Tipo para crear nuevo instrumento</span><select class="sel" onchange="lessonPlanSetActivityDraftField('${lessonClass.id}','instrumentType',this.value)">${LESSON_PLAN_INSTRUMENT_TYPE_OPTIONS.map((option) => `<option value="${option.value}" ${(classDraft.instrumentType||'rubrica_analitica')===option.value?'selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
              </div>
              <div class="lesson-plan-action-row">
                <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanCreateInstrumentForClass('${lessonClass.id}')">Crear instrumento nuevo</button>
                <button class="btn btn-primary btn-sm" type="button" onclick="lessonPlanCreateLinkedActivity('${lessonClass.id}')">Crear y vincular actividad</button>
              </div>
            </div>
          </section>
          <section class="lesson-plan-inline-section">
            <div class="lesson-plan-inline-head"><h4>Ajuste curricular</h4></div>
            <div class="lesson-plan-form-grid lesson-plan-form-grid-3">
              <label class="fg"><span class="lbl">Estudiante</span><input class="inp" type="text" value="${escapeHtml(lessonClass.adaptation?.studentName || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','adaptation.studentName',this.value)"></label>
              <label class="fg"><span class="lbl">Tipo de necesidad</span><input class="inp" type="text" value="${escapeHtml(lessonClass.adaptation?.needType || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','adaptation.needType',this.value)"></label>
              <label class="fg"><span class="lbl">Observaci?n</span><input class="inp" type="text" value="${escapeHtml(lessonClass.adaptation?.observation || '')}" oninput="lessonPlanSetClassField('${lessonClass.id}','adaptation.observation',this.value)"></label>
            </div>
            <div class="lesson-plan-form-grid">
              <label class="fg"><span class="lbl">Adaptaci?n de la actividad</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','adaptation.activityAdaptation',this.value)">${escapeHtml(lessonClass.adaptation?.activityAdaptation || '')}</textarea></label>
              <label class="fg"><span class="lbl">Adaptaci?n de la evaluaci?n</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','adaptation.evaluationAdaptation',this.value)">${escapeHtml(lessonClass.adaptation?.evaluationAdaptation || '')}</textarea></label>
            </div>
          </section>
          <label class="fg"><span class="lbl">Observaciones de la clase</span><textarea class="inp lesson-plan-textarea" rows="2" oninput="lessonPlanSetClassField('${lessonClass.id}','notes',this.value)">${escapeHtml(lessonClass.notes || '')}</textarea></label>
        </div>` : ''}
    </article>`;
}
// Convierte texto libre en líneas legibles para la plantilla formal y las vistas de exportación.
function lessonPlanRenderLineItems(text, fallback = 'Sin completar') {
  const items = String(text || '')
    .split(/\n|,|;/)
    .map((item) => normalizeSpanishDraftText(item, { preserveCase: true }).trim())
    .filter(Boolean);
  if (!items.length) return `<div class="lesson-plan-sheet-empty">${escapeHtml(fallback)}</div>`;
  return `<div class="lesson-plan-sheet-lines">${items.map((item) => `<div>- ${escapeHtml(item)}</div>`).join('')}</div>`;
}
// Construye la vista previa formal de la planificación con formato de plantilla institucional.
function renderLessonPlanTemplatePreview(draft) {
  const classDate = lessonPlanClassDateValue(draft);
  const mainTitle = String(draft.general.themeTitle || draft.general.title || '').trim();
  const classesMarkup = draft.classes.map((lessonClass) => `
    <div class="lesson-plan-sheet-block">
      <div class="lesson-plan-sheet-title">SECUENCIA DID?CTICA ? CLASE ${lessonClass.index}</div>
      <div class="lesson-plan-sheet-row lesson-plan-sheet-row-accent">
        <div class="lesson-plan-sheet-label lesson-plan-sheet-label-wide">Estrategia de ense?anza y aprendizaje</div>
        <div class="lesson-plan-sheet-cell">${escapeHtml(draft.strategy.teachingLearning || 'Sin completar')}</div>
      </div>
      <div class="lesson-plan-sheet-grid lesson-plan-sheet-grid-4">
        <div class="lesson-plan-sheet-head">Fecha</div>
        <div class="lesson-plan-sheet-head">Actividades de ense?anza y aprendizaje</div>
        <div class="lesson-plan-sheet-head">Instrumentos y t?cnicas de evaluaci?n</div>
        <div class="lesson-plan-sheet-head">Recursos</div>
        <div class="lesson-plan-sheet-cell lesson-plan-sheet-time">
          <strong>${escapeHtml(fmtDate(lessonClass.date) || 'Sin fecha')}</strong>
          <span>Tiempo:</span>
          <div>${escapeHtml(lessonClass.durationMinutes || '40 minutos')}</div>
        </div>
        <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">
          <div class="lesson-plan-sheet-subtitle">Inicio</div>
          ${lessonPlanRenderLineItems([lessonClass.start.description, lessonClass.start.questions, lessonClass.start.priorKnowledge].filter(Boolean).join('\n'), 'Sin completar')}
          <div class="lesson-plan-sheet-subtitle">Desarrollo</div>
          ${lessonPlanRenderLineItems([lessonClass.development.description, lessonClass.development.teacherAction, lessonClass.development.studentAction, lessonClass.development.activities, lessonClass.development.socialization].filter(Boolean).join('\n'), 'Sin completar')}
          <div class="lesson-plan-sheet-subtitle">Cierre</div>
          ${lessonPlanRenderLineItems([lessonClass.closure.summary, lessonClass.closure.metacognition, lessonClass.closure.conclusions, lessonClass.closure.task].filter(Boolean).join('\n'), 'Sin completar')}
        </div>
        <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">
          ${lessonClass.activityLinks?.length ? lessonClass.activityLinks.map((link) => {
            const found = findActivity(link.activityId);
            const activity = found?.activity || {};
            const instrument = getInstrumentById(link.instrumentId || activity.instrumentId || '');
            const lines = [
              activity.name || '',
              `Bloque: ${lessonPlanBlockLabel(link.blockId)}`,
              `T?cnica: ${link.technique || activity.technique || activity.tipo || 'Sin definir'}`,
              `Instrumento: ${instrument?.name || 'Sin definir'}`,
              link.evidence ? `Evidencia: ${link.evidence}` : '',
            ].filter(Boolean);
            return `<div class="lesson-plan-sheet-eval">${lessonPlanRenderLineItems(lines.join('\n'))}</div>`;
          }).join('') : `<div class="lesson-plan-sheet-empty">Sin actividades vinculadas</div>`}
        </div>
        <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">
          ${lessonPlanRenderLineItems([...(lessonClass.resourcesPreset || []), lessonClass.resourcesText || ''].join('\n'), 'Sin completar')}
        </div>
      </div>
    </div>`).join('');
  return `
    <section class="lesson-plan-template-preview">
      <div class="lesson-plan-template-head">
        <div>
          <div class="lesson-plan-template-kicker">Vista de plantilla</div>
          <h3>Formato formal de planificaci?n</h3>
        </div>
        <button class="btn btn-outline btn-sm" type="button" onclick="lessonPlanExportDraftPdf()"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Vista PDF</button>
      </div>
      <div class="lesson-plan-sheet">
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Centro educativo</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.center || 'Sin completar')}</div>
        </div>
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Nombre del docente</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.teacher || 'Sin completar')}</div>
        </div>
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Asignatura</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.area || 'Sin completar')}${draft.general.subarea ? ` (${escapeHtml(draft.general.subarea)})` : ''}</div>
        </div>
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Grado</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.gradeName || 'Sin completar')}</div>
        </div>
        <div class="lesson-plan-sheet-grid lesson-plan-sheet-grid-2">
          <div class="lesson-plan-sheet-row">
            <div class="lesson-plan-sheet-label">T?tulo del tema</div>
            <div class="lesson-plan-sheet-cell">${escapeHtml(mainTitle || 'Sin completar')}</div>
          </div>
          <div class="lesson-plan-sheet-row">
            <div class="lesson-plan-sheet-label">Fecha de la clase</div>
            <div class="lesson-plan-sheet-cell">${escapeHtml(fmtDate(classDate) || 'Sin completar')}</div>
          </div>
        </div>
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Secuencia did?ctica</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.sequenceName || 'No aplica')}</div>
        </div>
        <div class="lesson-plan-sheet-row">
          <div class="lesson-plan-sheet-label">Eje tem?tico transversal</div>
          <div class="lesson-plan-sheet-cell">${escapeHtml(draft.general.transversalAxis || 'Sin completar')}</div>
        </div>
        <div class="lesson-plan-sheet-title">SECUENCIA CURRICULAR</div>
        <div class="lesson-plan-sheet-grid lesson-plan-sheet-grid-5">
          <div class="lesson-plan-sheet-head">Competencias fundamentales y espec?ficas</div>
          <div class="lesson-plan-sheet-head">Conceptos</div>
          <div class="lesson-plan-sheet-head">Procedimientos</div>
          <div class="lesson-plan-sheet-head">Actitudes y valores</div>
          <div class="lesson-plan-sheet-head">Indicadores de logro</div>
          <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">${lessonPlanRenderLineItems([draft.curriculum.fundamentalCompetencies, draft.curriculum.specificCompetencies].filter(Boolean).join('\n'), 'Sin completar')}</div>
          <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">${lessonPlanRenderLineItems(draft.curriculum.conceptualContents, 'Sin completar')}</div>
          <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">${lessonPlanRenderLineItems(draft.curriculum.proceduralContents, 'Sin completar')}</div>
          <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">${lessonPlanRenderLineItems(draft.curriculum.attitudinalContents, 'Sin completar')}</div>
          <div class="lesson-plan-sheet-cell lesson-plan-sheet-cell-tall">${lessonPlanRenderLineItems(draft.curriculum.indicators, 'Sin completar')}</div>
        </div>
        ${classesMarkup}
      </div>
    </section>`;
}

