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
