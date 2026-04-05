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
