// Comprueba si basic instrumento type.
function isBasicInstrumentType(type) {
  return BASIC_INSTRUMENT_TYPES.includes(type);
}
// Cambia el filtro principal de la biblioteca y reinicia los filtros secundarios para evitar combinaciones inconsistentes.
function setInstrumentFilter(vv='all') {
  INSTRUMENT_FILTER = vv || 'all';
  INSTRUMENT_LIBRARY_FILTERS.type = '';
  INSTRUMENT_LIBRARY_FILTERS.gradeId = '';
  INSTRUMENT_LIBRARY_FILTERS.subject = '';
  INSTRUMENT_LIBRARY_FILTERS.periodId = '';
  go('instrumentos');
}
// Aplica un filtro puntual de la biblioteca y vuelve a renderizar el panel con ese criterio.
function setInstrumentLibraryFilter(key, value='') {
  INSTRUMENT_LIBRARY_FILTERS[key] = value || '';
  go('instrumentos');
}
// Cierra cualquier menú flotante de descarga para que solo exista uno abierto a la vez dentro de la biblioteca.
function closeInstrumentDownloadMenus() {
  if (INSTRUMENT_DOWNLOAD_MENU.root) {
    INSTRUMENT_DOWNLOAD_MENU.root.remove();
    INSTRUMENT_DOWNLOAD_MENU.root = null;
  }
  INSTRUMENT_DOWNLOAD_MENU.openId = null;
}
// Abre o cierra el menú flotante de descarga del instrumento seleccionado.
function toggleInstrumentDownloadMenu(id, ev) {
  if (ev) ev.stopPropagation();
  const btn = ev?.currentTarget || null;
  if (!btn) return;
  const isOpen = INSTRUMENT_DOWNLOAD_MENU.openId === id && !!INSTRUMENT_DOWNLOAD_MENU.root;
  closeInstrumentDownloadMenus();
  if (isOpen) return;
  const rect = btn.getBoundingClientRect();
  const root = document.createElement('div');
  root.id = 'inst-dl-floating-menu';
  root.style.position = 'fixed';
  root.style.zIndex = '9999';
  root.style.minWidth = '210px';
  root.style.padding = '8px';
  root.style.border = '1px solid var(--line)';
  root.style.borderRadius = '10px';
  root.style.background = 'var(--card)';
  root.style.boxShadow = 'var(--shadow)';
  root.style.display = 'grid';
  root.style.gap = '6px';
  root.style.visibility = 'hidden';
  root.innerHTML = `
    <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentFromLibrary('${id}','pdf');closeInstrumentDownloadMenus();"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Descargar en PDF</button>
    <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentFromLibrary('${id}','word');closeInstrumentDownloadMenus();"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Descargar en Word (.doc)</button>
  `;
  root.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(root);
  const menuHeight = root.offsetHeight || 96;
  root.style.left = `${Math.max(8, rect.right - 210)}px`;
  root.style.top = `${Math.max(8, rect.top - menuHeight - 8)}px`;
  root.style.visibility = 'visible';
  INSTRUMENT_DOWNLOAD_MENU.root = root;
  INSTRUMENT_DOWNLOAD_MENU.openId = id;
}
// Obtiene instrumento usage count.
function getInstrumentUsageCount(instrumentId) {
  if (!instrumentId) return 0;
  let count = 0;
  allActivities().forEach(({activity}) => {
    ensureActivityInstrumentFields(activity);
    if (activity.instrumentId===instrumentId || (activity.instrumentIds||[]).includes(instrumentId)) count++;
  });
  return count;
}
// Abre el selector de tipo de instrumento y conserva, si existe, el contexto de actividad desde donde se inició.
function openCreateInstrumentTypePicker(activityId=null, preselectType=null) {
  window._newInstrumentLinkActivityId = activityId || null;
  const grid = document.getElementById('inst-type-grid');
  if (!grid) return;
  grid.innerHTML = BASIC_INSTRUMENT_TYPES.map(t=>{
    const meta = BASIC_INSTRUMENT_META[t];
    return `<button class="card cp instrument-type-card" style="text-align:left;cursor:pointer;border:1px solid var(--line);" onclick="createInstrumentFromType('${t}')">
      <div style="font-size:20px;">${meta.icon}</div>
      <div style="font-weight:800;margin-top:6px;">${meta.title}</div>
      <div style="font-size:12px;color:var(--mute);margin-top:4px;">${meta.desc}</div>
    </button>`;
  }).join('');
  openM('m-inst-type');
  if (preselectType && isBasicInstrumentType(preselectType)) {
    createInstrumentFromType(preselectType);
  }
}
// Crea el borrador inicial del editor de instrumentos a partir de un tipo básico permitido.
function createInstrumentFromType(type) {
  if (!isBasicInstrumentType(type)) {
    toast('En esta versión solo se permiten instrumentos básicos', true);
    return;
  }
  closeM('m-inst-type');
  openInstrumentEditor(null, {
    activityId: window._newInstrumentLinkActivityId,
    draft: makeInstrumentDraft(type, {maxScore:20})
  });
}
// Renderiza los filtros cruzados de la biblioteca según grado, tipo, asignatura y período disponibles en la sesión.
function renderInstrumentLibraryFilters() {
  const groups = getGroups();
  const f = INSTRUMENT_LIBRARY_FILTERS || {};
  const gradeById = new Map();
  const subjects = new Set();
  groups.forEach(g=>{
    if (g.gradeId && !gradeById.has(g.gradeId)) gradeById.set(g.gradeId, g.gradeName);
    if (g.materia) subjects.add(g.materia);
  });
  const gradeOptions = Array.from(gradeById.entries())
    .sort((a,b)=>parseGradeLevel(a[1])-parseGradeLevel(b[1]) || String(a[1]).localeCompare(String(b[1]), 'es'))
    .map(([id, name])=>`<option value="${id}" ${f.gradeId===id?'selected':''}>${name}</option>`).join('');
  const typeOptions = BASIC_INSTRUMENT_TYPES
    .map(t=>`<option value="${t}" ${f.type===t?'selected':''}>${instrumentTypeLabel(t)}</option>`).join('');
  const subjectOptions = Array.from(subjects)
    .sort((a,b)=>String(a).localeCompare(String(b),'es'))
    .map(s=>`<option value="${s}" ${f.subject===s?'selected':''}>${s}</option>`).join('');
  const periodOptions = (S.periods||[])
    .map(p=>`<option value="${p.id}" ${f.periodId===p.id?'selected':''}>${p.id} ? ${p.name}</option>`).join('');
  return `<div class="fr" style="margin:10px 0 14px;">
    <div class="fg"><label class="lbl">Grado</label><select class="sel" onchange="setInstrumentLibraryFilter('gradeId', this.value)"><option value="">Todos</option>${gradeOptions}</select></div>
    <div class="fg"><label class="lbl">Tipo de instrumento</label><select class="sel" onchange="setInstrumentLibraryFilter('type', this.value)"><option value="">Todos</option>${typeOptions}</select></div>
    <div class="fg"><label class="lbl">Asignatura</label><select class="sel" onchange="setInstrumentLibraryFilter('subject', this.value)"><option value="">Todas</option>${subjectOptions}</select></div>
    <div class="fg"><label class="lbl">Período</label><select class="sel" onchange="setInstrumentLibraryFilter('periodId', this.value)"><option value="">Todos</option>${periodOptions}</select></div>
  </div>`;
}

// Renderiza la tabla principal de biblioteca con filtros, usos y acciones disponibles por instrumento.
function renderInstrumentTable() {
  const groups = getGroups();
  const byGroupId = new Map(groups.map(g=>[g.id, g]));
  const f = INSTRUMENT_LIBRARY_FILTERS || {};
  const filtered = S.instruments.filter(i=>{
    const g = byGroupId.get(i.courseId) || null;
    if (f.type && i.type!==f.type) return false;
    if (f.gradeId && (g?.gradeId||'')!==f.gradeId) return false;
    if (f.subject && normTxt(g?.materia||i.subjectName||'')!==normTxt(f.subject)) return false;
    if (f.periodId && (i.periodId||'P1')!==f.periodId) return false;
    return true;
  });
  if (filtered.length===0) {
    return `<div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Sin instrumentos guardados</div><div class="es">Crea instrumentos y luego vincúlalos con actividades del mismo grado.</div></div>`;
  }
  return `<div style="overflow-x:auto;"><table class="tbl"><thead><tr>
    <th>Nombre</th><th>Tipo</th><th>Grado</th><th>Asignatura</th><th>Puntaje máximo</th><th>Usos</th><th>Acciones</th>
  </tr></thead><tbody>
    ${filtered.map(i=>{
      const g = byGroupId.get(i.courseId) || null;
      const gradeLabel = g ? `${g.gradeName} ${g.sectionName}` : '?';
      const subject = g?.materia || i.subjectName || '?';
      const usageCount = getInstrumentUsageCount(i.id);
      return `<tr>
      <td style="font-weight:700;">${i.name}${i.periodId?`<div style="font-size:11px;color:var(--mute);font-weight:600;margin-top:2px;">${i.periodId}</div>`:''}</td>
      <td>${instrumentTypeLabel(i.type)} ${isBasicInstrumentType(i.type)?'':'<span class="pill p-amber" style="margin-left:4px;">Legacy</span>'}</td>
      <td>${gradeLabel}</td>
      <td>${subject}</td>
      <td style="text-align:center;">${calcInstrumentMax(i)}</td>
      <td style="text-align:center;">${usageCount}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="openInstrumentEditor('${i.id}')"><img src="/assets/icons/edit.png" alt="" width="14" height="14" decoding="async"> Editar</button>
          <button class="btn btn-outline btn-sm" onclick="duplicateInstrument('${i.id}')">Duplicar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteInstrument('${i.id}')"><span class="icon-delete" aria-hidden="true"></span> Eliminar</button>
          <button class="btn btn-outline btn-sm" onclick="toggleInstrumentDownloadMenu('${i.id}', event)">Descargar</button>
          <button class="btn btn-primary btn-sm" onclick="openUseInstrumentFlow('${i.id}')">Vincular</button>
        </div>
      </td>
    </tr>`;
    }).join('')}
  </tbody></table></div>`;
}

// Inicia el flujo inverso de vinculación: partir del instrumento y elegir una actividad compatible.
function openUseInstrumentFlow(instrumentId) {
  const inst = getInstrumentById(instrumentId);
  if (!inst) return;
  window._linkMode = 'fromInstrument';
  window._linkInstId = inst.id;
  window._linkActId = null;
  const title = document.getElementById('li-title');
  if (title) title.textContent = 'Vincular instrumento a actividad';
  const label = document.getElementById('li-select-label');
  if (label) label.textContent = 'Seleccionar actividad';
  const helper = document.getElementById('li-act');
  if (helper) helper.textContent = `Instrumento: ${inst.name} · ${getGroupLabel(inst.courseId)} · ${inst.periodId||'P1'}`;
  const createBtn = document.getElementById('li-create-btn');
  if (createBtn) createBtn.style.display = 'none';
  const confirmBtn = document.getElementById('li-confirm-btn');
  if (confirmBtn) confirmBtn.textContent = 'Vincular instrumento';
  const sel = document.getElementById('li-inst');
  if (!sel) return;
  const activities = allActivities().filter(({activity}) => {
    if (!inst.courseId) return false;
    const sameGrade = (activity.courseId||'') === inst.courseId;
    if (!sameGrade) return false;
    const actPeriod = activity.periodId || S.activePeriodId || 'P1';
    return actPeriod === (inst.periodId || actPeriod);
  });
  sel.innerHTML = activities.length
    ? activities.map(({block, activity})=>`<option value="${activity.id}">${BICON[block]} ${activity.name} · ${BNAME[block]} (${fmtNum(activity.pts)} pts)</option>`).join('')
    : '<option value="">No hay actividades compatibles para este grado</option>';
  if (!activities.length) { toast('No hay actividades del mismo grado para vincular', true); return; }
  openM('m-link-inst');
}

// Abre el modal para vincular un instrumento a una actividad concreta del período y curso actuales.
function openLinkInstrumentModal(actId, presetInstrumentId=null) {
  const f = findActivity(actId);
  if (!f) return;
  window._linkMode = 'fromActivity';
  window._linkInstId = null;
  window._linkActId = actId;
  const title = document.getElementById('li-title');
  if (title) title.textContent = 'Vincular instrumento a actividad';
  const label = document.getElementById('li-select-label');
  if (label) label.textContent = 'Seleccionar instrumento';
  const helper = document.getElementById('li-act');
  if (helper) helper.textContent = `Actividad: ${BICON[f.block]} ${f.activity.name} · ${BNAME[f.block]} (${fmtNum(f.activity.pts)} pts)`;
  const createBtn = document.getElementById('li-create-btn');
  if (createBtn) createBtn.style.display = '';
  const confirmBtn = document.getElementById('li-confirm-btn');
  if (confirmBtn) confirmBtn.textContent = 'Vincular instrumento';
  const sel = document.getElementById('li-inst');
  if (!sel) return;
  const periodInstruments = S.instruments.filter(i=>(i.periodId||'P1')===(f.activity.periodId||S.activePeriodId) && i.courseId===f.activity.courseId);
  sel.innerHTML = periodInstruments.length
    ? periodInstruments.map(i=>`<option value="${i.id}">${i.name} · ${instrumentTypeLabel(i.type)} (${calcInstrumentMax(i)} pts)</option>`).join('')
    : '<option value="">Sin instrumentos</option>';
  if (presetInstrumentId) sel.value = presetInstrumentId;
  else if (f.activity.instrumentId) sel.value = f.activity.instrumentId;
  openM('m-link-inst');
}

// Confirma la vinculación instrumento-actividad según el modo desde el que se abrió el modal.
function confirmLinkInstrument() {
  const mode = window._linkMode || 'fromActivity';
  if (mode === 'fromInstrument') {
    const instId = window._linkInstId;
    const actId = document.getElementById('li-inst')?.value;
    if (!actId || !instId) { toast('Selecciona una actividad', true); return; }
    const f = findActivity(actId);
    const inst = getInstrumentById(instId);
    if (!f || !inst) return;
    if ((f.activity.courseId||'') !== (inst.courseId||'')) {
      toast('Solo puedes vincular con actividades del mismo grado', true);
      return;
    }
    instrumentService.link(actId, instId);
    closeM('m-link-inst');
    toast('Instrumento vinculado');
    go(currentPage);
    return;
  }
  const actId = window._linkActId;
  const instId = document.getElementById('li-inst')?.value;
  if (!actId || !instId) { toast('Selecciona un instrumento', true); return; }
  instrumentService.link(actId, instId);
  closeM('m-link-inst');
  toast('Instrumento vinculado');
  go(currentPage);
}

// Crea una actividad mínima desde el flujo de instrumentos para vincularla inmediatamente después.
function createQuickActivityForInstrument() {
  const name = v('is-new-name');
  const desc = v('is-new-desc');
  const producto = v('is-new-prod');
  const block = document.getElementById('is-new-block')?.value || 'B1';
  const pts = parseInt(v('is-new-max'))||20;
  if (!name) { toast('Nombre de actividad requerido', true); return; }
  if (!S.activeGroupId) { toast('Selecciona/crea un grupo primero', true); return; }
  getGroupCfg(S.activeGroupId)[block].activities.push({
    id:uid(), name, courseId:S.activeGroupId, periodId:S.activePeriodId, pts, tipo:'', fecha:'', desc, producto,
    instrumentId:null, instrumentIds:[], instrumentHistory:[]
  });
  persist();
  toast('Actividad rápida creada');
  go('instrumentos');
}

// Genera un borrador sugerido desde una actividad o datos mínimos para acelerar la creación del instrumento.
function generateSuggestedInstrument() {
  const actId = document.getElementById('is-act')?.value;
  let meta;
  if (actId) {
    const f = findActivity(actId);
    if (!f) { toast('Actividad no encontrada', true); return; }
    meta = {
      activityId: actId,
      name: f.activity.name,
      descripcion: f.activity.desc || f.activity.obs || '',
      producto: f.activity.producto || '',
      tipo: f.activity.tipo || '',
      maxScore: f.activity.pts
    };
  } else {
    meta = {
      activityId: null,
      name: v('is-new-name'),
      descripcion: v('is-new-desc'),
      producto: v('is-new-prod'),
      tipo: '',
      maxScore: parseInt(v('is-new-max'))||20
    };
    if (!meta.name && !meta.descripcion && !meta.producto) {
      toast('Selecciona una actividad o completa datos para sugerir', true);
      return;
    }
  }
  const draft = instrumentService.suggest(meta);
  openInstrumentEditor(null, {activityId: meta.activityId, draft});
}

// Abre el editor del instrumento partiendo del registro existente o de un borrador nuevo ya normalizado.
function openInstrumentEditor(instrumentId=null, opts={}) {
  // Abre el editor de instrumentos en modo nuevo o edición, normalizando el borrador antes de renderizarlo.
  const src = instrumentId ? getInstrumentById(instrumentId) : null;
  INST_EDITOR.mode = src ? 'edit' : 'new';
  INST_EDITOR.linkActivityId = opts.activityId || null;
  INST_EDITOR.draft = src
    ? JSON.parse(JSON.stringify(src))
    : JSON.parse(JSON.stringify(opts.draft || makeInstrumentDraft('rubrica_analitica', {maxScore:20})));
  INST_EDITOR.openPanelId = null;
  INST_EDITOR.openAppearance = false;
  INST_EDITOR._criteriaGapKey = null;
  INST_EDITOR.invalidChecklistCriteria = new Set();
  INST_EDITOR.scaleMaxInputRaw = null;
  if (!INST_EDITOR.draft.periodId) INST_EDITOR.draft.periodId = S.activePeriodId;
  if (!INST_EDITOR.draft.courseId) {
    const shouldPrefillCourse = !(INST_EDITOR.mode==='new' && INST_EDITOR.draft.type==='lista_cotejo_a');
    INST_EDITOR.draft.courseId = shouldPrefillCourse ? (S.activeGroupId || null) : null;
  }
  if (INST_EDITOR.mode === 'new' && !isBasicInstrumentType(INST_EDITOR.draft.type)) {
    INST_EDITOR.draft.type = 'rubrica_analitica';
  }
  const titleEl = document.querySelector('#m-inst-editor .mt');
  if (titleEl) {
    if (INST_EDITOR.mode === 'edit') {
      titleEl.textContent = 'Editar instrumento';
    } else {
      titleEl.textContent = INST_EDITOR.draft.type==='rubrica_analitica'
        ? 'Nueva rúbrica'
        : (INST_EDITOR.draft.type==='lista_cotejo_a' ? 'Nueva lista de cotejo' : (INST_EDITOR.draft.type==='lista_cotejo_b' ? 'Nueva lista ponderada' : (INST_EDITOR.draft.type==='escala_estimativa' ? 'Nueva escala estimativa' : 'Nuevo instrumento')));
    }
  }
  renderInstrumentEditor();
  closeM('m-link-inst');
  openM('m-inst-editor');
}

// Renderiza el editor completo con validaciones, acordeones y vista previa según el tipo de instrumento.
function renderInstrumentEditor() {
  // Renderiza el editor completo del instrumento según su tipo, criterios, niveles y apariencia configurada.
  const d = INST_EDITOR.draft;
  if (!d) return;
  if (d.type==='lista_cotejo_a') normalizeChecklistDraft(d);
  if (d.type==='lista_cotejo_b') normalizeWeightedChecklistDraft(d);
  if (d.type==='escala_estimativa') normalizeEstimativeDraft(d);
  if (d.type==='rubrica_analitica') normalizeRubricaInstrument(d);
  if (d.type==='rubrica_analitica') ieRecalcWeightsFromPoints(false);
  const maxCalc = calcInstrumentMax(d);
  const weights = d.criteria.reduce((s,c)=>s + (parseFloat(c.weightPct ?? c.weight)||0), 0);
  const isRubrica = d.type==='rubrica_analitica';
  const isChecklist = d.type==='lista_cotejo_a';
  const body = document.getElementById('inst-editor-body');
  if (!body) return;
  const ctxGroupId = d.courseId || S.activeGroupId;
  const ctxPeriodId = d.periodId || S.activePeriodId;
  const contextLine = renderInstrumentContextLines(ctxGroupId, ctxPeriodId);
  const uiState = captureInstrumentEditorUIState(body);
  const descriptorMatrix = isRubrica ? `
    <div class="card cp" style="margin-top:10px;">
      <div style="font-weight:800;margin-bottom:8px;">Matriz de descriptores</div>
      <div class="rubric-matrix-scroll">
        <table class="tbl rubric-matrix-table">
          <thead><tr><th style="min-width:180px;">Criterio</th>${(d.levels||[]).map(l=>`<th style="min-width:170px;">${l.label}</th>`).join('')}</tr></thead>
          <tbody>
            ${d.criteria.map(c=>`<tr>
              <td style="font-weight:700;">${c.label||c.name}</td>
              ${(d.levels||[]).map(l=>`<td><textarea class="ta ta-rubric-desc" data-focus-id="desc-${c.id}-${l.id}" rows="4" placeholder="Describe el desempeño para este nivel en este criterio" oninput="ieSetDescriptor('${c.id}','${l.id}',this.value);ieAutoGrowDescriptor(this)">${(c.descriptors||{})[l.id]||''}</textarea></td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : '';
  const weightBadge = round2(weights)===100
    ? `<span class="pill p-green">Peso total: ${fmtNum(weights)}% (OK)</span>`
    : `<span class="pill p-rose">Peso total: ${fmtNum(weights)}% (ERROR)</span>`;
  const pointsTarget = parseFloat(d.maxTotal ?? d.maxScore) || 0;
  const pointsOk = round2(maxCalc)===round2(pointsTarget);
  const pointsBadge = pointsOk
    ? `<span class="pill p-green">Puntos calculados: ${fmtNum(maxCalc)} · Objetivo: ${fmtNum(pointsTarget)} (OK)</span>`
    : `<span class="pill p-rose">Puntos calculados: ${fmtNum(maxCalc)} · Objetivo: ${fmtNum(pointsTarget)} (ERROR)</span>`;
  const levelsOpen = INST_EDITOR.openPanelId === 'levels';
  const criteriaOpen = INST_EDITOR.openPanelId === 'criteria';
  const advancedOpen = INST_EDITOR.openPanelId === 'advanced';
  const levelsValidation = ieValidateLevels(d, false);
  const invalidLevelIds = new Set(levelsValidation.invalidIds || []);
  const appearanceOpen = !!INST_EDITOR.openAppearance;
  const appearanceTemplate = d.appearanceTemplate || 'academic';
  const appearanceTheme = ieResolveAppearanceTheme(d);
  const previewModeClass = appearanceTemplate==='print' ? 'mode-print' : (appearanceTemplate==='custom' ? 'mode-custom' : 'mode-academic');
  const metaText = ieContrastText(appearanceTheme.metaColumnBg);
  const previewToneStyle = `style="--rp-header-bg:${appearanceTheme.headerBg};--rp-header-text:${appearanceTheme.headerText||ieContrastText(appearanceTheme.headerBg)};--rp-border:${appearanceTheme.tableBorder};--rp-row-alt:${appearanceTheme.rowAltBg};--rp-row-base:${appearanceTheme.rowBaseBg};--rp-meta-bg:${appearanceTheme.metaColumnBg};--rp-meta-bg-soft:${appearanceTheme.rowAltBg};--rp-meta-text:${metaText};"`;
  const previewPrintClass = d.forceBWOnPrint ? 'rubrica-print-bw' : (d.useColorsOnPrint===false ? 'rubrica-print-nocolor' : '');
  // Gestiona custom level inputs.
  const customLevelInputs = (d.levels||[]).map((l, idx)=>`
    <div class="fg">
      <label class="lbl">${l.label || `Nivel ${idx+1}`}</label>
      <input class="inp" data-focus-id="rubrica-color-level-${l.id}" type="color" value="${ieGetLevelColorById(appearanceTheme, l.id, idx)}" onchange="ieSetAppearanceLevelColor('${l.id}', this.value)">
    </div>
  `).join('');
  const advancedPreview = `
    <div id="inst-preview-export" class="rubrica-preview ${previewModeClass} ${previewPrintClass}" ${previewToneStyle}>
      <div class="rp-head">Rúbrica analítica · Evaluación detallada por criterios</div>
      <div style="overflow-x:auto;">
      <table class="tbl"><thead><tr><th>Criterio</th>${(d.levels||[]).map((l,idx)=>`<th style="${ieLevelHeaderStyle(appearanceTheme, l.id, idx)}">${l.label}</th>`).join('')}<th class="th-meta">Puntos del criterio</th><th class="th-meta">Peso (%)</th></tr></thead><tbody>
        ${d.criteria.map(c=>`<tr>
          <td>${c.label||c.name}</td>
          ${(d.levels||[]).map(l=>`<td style="font-size:11px;color:var(--mute);">${(c.descriptors||{})[l.id]||'?'}</td>`).join('')}
          <td class="td-meta" style="text-align:center;">${fmtNum(c.maxPoints)}</td>
          <td class="td-meta" style="text-align:center;">${fmtNum(c.weightPct ?? c.weight ?? 0)}</td>
        </tr>`).join('')}
      </tbody></table>
      </div>
      <div style="margin-top:10px;padding:10px 12px;background:${appearanceTheme.rowBaseBg};">
        <label style="font-weight:700;display:block;margin-bottom:4px;">Observaciones del docente</label>
        <div style="border-bottom:1px solid ${appearanceTheme.tableBorder};height:22px;"></div>
        <div style="border-bottom:1px solid ${appearanceTheme.tableBorder};height:22px;"></div>
        <div style="border-bottom:1px solid ${appearanceTheme.tableBorder};height:22px;"></div>
        <div style="border-bottom:1px solid ${appearanceTheme.tableBorder};height:22px;"></div>
      </div>
    </div>`;
  if (isRubrica) {
    const groups = getGroups();
    const periods = S.periods || DEFAULT_PERIODS;
    const schoolYears = buildSchoolYearOptions();
    const activityName = stripInstrumentNamePrefix('rubrica_analitica', d.name||'');
    const fullName = composeInstrumentName('rubrica_analitica', activityName);
    body.innerHTML = `
      <div class="card cp">
        <div style="font-weight:800;margin-bottom:8px;">Información general</div>
        <div class="fr">
          <div class="fg"><label class="lbl">Curso o grado al que va dirigido este instrumento</label>
            <select class="sel" data-focus-id="rubrica-course" onchange="ieSetCourseId(this.value)">
              <option value="" ${d.courseId?'':'selected'}>Ej.: 3ro A · Ciencias físicas</option>
              ${groups.map(g=>`<option value="${g.id}" ${d.courseId===g.id?'selected':''}>${g.gradeName} ${g.sectionName} · ${g.materia||'General'}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Tipo</label><input class="inp" readonly value="Rúbrica"></div>
        </div>
        <div class="fr" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Nombre de la actividad</label><input class="inp" data-focus-id="rubrica-name" value="${activityName}" placeholder="Ej.: Informe de laboratorio" oninput="ieSetInstrumentActivityName(this.value)"></div>
          <div class="fg"><label class="lbl">Nombre completo del instrumento</label><div id="instrument-full-name-preview" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--off);font-weight:700;">${fullName}</div></div>
        </div>
        <div class="fr3" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Puntaje máximo total (objetivo)</label><input class="inp" data-focus-id="rubrica-max-total" type="number" min="1" max="999" value="${d.maxTotal ?? d.maxScore}" oninput="ieSetMax(this.value)"></div>
          <div class="fg"><label class="lbl">Año escolar</label>
            <select class="sel" data-focus-id="rubrica-year" onchange="ieSetSchoolYear(this.value)">
              ${schoolYears.map(y=>`<option value="${y}" ${(d.schoolYear||S.schoolYear?.name||'2025-2026')===y?'selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Período</label>
            <select class="sel" data-focus-id="rubrica-period" onchange="ieSetPeriodId(this.value)">
              ${periods.map(p=>`<option value="${p.id}" ${(d.periodId||S.activePeriodId)===p.id?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      ${descriptorMatrix}
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAccordion('levels')">
          <span style="font-weight:800;">Configurar niveles</span><span>${levelsOpen?'▾':'▸'}</span>
        </button>
        <div style="display:${levelsOpen?'block':'none'};margin-top:8px;" onclick="ieStopAccordionEvent(event)" onmousedown="ieStopAccordionEvent(event)" onkeydown="ieStopAccordionEvent(event)" oninput="ieStopAccordionEvent(event)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="font-size:12px;color:var(--mute);">${(d.levels||[]).length} niveles</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mute2);">
              <input data-focus-id="rubrica-auto-adjust-levels" type="checkbox" ${d.autoAdjustLevels!==false?'checked':''} onchange="ieToggleAutoAdjustLevels(this.checked)">
              Autoajustar niveles
            </label>
            <button class="btn btn-outline btn-sm" onclick="ieAutoAdjustLevels()">Autoajustar niveles</button>
            <button class="btn btn-outline btn-sm" onclick="ieAddLevel()">+ Nivel</button>
          </div>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl"><thead><tr><th>#</th><th>Nombre nivel</th><th>valueFactor</th><th></th></tr></thead><tbody>
            ${(d.levels||[]).map((l,idx)=>`<tr>
              <td>${idx+1}</td>
              <td><input class="inp" data-focus-id="lvl-${l.id}-label" value="${l.label||''}" oninput="ieSetLevel('${l.id}','label',this.value)"></td>
              <td><input class="inp" style="${invalidLevelIds.has(l.id)?'border-color:var(--rose);box-shadow:0 0 0 2px rgba(244,63,94,.15);':''}" data-focus-id="lvl-${l.id}-factor" type="number" step="0.01" min="0" max="1" value="${ieFormatLevelFactorForInput(l.valueFactor ?? l.factor)}" oninput="ieSetLevel('${l.id}','valueFactor',this.value)"></td>
              <td><button class="btn btn-danger btn-sm" ${(d.levels||[]).length<=2?'disabled':''} onclick="ieDelLevel('${l.id}')"><i class="ri-delete-bin-line"></i></button></td>
            </tr>`).join('')}
          </tbody></table>
        </div>
        ${levelsValidation.ok ? '' : `<div style="margin-top:8px;font-size:12px;color:var(--rose);font-weight:700;">${levelsValidation.message}</div>`}
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAccordion('criteria')">
          <span style="font-weight:800;">Configurar criterios</span><span>${criteriaOpen?'▾':'▸'}</span>
        </button>
        <div style="display:${criteriaOpen?'block':'none'};margin-top:8px;" onclick="ieStopAccordionEvent(event)" onmousedown="ieStopAccordionEvent(event)" onkeydown="ieStopAccordionEvent(event)" oninput="ieStopAccordionEvent(event)">
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="ieAutoAdjustCriteriaPoints()">Autoajustar puntajes</button>
          <button class="btn btn-outline btn-sm" onclick="ieAddCriterion()">+ Agregar criterio</button>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl">
            <thead><tr><th>#</th><th>Criterio</th><th>Puntos del criterio</th><th>Peso (%)</th><th>Orden</th><th></th></tr></thead>
            <tbody>
              ${d.criteria.map((c,idx)=>`<tr>
                <td>${idx+1}</td>
                <td><input class="inp" data-focus-id="crt-${c.id}-label" value="${c.label||c.name}" oninput="ieSetCriterion('${c.id}','label',this.value)"></td>
                <td><input class="inp" data-focus-id="crt-${c.id}-max" type="number" min="0" max="999" value="${c.maxPoints}" oninput="ieSetCriterion('${c.id}','maxPoints',this.value,this)"></td>
                <td><input class="inp" data-focus-id="crt-${c.id}-weight" type="number" min="0" max="100" value="${c.weightPct ?? c.weight ?? 0}" readonly title="Calculado automáticamente según puntos"></td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',-1)">↑</button>
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',1)">↓</button>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="ieDelCriterion('${c.id}')"><i class="ri-delete-bin-line"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAccordion('advanced')">
          <span style="font-weight:800;">Vista final del instrumento</span><span>${advancedOpen?'▾':'▸'}</span>
        </button>
        <div style="display:${advancedOpen?'block':'none'};margin-top:10px;" onclick="ieStopAccordionEvent(event)" onmousedown="ieStopAccordionEvent(event)" onkeydown="ieStopAccordionEvent(event)" oninput="ieStopAccordionEvent(event)">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${weightBadge}
          ${pointsBadge}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <div style="font-size:12px;color:var(--mute);">Vista previa imprimible</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentPdf()"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Descargar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentWord()"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Descargar Word</button>
            <button class="btn btn-outline btn-sm" onclick="ieToggleAppearancePanel()">Apariencia</button>
          </div>
        </div>
        <div style="display:${appearanceOpen?'block':'none'};margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--off);">
          <div class="fr" style="margin-bottom:8px;">
            <div class="fg">
              <label class="lbl">Plantilla visual</label>
              <select class="sel" data-focus-id="rubrica-appearance-template" onchange="ieSetAppearanceTemplate(this.value)">
                ${Object.keys(RUBRIC_APPEARANCE_TEMPLATES).map(k=>`<option value="${k}" ${appearanceTemplate===k?'selected':''}>${RUBRIC_APPEARANCE_TEMPLATES[k].label}</option>`).join('')}
              </select>
            </div>
            <div class="fg" style="display:${appearanceTemplate==='custom'?'block':'none'};">
              <label class="lbl">Color encabezado</label>
              <input class="inp" data-focus-id="rubrica-color-header-bg" type="color" value="${appearanceTheme.headerBg}" onchange="ieSetAppearanceColor('headerBg', this.value)">
            </div>
          </div>
          <div class="fr3" style="display:${appearanceTemplate==='custom'?'grid':'none'};margin-bottom:8px;">
            ${customLevelInputs}
          </div>
          <div class="fr3" style="display:${appearanceTemplate==='custom'?'grid':'none'};margin-bottom:8px;">
            <div class="fg"><label class="lbl">Filas alternadas</label><input class="inp" data-focus-id="rubrica-color-row-alt" type="color" value="${appearanceTheme.rowAltBg}" onchange="ieSetAppearanceColor('rowAltBg', this.value)"></div>
            <div class="fg"><label class="lbl">Filas base</label><input class="inp" data-focus-id="rubrica-color-row-base" type="color" value="${appearanceTheme.rowBaseBg}" onchange="ieSetAppearanceColor('rowBaseBg', this.value)"></div>
            <div class="fg"><label class="lbl">Bordes tabla</label><input class="inp" data-focus-id="rubrica-color-border" type="color" value="${appearanceTheme.tableBorder}" onchange="ieSetAppearanceColor('tableBorder', this.value)"></div>
          </div>
          <div class="fr" style="display:${appearanceTemplate==='custom'?'grid':'none'};margin-bottom:8px;">
            <div class="fg"><label class="lbl">Columna meta</label><input class="inp" data-focus-id="rubrica-color-meta" type="color" value="${appearanceTheme.metaColumnBg}" onchange="ieSetAppearanceColor('metaColumnBg', this.value)"></div>
            <div class="fg"><label class="lbl">Texto encabezado (auto)</label><input class="inp" data-focus-id="rubrica-color-header-text" type="text" readonly value="${ieContrastText(appearanceTheme.headerBg)}"></div>
          </div>
        </div>
        ${advancedPreview}
        </div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" onclick="closeM('m-inst-editor')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveInstrumentEditor()">Guardar instrumento</button>
        ${INST_EDITOR.linkActivityId?`<button class="btn btn-amber" onclick="saveInstrumentEditor(true)">Guardar y vincular a actividad</button>`:''}
      </div>
    `;
    restoreInstrumentEditorUIState(body, uiState);
    ieAutoGrowAllRubricDescriptors(body);
    return;
  }
  if (isChecklist) {
    const groups = getGroups();
    const periods = S.periods || DEFAULT_PERIODS;
    const schoolYears = buildSchoolYearOptions();
    const total = parseFloat(d.maxTotal ?? d.maxScore) || 0;
    const count = Array.isArray(d.criteria) ? d.criteria.length : 0;
    const per = count ? (total / count) : 0;
    const tri = d.checklistMode === 'trichotomic';
    const invalidCriteria = INST_EDITOR.invalidChecklistCriteria || new Set();
    const activityName = String(d.activityName || '');
    const fullName = composeInstrumentName('lista_cotejo_a', activityName);
    const modeManual = d.checklistValueMode === 'manual';
    const points = resolveChecklistPoints(d);
    const valueCheck = validateChecklistPoints(d);
    const checklistTheme = ieResolveChecklistTheme(d);
    const appearanceTemplateChecklist = d.appearanceTemplate || 'academic';
    const appearanceOpenChecklist = !!INST_EDITOR.openAppearance;
    // Gestiona status chip.
    const statusChip = (label, color, pts) => `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:${color};color:${ieContrastText(color)};font-weight:700;">${label}: ${fmtNum(round2(pts))} pts</span>`;
    body.innerHTML = `
      <div class="card cp">
        <div style="font-weight:800;margin-bottom:8px;">Información general</div>
        <div class="fr">
          <div class="fg"><label class="lbl">Curso o grado al que va dirigido este instrumento</label>
            <select class="sel" data-focus-id="checklist-course" onchange="ieSetCourseId(this.value)">
              <option value="" ${d.courseId?'':'selected'}>Ej.: 3ro A · Ciencias físicas</option>
              ${groups.map(g=>`<option value="${g.id}" ${d.courseId===g.id?'selected':''}>${g.gradeName} ${g.sectionName} · ${g.materia||'General'}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Tipo</label><input class="inp" readonly value="Lista de cotejo (simple)"></div>
        </div>
        <div class="fr" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Nombre de la actividad</label><input class="inp" data-focus-id="checklist-activity-name" value="${activityName}" placeholder="Ej.: Informe de laboratorio" oninput="ieSetChecklistActivityName(this.value)"></div>
          <div class="fg"><label class="lbl">Nombre completo del instrumento</label><div id="checklist-full-name-preview" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--off);font-weight:700;">${fullName}</div></div>
        </div>
        <div class="fr3" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Puntaje máximo total (objetivo)</label><input class="inp" data-focus-id="checklist-max-total" type="number" min="0" step="0.01" max="999" value="${(d.maxTotal ?? d.maxScore)===0?'':(d.maxTotal ?? d.maxScore)}" onchange="ieSetChecklistMaxInput(this.value)"></div>
          <div class="fg"><label class="lbl">Año escolar</label>
            <select class="sel" data-focus-id="checklist-school-year" onchange="ieSetSchoolYear(this.value)">
              ${schoolYears.map(y=>`<option value="${y}" ${(d.schoolYear||S.schoolYear?.name||'2025-2026')===y?'selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Período</label>
            <select class="sel" data-focus-id="checklist-period" onchange="ieSetPeriodId(this.value)">
              ${periods.map(p=>`<option value="${p.id}" ${(d.periodId||S.activePeriodId)===p.id?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="font-weight:800;margin-bottom:8px;">Configuración del modo de evaluación</div>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="checklist-mode" ${tri?'':'checked'} onchange="ieSetChecklistMode('dichotomic')"> Cumple / No cumple</label>
          <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="checklist-mode" ${tri?'checked':''} onchange="ieSetChecklistMode('trichotomic')"> Cumple / Parcial / No cumple</label>
        </div>
        <div style="font-size:12px;color:var(--mute);margin-top:8px;">Valores de evaluación</div>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="checklist-value-mode" ${modeManual?'':'checked'} onchange="ieSetChecklistValueMode('auto')"> Automático</label>
          <label style="display:flex;align-items:center;gap:6px;"><input type="radio" name="checklist-value-mode" ${modeManual?'checked':''} onchange="ieSetChecklistValueMode('manual')"> Manual</label>
          <button class="btn btn-outline btn-sm" onclick="ieResetChecklistAutoValues()">Restablecer valores automáticos</button>
        </div>
        <div class="fr3" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Cumple</label><input class="inp" type="number" min="0" step="0.01" value="${fmtNum(points.yes)}" ${modeManual?'':'readonly'} onchange="ieSetChecklistPoint('yes',this.value)"></div>
          <div class="fg" style="display:${tri?'block':'none'};"><label class="lbl">Parcial</label><input class="inp" type="number" min="0" step="0.01" value="${fmtNum(points.partial)}" ${modeManual?'':'readonly'} onchange="ieSetChecklistPoint('partial',this.value)"></div>
          <div class="fg"><label class="lbl">No cumple</label><input class="inp" type="number" min="0" step="0.01" value="${fmtNum(points.no)}" ${modeManual?'':'readonly'} onchange="ieSetChecklistPoint('no',this.value)"></div>
        </div>
        ${valueCheck.severe?`<div style="margin-top:8px;font-size:12px;color:var(--rose);font-weight:700;">${valueCheck.severeMessage}</div>`:''}
        ${(!valueCheck.severe && valueCheck.warn)?`<div style="margin-top:8px;font-size:12px;color:#A16207;font-weight:700;">${valueCheck.warnMessage}</div>`:''}
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
          ${statusChip('Cumple', checklistTheme.yesColor, points.yes)}
          ${tri ? statusChip('Parcial', checklistTheme.partialColor, points.partial) : ''}
          ${statusChip('No cumple', checklistTheme.noColor, points.no)}
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="font-weight:800;">Lista de criterios</div>
          <button class="btn btn-outline btn-sm" onclick="ieAddCriterion()">+ Agregar criterio</button>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl">
            <thead><tr><th>#</th><th>Criterio</th><th>Orden</th><th>Eliminar</th></tr></thead>
            <tbody>
              ${d.criteria.map((c,idx)=>`<tr>
                <td>${idx+1}</td>
                <td><input class="inp" data-focus-id="checklist-crt-${c.id}-label" style="${invalidCriteria.has(c.id)?'border-color:var(--rose);box-shadow:0 0 0 2px rgba(244,63,94,.15);':''}" value="${c.label||c.name||''}" oninput="ieSetCriterion('${c.id}','label',this.value)"></td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',-1)">↑</button>
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',1)">↓</button>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="ieDelCriterion('${c.id}')"><i class="ri-delete-bin-line"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="font-size:13px;font-weight:700;">Valor por criterio: ${fmtNum(round2(per))} puntos</div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAppearancePanel()">
          <span style="font-weight:800;">Apariencia visual</span><span>${appearanceOpenChecklist?'▾':'▸'}</span>
        </button>
        <div style="display:${appearanceOpenChecklist?'block':'none'};margin-top:10px;">
          <div class="fr">
            <div class="fg">
              <label class="lbl">Plantilla visual</label>
              <select class="sel" data-focus-id="checklist-appearance-template" onchange="ieSetAppearanceTemplate(this.value)">
                ${Object.keys(RUBRIC_APPEARANCE_TEMPLATES).map(k=>`<option value="${k}" ${appearanceTemplateChecklist===k?'selected':''}>${RUBRIC_APPEARANCE_TEMPLATES[k].label}</option>`).join('')}
              </select>
            </div>
            <div class="fg"><label class="lbl">Color encabezado</label><input class="inp" data-focus-id="checklist-color-header-bg" type="color" value="${checklistTheme.headerBg}" onchange="ieSetAppearanceColor('headerBg', this.value)"></div>
          </div>
          <div class="fr3" style="display:${appearanceTemplateChecklist==='custom'?'grid':'none'};margin-top:8px;">
            <div class="fg"><label class="lbl">Color ¿Cumple?</label><input class="inp" data-focus-id="checklist-color-yes" type="color" value="${checklistTheme.yesColor}" onchange="ieSetChecklistStatusColor('checkYesColor', this.value)"></div>
            <div class="fg"><label class="lbl">Color ¿Parcial?</label><input class="inp" data-focus-id="checklist-color-partial" type="color" value="${checklistTheme.partialColor}" onchange="ieSetChecklistStatusColor('checkPartialColor', this.value)"></div>
            <div class="fg"><label class="lbl">Color ¿No cumple?</label><input class="inp" data-focus-id="checklist-color-no" type="color" value="${checklistTheme.noColor}" onchange="ieSetChecklistStatusColor('checkNoColor', this.value)"></div>
          </div>
          <div class="fr3" style="display:${appearanceTemplateChecklist==='custom'?'grid':'none'};margin-top:8px;">
            <div class="fg"><label class="lbl">Filas alternadas</label><input class="inp" data-focus-id="checklist-color-row-alt" type="color" value="${checklistTheme.rowAltBg}" onchange="ieSetAppearanceColor('rowAltBg', this.value)"></div>
            <div class="fg"><label class="lbl">Bordes</label><input class="inp" data-focus-id="checklist-color-border" type="color" value="${checklistTheme.tableBorder}" onchange="ieSetAppearanceColor('tableBorder', this.value)"></div>
            <div class="fg"><label class="lbl">Columna resumen</label><input class="inp" data-focus-id="checklist-color-meta" type="color" value="${checklistTheme.metaColumnBg}" onchange="ieSetAppearanceColor('metaColumnBg', this.value)"></div>
          </div>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <div style="font-weight:800;">Vista previa</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentPdf()"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Descargar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentWord()"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Descargar Word</button>
          </div>
        </div>
        <div id="checklist-preview-box" style="border:1px solid ${checklistTheme.tableBorder};border-radius:10px;overflow:hidden;">
          <div id="checklist-preview-title" style="padding:10px 12px;background:${checklistTheme.headerBg};color:${checklistTheme.headerText||ieContrastText(checklistTheme.headerBg)};font-weight:800;">${fullName}</div>
          <div style="padding:10px 12px;background:${checklistTheme.rowAltBg};font-size:12px;">Curso: ${d.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado'} - Período: ${periodName(d.periodId)}</div>
          <div id="checklist-preview-summary" style="padding:10px 12px;background:${checklistTheme.rowBaseBg};font-size:12px;">${count} criterios - ${fmtNum(round2(total))} puntos totales</div>
          <div id="checklist-preview-criteria" style="padding:10px 12px;background:${checklistTheme.rowBaseBg};font-size:12px;line-height:1.6;">
            <div style="overflow-x:auto;">
              <table class="tbl" style="border-color:${checklistTheme.tableBorder};">
                <thead>
                  <tr>
                    <th style="background:${checklistTheme.metaColumnBg};">Criterio</th>
                    <th style="color:${checklistTheme.yesColor};">Cumple</th>
                    ${tri?`<th style="color:${checklistTheme.partialColor};">Parcial</th>`:''}
                    <th style="color:${checklistTheme.noColor};">No cumple</th>
                  </tr>
                </thead>
                <tbody>
                  ${(d.criteria||[]).map((c, idx)=>`<tr style="background:${idx%2?checklistTheme.rowAltBg:checklistTheme.rowBaseBg};">
                    <td style="font-weight:700;">${idx+1}. ${c.label||c.name||`Criterio ${idx+1}`}</td>
                    <td style="text-align:center;font-size:16px;">✓</td>
                    ${tri?`<td style="text-align:center;font-size:16px;">~</td>`:''}
                    <td style="text-align:center;font-size:16px;">✕</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:10px;">
              <label style="font-weight:700;display:block;margin-bottom:4px;">Observaciones del docente</label>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" onclick="closeM('m-inst-editor')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveInstrumentEditor()">Guardar instrumento</button>
        ${INST_EDITOR.linkActivityId?`<button class="btn btn-amber" onclick="saveInstrumentEditor(true)">Guardar y vincular a actividad</button>`:''}
      </div>
    `;
    restoreInstrumentEditorUIState(body, uiState);
    return;
  }
  if (d.type==='lista_cotejo_b') {
    normalizeWeightedChecklistDraft(d);
    const groups = getGroups();
    const periods = S.periods || DEFAULT_PERIODS;
    const schoolYears = buildSchoolYearOptions();
    const activityName = stripInstrumentNamePrefix('lista_cotejo_b', d.name||'');
    const fullName = composeInstrumentName('lista_cotejo_b', activityName);
    const total = parseFloat(d.maxTotal ?? d.maxScore) || 0;
    const sumCriteria = weightedCriteriaSum(d);
    const sumOk = round2(sumCriteria)===round2(total);
    const warn = !sumOk ? 'La suma de los criterios no coincide con el puntaje máximo del instrumento.' : '';
    const checklistTheme = ieResolveChecklistTheme(d);
    const appearanceTemplateWeighted = d.appearanceTemplate || 'academic';
    const appearanceOpenWeighted = !!INST_EDITOR.openAppearance;
    body.innerHTML = `
      <div class="card cp">
        <div style="font-weight:800;margin-bottom:8px;">Información general</div>
        <div class="fr">
          <div class="fg"><label class="lbl">Curso o grado al que va dirigido este instrumento</label>
            <select class="sel" data-focus-id="weighted-course" onchange="ieSetCourseId(this.value)">
              <option value="" ${d.courseId?'':'selected'}>Ej.: 3ro A · Ciencias físicas</option>
              ${groups.map(g=>`<option value="${g.id}" ${d.courseId===g.id?'selected':''}>${g.gradeName} ${g.sectionName} · ${g.materia||'General'}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Tipo</label><input class="inp" readonly value="Lista ponderada"></div>
        </div>
        <div class="fr" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Nombre de la actividad</label><input class="inp" data-focus-id="weighted-name" value="${activityName}" placeholder="Ej.: Informe de laboratorio" oninput="ieSetInstrumentActivityName(this.value)"></div>
          <div class="fg"><label class="lbl">Nombre completo del instrumento</label><div id="instrument-full-name-preview" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--off);font-weight:700;">${fullName}</div></div>
        </div>
        <div class="fr3">
          <div class="fg"><label class="lbl">Puntaje máximo total (objetivo)</label><input class="inp" data-focus-id="weighted-max-total" type="number" min="0" step="0.01" max="999" value="${d.maxTotal ?? d.maxScore}" oninput="ieSetWeightedMaxInput(this.value)"></div>
          <div class="fg"><label class="lbl">Año escolar</label>
            <select class="sel" data-focus-id="weighted-year" onchange="ieSetSchoolYear(this.value)">
              ${schoolYears.map(y=>`<option value="${y}" ${(d.schoolYear||S.schoolYear?.name||'2025-2026')===y?'selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Período</label>
            <select class="sel" data-focus-id="weighted-period" onchange="ieSetPeriodId(this.value)">
              ${periods.map(p=>`<option value="${p.id}" ${(d.periodId||S.activePeriodId)===p.id?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;justify-content:flex-start;">
          <button class="btn btn-outline btn-sm" onclick="ieAutoAdjustWeightedFromTotal()">Autoajustar criterios</button>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="font-weight:800;">Lista de criterios</div>
          <button class="btn btn-outline btn-sm" onclick="ieAddCriterion()">+ Agregar criterio</button>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl">
            <thead><tr><th>#</th><th>Criterio</th><th>Puntos del criterio</th><th>Orden</th><th>Eliminar</th></tr></thead>
            <tbody>
              ${d.criteria.map((c,idx)=>`<tr>
                <td>${idx+1}</td>
                <td><input class="inp" data-focus-id="weighted-crt-${c.id}-label" value="${c.label||c.name||''}" oninput="ieSetCriterion('${c.id}','label',this.value)"></td>
                <td><input class="inp" data-focus-id="weighted-crt-${c.id}-max" type="number" min="0" step="0.01" value="${fmtNum(c.maxPoints)}" oninput="ieSetCriterion('${c.id}','maxPoints',this.value)"></td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',-1)">↑</button>
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',1)">↓</button>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="ieDelCriterion('${c.id}')"><i class="ri-delete-bin-line"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px;font-size:12px;color:${sumOk?'var(--ok)':'var(--rose)'};font-weight:700;">
          Suma de criterios: ${fmtNum(sumCriteria)} / ${fmtNum(total)} ${warn ? `? ${warn}` : ''}
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAppearancePanel()">
          <span style="font-weight:800;">Apariencia visual</span><span>${appearanceOpenWeighted?'▾':'▸'}</span>
        </button>
        <div style="display:${appearanceOpenWeighted?'block':'none'};margin-top:10px;">
          <div class="fr">
            <div class="fg">
              <label class="lbl">Plantilla visual</label>
              <select class="sel" data-focus-id="weighted-appearance-template" onchange="ieSetAppearanceTemplate(this.value)">
                ${['academic','azul_institucional','morado_elegante','verde_institucional','gris_moderno'].map(k=>`<option value="${k}" ${appearanceTemplateWeighted===k?'selected':''}>${RUBRIC_APPEARANCE_TEMPLATES[k].label}</option>`).join('')}
              </select>
            </div>
            <div class="fg">
              <label class="lbl">Color del encabezado</label>
              <input class="inp" data-focus-id="weighted-color-header-bg" type="color" value="${checklistTheme.headerBg}" onchange="ieSetAppearanceColor('headerBg', this.value)">
            </div>
          </div>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <div style="font-weight:800;">Vista previa imprimible</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentPdf()"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Descargar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentWord()"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Descargar Word</button>
          </div>
        </div>
        <div id="weighted-preview-box" style="border:1px solid ${checklistTheme.tableBorder};border-radius:10px;overflow:hidden;">
          <div style="padding:10px 12px;background:${checklistTheme.headerBg};color:${checklistTheme.headerText||ieContrastText(checklistTheme.headerBg)};font-weight:800;">${fullName}</div>
          <div style="padding:10px 12px;background:${checklistTheme.rowAltBg};font-size:12px;">${d.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado'} · ${periodName(d.periodId)}</div>
          <div style="padding:10px 12px;background:${checklistTheme.rowBaseBg};font-size:12px;">${(d.criteria||[]).length} criterios · ${fmtNum(total)} puntos totales · Puntaje máximo: ${fmtNum(total)}</div>
          <div style="padding:10px 12px;background:${checklistTheme.rowBaseBg};">
            <div style="overflow-x:auto;">
              <table class="tbl" style="border-color:${checklistTheme.tableBorder};">
                <thead><tr><th>Criterio</th><th>Puntos obtenidos</th><th>Puntos del criterio</th></tr></thead>
                <tbody>
                  ${(d.criteria||[]).map((c, idx)=>`<tr style="background:${idx%2?checklistTheme.rowAltBg:checklistTheme.rowBaseBg};"><td>${idx+1}. ${c.label||c.name||''}</td><td style="text-align:center;"><span style="display:inline-block;min-width:68px;height:28px;border:1.5px solid ${checklistTheme.tableBorder};border-radius:6px;"></span></td><td style="text-align:center;">${fmtNum(c.maxPoints)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:10px;">
              <label style="font-weight:700;display:block;margin-bottom:4px;">Observaciones del docente</label>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" onclick="closeM('m-inst-editor')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveInstrumentEditor()">Guardar instrumento</button>
        ${INST_EDITOR.linkActivityId?`<button class="btn btn-amber" onclick="saveInstrumentEditor(true)">Guardar y vincular a actividad</button>`:''}
      </div>
    `;
    restoreInstrumentEditorUIState(body, uiState);
    return;
  }
  if (d.type==='escala_estimativa') {
    normalizeEstimativeDraft(d);
    const groups = getGroups();
    const periods = S.periods || DEFAULT_PERIODS;
    const schoolYears = buildSchoolYearOptions();
    const activityName = stripInstrumentNamePrefix('escala_estimativa', d.name||'');
    const fullName = composeInstrumentName('escala_estimativa', activityName);
    const scaleTheme = ieResolveChecklistTheme(d);
    const appearanceTemplateScale = d.appearanceTemplate || 'academic';
    const appearanceOpenScale = !!INST_EDITOR.openAppearance;
    const criteriaCount = Math.max(1, (d.criteria||[]).length || 1);
    const perCriterion = (Math.max(0, parseFloat(d.maxTotal ?? d.maxScore) || 0)) / criteriaCount;
    const maxLevelValue = Math.max(0, ...((d.levels||[]).map(l=>parseFloat(l.value)||0)));
    body.innerHTML = `
      <div class="card cp">
        <div style="font-weight:800;margin-bottom:8px;">Información general</div>
        <div class="fr">
          <div class="fg"><label class="lbl">Curso o grado al que va dirigido este instrumento</label>
            <select class="sel" data-focus-id="scale-course" onchange="ieSetCourseId(this.value)">
              <option value="" ${d.courseId?'':'selected'}>Ej.: 3ro A · Ciencias físicas</option>
              ${groups.map(g=>`<option value="${g.id}" ${d.courseId===g.id?'selected':''}>${g.gradeName} ${g.sectionName} · ${g.materia||'General'}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Tipo</label><input class="inp" readonly value="Escala estimativa"></div>
        </div>
        <div class="fr" style="margin-top:8px;">
          <div class="fg"><label class="lbl">Nombre de la actividad</label><input class="inp" data-focus-id="scale-name" value="${activityName}" placeholder="Ej.: Participación en laboratorio" oninput="ieSetInstrumentActivityName(this.value)"></div>
          <div class="fg"><label class="lbl">Nombre completo del instrumento</label><div id="instrument-full-name-preview" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--off);font-weight:700;">${fullName}</div></div>
        </div>
        <div class="fr3">
          <div class="fg"><label class="lbl">Puntaje máximo total (objetivo)</label><input class="inp" data-focus-id="scale-max-total" type="number" min="0" step="0.01" value="${INST_EDITOR.scaleMaxInputRaw!==null ? INST_EDITOR.scaleMaxInputRaw : fmtNum(d.maxTotal ?? d.maxScore)}" oninput="ieSetScaleMaxInputRaw(this.value)" onblur="ieCommitScaleMaxInput(this.value)" onkeydown="ieHandleScaleMaxKey(event,this)"></div>
          <div class="fg"><label class="lbl">Año escolar</label>
            <select class="sel" data-focus-id="scale-year" onchange="ieSetSchoolYear(this.value)">
              ${schoolYears.map(y=>`<option value="${y}" ${(d.schoolYear||S.schoolYear?.name||'2025-2026')===y?'selected':''}>${y}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="lbl">Período</label>
            <select class="sel" data-focus-id="scale-period" onchange="ieSetPeriodId(this.value)">
              ${periods.map(p=>`<option value="${p.id}" ${(d.periodId||S.activePeriodId)===p.id?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:var(--mute);">El máximo por criterio se ajusta como: puntaje máximo / número de criterios.</div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="font-weight:800;">Configuración de la escala</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn btn-outline btn-sm" onclick="ieAutoAdjustScaleValues()">Autoajustar escala</button>
            <button class="btn btn-outline btn-sm" onclick="ieAddScaleLevel()">+ Nivel</button>
          </div>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl"><thead><tr><th>#</th><th>Nivel</th><th>Valor</th><th>Eliminar</th></tr></thead><tbody>
            ${(d.levels||[]).map((l,idx)=>`<tr>
              <td>${idx+1}</td>
              <td><input class="inp" data-focus-id="scale-lvl-${l.id}-label" value="${l.label||''}" oninput="ieSetScaleLevel('${l.id}','label',this.value)"></td>
              <td><input class="inp" data-focus-id="scale-lvl-${l.id}-value" type="number" min="0" step="0.01" value="${fmtNum(l.value)}" oninput="ieSetScaleLevel('${l.id}','value',this.value)"></td>
              <td><button class="btn btn-danger btn-sm" ${(d.levels||[]).length<=2?'disabled':''} onclick="ieDelScaleLevel('${l.id}')"><i class="ri-delete-bin-line"></i></button></td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="font-weight:800;">Lista de criterios</div>
          <button class="btn btn-outline btn-sm" onclick="ieAddCriterion()">+ Agregar criterio</button>
        </div>
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="tbl">
            <thead><tr><th>#</th><th>Criterio</th><th>Orden</th><th>Eliminar</th></tr></thead>
            <tbody>
              ${(d.criteria||[]).map((c,idx)=>`<tr>
                <td>${idx+1}</td>
                <td><input class="inp" data-focus-id="scale-crt-${c.id}-label" value="${c.label||c.name||''}" oninput="ieSetCriterion('${c.id}','label',this.value)"></td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',-1)">↑</button>
                  <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',1)">↓</button>
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="ieDelCriterion('${c.id}')"><i class="ri-delete-bin-line"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px;font-size:12px;color:var(--mute);">Valor máximo por criterio: ${fmtNum(perCriterion)} · Valor máximo de escala: ${fmtNum(maxLevelValue)} · Criterios: ${(d.criteria||[]).length} · Puntaje máximo: ${fmtNum(d.maxTotal ?? d.maxScore)}</div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" style="width:100%;justify-content:space-between;" onclick="ieToggleAppearancePanel()">
          <span style="font-weight:800;">Apariencia visual</span><span>${appearanceOpenScale?'▾':'▸'}</span>
        </button>
        <div style="display:${appearanceOpenScale?'block':'none'};margin-top:10px;">
          <div class="fr">
            <div class="fg">
              <label class="lbl">Plantilla visual</label>
              <select class="sel" data-focus-id="scale-appearance-template" onchange="ieSetAppearanceTemplate(this.value)">
                ${['academic','azul_institucional','morado_elegante','verde_institucional','gris_moderno'].map(k=>`<option value="${k}" ${appearanceTemplateScale===k?'selected':''}>${RUBRIC_APPEARANCE_TEMPLATES[k].label}</option>`).join('')}
              </select>
            </div>
            <div class="fg"><label class="lbl">Color del encabezado</label><input class="inp" data-focus-id="scale-color-header-bg" type="color" value="${scaleTheme.headerBg}" onchange="ieSetAppearanceColor('headerBg', this.value)"></div>
          </div>
        </div>
      </div>
      <div class="card cp" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <div style="font-weight:800;">Vista previa imprimible</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentPdf()"><img class="btn-doc-icon" src="/assets/icons/logopdf.png" alt="PDF">Descargar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="ieDownloadInstrumentWord()"><img class="btn-doc-icon" src="/assets/icons/logoword.png" alt="Word">Descargar Word</button>
          </div>
        </div>
        <div id="scale-preview-box" style="border:1px solid ${scaleTheme.tableBorder};border-radius:10px;overflow:hidden;">
          <div style="padding:10px 12px;background:${scaleTheme.headerBg};color:${scaleTheme.headerText||ieContrastText(scaleTheme.headerBg)};font-weight:800;">${fullName}</div>
          <div style="padding:10px 12px;background:${scaleTheme.rowAltBg};font-size:12px;">${d.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado'} · ${periodName(d.periodId)}</div>
          <div style="padding:10px 12px;background:${scaleTheme.rowBaseBg};font-size:12px;">Criterios: ${(d.criteria||[]).length} · Puntaje máximo: ${fmtNum(d.maxTotal ?? d.maxScore)}</div>
          <div style="padding:10px 12px;background:${scaleTheme.rowBaseBg};">
            <div style="overflow-x:auto;">
              <table class="tbl" style="border-color:${scaleTheme.tableBorder};">
                <thead><tr><th>Criterio</th>${(d.levels||[]).map(l=>`<th>${l.label}</th>`).join('')}</tr></thead>
                <tbody>
                  ${(d.criteria||[]).map((c, idx)=>`<tr style="background:${idx%2?scaleTheme.rowAltBg:scaleTheme.rowBaseBg};"><td>${idx+1}. ${c.label||c.name||''}</td>${(d.levels||[]).map(()=>`<td style="text-align:center;font-size:16px;">•</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:10px;">
              <label style="font-weight:700;display:block;margin-bottom:4px;">Observaciones del docente</label>
              <div style="border-bottom:1px solid ${scaleTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${scaleTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${scaleTheme.tableBorder};height:22px;"></div>
              <div style="border-bottom:1px solid ${scaleTheme.tableBorder};height:22px;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="mf">
        <button class="btn btn-outline" onclick="closeM('m-inst-editor')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveInstrumentEditor()">Guardar instrumento</button>
        ${INST_EDITOR.linkActivityId?`<button class="btn btn-amber" onclick="saveInstrumentEditor(true)">Guardar y vincular a actividad</button>`:''}
      </div>
    `;
    restoreInstrumentEditorUIState(body, uiState);
    return;
  }
  body.innerHTML = `
    ${contextLine}
    <div class="fr">
      <div class="fg"><label class="lbl">Nombre</label><input class="inp" data-focus-id="inst-name" value="${d.name}" oninput="ieSetName(this.value)"></div>
      <div class="fg"><label class="lbl">Tipo</label>
        <select class="sel" ${INST_EDITOR.mode==='edit' && !isBasicInstrumentType(d.type)?'disabled title="Instrumento legacy: tipo no editable en esta versión"':''} onchange="ieChangeType(this.value)">
          ${!isBasicInstrumentType(d.type)?`<option value="${d.type}" selected>${instrumentTypeLabel(d.type)} (legacy)</option>`:''}
          <option value="rubrica_analitica" ${d.type==='rubrica_analitica'?'selected':''}>Rúbrica analítica</option>
          <option value="lista_cotejo_a" ${d.type==='lista_cotejo_a'?'selected':''}>Lista de cotejo (simple)</option>
          <option value="lista_cotejo_b" ${d.type==='lista_cotejo_b'?'selected':''}>Lista de cotejo ponderada</option>
          <option value="escala_estimativa" ${d.type==='escala_estimativa'?'selected':''}>Escala estimativa</option>
        </select>
      </div>
    </div>
    <div class="fr">
      <div class="fg"><label class="lbl">Puntaje máximo total (objetivo)</label><input class="inp" data-focus-id="inst-max-total" type="number" min="1" max="999" value="${d.maxTotal ?? d.maxScore}" oninput="ieSetMax(this.value)"></div>
      <div class="fg"><label class="lbl">Año / Período</label><div style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;">${d.schoolYear||S.schoolYear?.name||'2025-2026'} · ${periodName(d.periodId)}</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
      <div style="font-size:12px;color:var(--mute);">Criterios editables con ponderación, orden y puntaje.</div>
      <button class="btn btn-outline btn-sm" onclick="ieAddCriterion()">+ Agregar criterio</button>
    </div>
    <div style="overflow-x:auto;">
      <table class="tbl">
        <thead><tr><th>#</th><th>Criterio</th><th>Puntos del criterio</th><th>Peso (%)</th><th>Orden</th><th></th></tr></thead>
        <tbody>
          ${d.criteria.map((c,idx)=>`<tr>
            <td>${idx+1}</td>
            <td><input class="inp" data-focus-id="inst-crt-${c.id}-label" value="${c.label||c.name}" oninput="ieSetCriterion('${c.id}','label',this.value)"></td>
            <td><input class="inp" data-focus-id="inst-crt-${c.id}-max" type="number" min="0" max="999" value="${c.maxPoints}" oninput="ieSetCriterion('${c.id}','maxPoints',this.value,this)"></td>
            <td><input class="inp" data-focus-id="inst-crt-${c.id}-weight" type="number" min="0" max="100" value="${c.weightPct ?? c.weight ?? 0}" oninput="ieSetCriterion('${c.id}','weightPct',this.value)"></td>
            <td style="white-space:nowrap;">
              <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',-1)">↑</button>
              <button class="btn btn-outline btn-sm" onclick="ieMoveCriterion('${c.id}',1)">↓</button>
            </td>
            <td><button class="btn btn-danger btn-sm" onclick="ieDelCriterion('${c.id}')"><i class="ri-delete-bin-line"></i></button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--off);font-size:12px;">
      Vista previa del cálculo final: <strong>${fmtNum(maxCalc)}</strong> puntos calculados · Objetivo: <strong>${fmtNum(d.maxTotal ?? d.maxScore)}</strong>.
      ${round2(maxCalc)!==round2(parseFloat(d.maxTotal ?? d.maxScore)||0)?`<span style="color:var(--rose);font-weight:700;"> Ajusta criterios para coincidir.</span>`:''}
      <br>Ponderación total registrada: <strong>${weights}%</strong>
    </div>
    <div class="mf">
      <button class="btn btn-outline" onclick="closeM('m-inst-editor')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveInstrumentEditor()">Guardar instrumento</button>
      ${INST_EDITOR.linkActivityId?`<button class="btn btn-amber" onclick="saveInstrumentEditor(true)">Guardar y vincular a actividad</button>`:''}
    </div>
    `;
  restoreInstrumentEditorUIState(body, uiState);
  ieAutoGrowAllRubricDescriptors(body);
}

// Captura el scroll y el foco del editor para poder re-renderizar sin perder el punto exacto en el que está trabajando la persona.
function captureInstrumentEditorUIState(bodyEl) {
  const scroller = bodyEl;
  const state = {
    scrollTop: scroller ? scroller.scrollTop : 0,
    focusId: null,
    selectionStart: null,
    selectionEnd: null
  };
  const active = document.activeElement;
  if (active && bodyEl.contains(active)) {
    state.focusId = active.getAttribute('data-focus-id');
    try {
      state.selectionStart = active.selectionStart;
      state.selectionEnd = active.selectionEnd;
    } catch (_) {}
  }
  return state;
}
// Restaura el estado visual del editor después de un render completo, devolviendo scroll y foco al mismo lugar.
function restoreInstrumentEditorUIState(bodyEl, state) {
  if (!state) return;
  requestAnimationFrame(() => {
    bodyEl.scrollTop = state.scrollTop || 0;
    if (!state.focusId) return;
    const target = bodyEl.querySelector(`[data-focus-id="${state.focusId}"]`);
    if (!target) return;
    try {
      target.focus({preventScroll:true});
      if (typeof state.selectionStart === 'number' && typeof state.selectionEnd === 'number' && typeof target.setSelectionRange === 'function') {
        target.setSelectionRange(state.selectionStart, state.selectionEnd);
      }
    } catch (_) {}
  });
}

// Ajusta automáticamente la altura de un descriptor para que el texto completo quede visible al escribir.
function ieAutoGrowDescriptor(el) {
  if (!el) return;
  const minHeight = 96;
  el.style.height = 'auto';
  el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
}
// Recorre todos los descriptores visibles de la rúbrica y les recalcula la altura para evitar barras de scroll internas.
function ieAutoGrowAllRubricDescriptors(root = document) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('.ta-rubric-desc').forEach(ieAutoGrowDescriptor);
}

// Actualiza el nombre base del instrumento en el borrador actual.
function ieSetName(vv){ INST_EDITOR.draft.name = vv; }
// Cambia el nombre de la actividad asociada al instrumento y sincroniza la vista previa del nombre completo.
function ieSetInstrumentActivityName(vv) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  d.name = vv;
  const preview = document.getElementById('instrument-full-name-preview');
  if (preview) preview.textContent = composeInstrumentName(d.type, vv || '');
}
// Construye un nombre de archivo seguro para exportar el instrumento a PDF o Word.
function ieExportBaseName() {
  const d = INST_EDITOR.draft;
  if (!d) return 'instrumento';
  const raw = d.type==='lista_cotejo_a' ? (d.activityName || '') : (d.name || '');
  const full = composeInstrumentName(d.type, raw);
  return String(full || 'instrumento').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// Devuelve el nodo DOM de la vista previa que corresponde al tipo de instrumento actual.
function ieGetPreviewElement() {
  const d = INST_EDITOR.draft;
  if (!d) return null;
  if (d.type==='rubrica_analitica') return document.querySelector('#inst-preview-export');
  if (d.type==='lista_cotejo_a') return document.getElementById('checklist-preview-box');
  if (d.type==='lista_cotejo_b') return document.getElementById('weighted-preview-box');
  if (d.type==='escala_estimativa') return document.getElementById('scale-preview-box');
  return null;
}
// Clona una vista previa y copia estilos computados al árbol clonado para que el exportado mantenga la apariencia visual.
function ieCloneWithInlineStyles(rootEl) {
  const clone = rootEl.cloneNode(true);
  const src = [rootEl, ...rootEl.querySelectorAll('*')];
  const dst = [clone, ...clone.querySelectorAll('*')];
  const props = [
    'font-family','font-size','font-weight','font-style','line-height','letter-spacing',
    'color','background-color','border','border-top','border-right','border-bottom','border-left',
    'border-radius','padding','padding-top','padding-right','padding-bottom','padding-left',
    'margin','margin-top','margin-right','margin-bottom','margin-left','text-align','vertical-align',
    'display','width','min-width','max-width','height','min-height','max-height','box-sizing',
    'border-collapse','border-spacing','white-space','overflow','overflow-x','overflow-y'
  ];
  for (let i=0; i<src.length && i<dst.length; i++) {
    const cs = window.getComputedStyle(src[i]);
    const css = props.map(p=>`${p}:${cs.getPropertyValue(p)};`).join('');
    dst[i].setAttribute('style', `${dst[i].getAttribute('style') || ''};${css}`);
  }
  return clone;
}
// Simplifica el clon exportable para que no tenga desbordes ni anchos inconsistentes al convertirlo en PDF o Word.
function iePrepareCloneForExport(clone) {
  if (!clone) return clone;
  clone.style.width = '100%';
  clone.style.maxWidth = 'none';
  clone.style.background = '#ffffff';
  clone.style.color = '#0f172a';
  clone.querySelectorAll('*').forEach((el) => {
    if (el.style) {
      const ox = (el.style.overflowX || '').toLowerCase();
      const oy = (el.style.overflowY || '').toLowerCase();
      const ov = (el.style.overflow || '').toLowerCase();
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') el.style.overflowX = 'visible';
      if (oy === 'auto' || oy === 'scroll' || oy === 'hidden') el.style.overflowY = 'visible';
      if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') el.style.overflow = 'visible';
      if (el.tagName === 'TABLE') {
        el.style.width = '100%';
        el.style.maxWidth = 'none';
      }
    }
  });
  const checklistTable = clone.matches && clone.matches('#checklist-preview-box')
    ? clone.querySelector('table')
    : clone.querySelector('#checklist-preview-box table');
  if (checklistTable) {
    checklistTable.style.width = '100%';
    checklistTable.style.maxWidth = '100%';
    checklistTable.style.tableLayout = 'fixed';
    checklistTable.style.minWidth = '0';
    const rows = checklistTable.querySelectorAll('tr');
    const headerCells = checklistTable.querySelectorAll('thead th');
    const colCount = headerCells.length || 0;
    const statusCols = Math.max(0, colCount - 1);
    const firstColWidth = statusCols >= 3 ? '52%' : '68%';
    const statusColWidth = statusCols >= 3 ? '16%' : '16%';
    rows.forEach((row) => {
      const cells = row.children || [];
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (!cell || !cell.style) continue;
        cell.style.maxWidth = '';
        if (i === 0) {
          cell.style.width = firstColWidth;
          cell.style.minWidth = firstColWidth;
          cell.style.textAlign = 'left';
        } else {
          cell.style.width = statusColWidth;
          cell.style.minWidth = statusColWidth;
          cell.style.textAlign = 'center';
          cell.style.whiteSpace = 'normal';
        }
      }
    });
  }
  return clone;
}
// Genera un HTML autónomo de impresión o Word a partir de una vista previa ya clonada.
function ieBuildExportHtml(title, cloneHtml, opts = {}) {
  const mode = opts.mode === 'word' ? 'word' : 'print';
  const pageRule = mode === 'word'
    ? '@page Section1 { size: A4 landscape; margin: 6mm; mso-page-orientation:landscape; }'
    : '@page { margin: 6mm; }';
  const bodyLayout = mode === 'word'
    ? 'margin:0;padding:0;background:#fff;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;color:#0f172a;text-align:center;'
    : 'margin:0;padding:0;background:#fff;font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;color:#0f172a;display:flex;justify-content:center;';
  const sectionLayout = mode === 'word'
    ? 'page:Section1;width:100%;max-width:none;margin:0;padding:0;text-align:center;'
    : 'page:Section1;width:100%;max-width:none;margin:0 auto;padding:0;';
  const rootLayout = mode === 'word'
    ? 'width:808pt !important;max-width:808pt !important;margin:0 auto !important;background:#fff !important;display:inline-block;text-align:left;'
    : 'width:100% !important;max-width:100% !important;margin:0 auto !important;background:#fff !important;';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>
    ${pageRule}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    html,body{width:100%;height:auto;background:#fff;}
    body{${bodyLayout}}
    .Section1{${sectionLayout}}
    .eg-export-root{${rootLayout}}
    .eg-export-root *{min-width:0 !important;}
    .eg-export-root table{width:100% !important;max-width:none !important;border-collapse:collapse;}
    .eg-export-root th,.eg-export-root td{font-size:13.5px;line-height:1.35;padding:10px 12px;}
    .eg-export-root th,.eg-export-root td{white-space:normal !important;word-break:break-word;}
    .eg-export-root #checklist-preview-box table{table-layout:fixed !important;width:100% !important;}
    .eg-export-root #checklist-preview-box th:nth-child(n+2),
    .eg-export-root #checklist-preview-box td:nth-child(n+2){
      width:120px !important;
      min-width:120px !important;
      text-align:center !important;
    }
    .eg-export-root #checklist-preview-box th:first-child,
    .eg-export-root #checklist-preview-box td:first-child{
      width:auto !important;
    }
    .eg-export-root #checklist-preview-box th,
    .eg-export-root #checklist-preview-box td{white-space:normal !important;word-break:break-word;}
  </style>
  </head><body><div class="Section1"><div class="eg-export-root">${cloneHtml}</div></div></body></html>`;
}
// Construye la versión imprimible de la lista de cotejo simple con su tabla y espacio de observaciones.
function ieBuildChecklistPrintHtml(d, title='Lista de cotejo') {
  const theme = ieResolveChecklistTheme(d || {});
  const criteria = Array.isArray(d?.criteria) ? d.criteria : [];
  const tri = (d?.checklistMode || 'dichotomic') === 'trichotomic';
  const total = parseFloat(d?.maxTotal ?? d?.maxScore) || 0;
  const firstColWidth = tri ? '52%' : '68%';
  const statusColWidth = '16%';
  const safeTitle = escapeHtml(title || 'Lista de cotejo');
  const courseText = escapeHtml(d?.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado');
  const periodText = escapeHtml(periodName(d?.periodId));
  const rowsHtml = criteria.map((c, idx) => {
    const label = escapeHtml(c?.label || c?.name || `Criterio ${idx + 1}`);
    return `<tr>
      <td>${idx + 1}. ${label}</td>
      <td class="ck">✓</td>
      ${tri ? '<td class="ck">~</td>' : ''}
      <td class="ck">✕</td>
    </tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    @page { margin: 6mm; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    html,body{margin:0;padding:0;background:#fff;color:#0f172a;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .sheet{width:100%;max-width:100%;margin:0 auto;border:1px solid ${theme.tableBorder};border-radius:10px;overflow:hidden;}
    .head{padding:10px 12px;background:${theme.headerBg};color:${theme.headerText||ieContrastText(theme.headerBg)};font-weight:800;font-size:20px;}
    .meta{padding:10px 12px;background:${theme.rowAltBg};font-size:12px;}
    .sum{padding:10px 12px;background:${theme.rowBaseBg};font-size:12px;}
    table{width:100%;border-collapse:collapse;table-layout:fixed;}
    th,td{border-bottom:1px solid ${theme.tableBorder};padding:10px 12px;font-size:13.5px;line-height:1.35;white-space:normal;word-break:break-word;}
    th{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748b;background:${theme.rowAltBg};text-align:left;}
    th:nth-child(1), td:nth-child(1){width:${firstColWidth};text-align:left;color:#334e73;font-weight:700;}
    th:nth-child(n+2), td:nth-child(n+2){width:${statusColWidth};text-align:center;}
    th.yes{color:${theme.yesColor};}
    th.partial{color:${theme.partialColor};}
    th.no{color:${theme.noColor};}
    tbody tr:nth-child(even) td{background:${theme.rowAltBg};}
    .ck{font-size:16px;color:#334e73;}
    .obs{padding:10px 12px;background:${theme.rowBaseBg};}
    .obs label{font-weight:700;display:block;margin-bottom:4px;}
    .line{border-bottom:1px solid ${theme.tableBorder};height:22px;}
  </style>
  </head><body>
    <div class="sheet">
      <div class="head">${safeTitle}</div>
      <div class="meta">Curso: ${courseText} - Período: ${periodText}</div>
      <div class="sum">${criteria.length} criterios ? ${fmtNum(round2(total))} puntos totales</div>
      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            <th class="yes">Cumple</th>
            ${tri ? '<th class="partial">Parcial</th>' : ''}
            <th class="no">No cumple</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="obs">
        <label>Observaciones del docente</label>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
  </body></html>`;
}
// Construye la versión imprimible de la lista ponderada, conservando la estructura de cálculo y los espacios de respuesta.
function ieBuildWeightedChecklistPrintHtml(d, title='Lista ponderada') {
  const theme = ieResolveChecklistTheme(d || {});
  const criteria = Array.isArray(d?.criteria) ? d.criteria : [];
  const total = parseFloat(d?.maxTotal ?? d?.maxScore) || 0;
  const safeTitle = escapeHtml(title || 'Lista ponderada');
  const courseText = escapeHtml(d?.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado');
  const periodText = escapeHtml(periodName(d?.periodId));
  const rowsHtml = criteria.map((c, idx) => {
    const label = escapeHtml(c?.label || c?.name || `Criterio ${idx + 1}`);
    const maxPts = fmtNum(parseFloat(c?.maxPoints) || 0);
    return `<tr>
      <td>${idx + 1}. ${label}</td>
      <td class="center"><span class="blank"></span></td>
      <td class="center">${maxPts}</td>
    </tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    @page { margin: 6mm; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    html,body{margin:0;padding:0;background:#fff;color:#0f172a;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .sheet{width:100%;max-width:100%;margin:0 auto;border:1px solid ${theme.tableBorder};border-radius:10px;overflow:hidden;}
    .head{padding:10px 12px;background:${theme.headerBg};color:${theme.headerText||ieContrastText(theme.headerBg)};font-weight:800;font-size:20px;}
    .meta{padding:10px 12px;background:${theme.rowAltBg};font-size:12px;}
    .sum{padding:10px 12px;background:${theme.rowBaseBg};font-size:12px;}
    table{width:100%;border-collapse:collapse;table-layout:fixed;}
    th,td{border-bottom:1px solid ${theme.tableBorder};padding:10px 12px;font-size:13.5px;line-height:1.35;white-space:normal;word-break:break-word;}
    th{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748b;background:${theme.rowAltBg};text-align:left;}
    th:nth-child(1), td:nth-child(1){width:62%;text-align:left;color:#334e73;font-weight:700;}
    th:nth-child(2), td:nth-child(2){width:18%;text-align:center;}
    th:nth-child(3), td:nth-child(3){width:20%;text-align:center;}
    tbody tr:nth-child(even) td{background:${theme.rowAltBg};}
    .blank{display:inline-block;width:68px;height:28px;border:1.5px solid ${theme.tableBorder};border-radius:6px;}
    .obs{padding:10px 12px;background:${theme.rowBaseBg};}
    .obs label{font-weight:700;display:block;margin-bottom:4px;}
    .line{border-bottom:1px solid ${theme.tableBorder};height:22px;}
  </style>
  </head><body>
    <div class="sheet">
      <div class="head">${safeTitle}</div>
      <div class="meta">Curso: ${courseText} - Período: ${periodText}</div>
      <div class="sum">${criteria.length} criterios - ${fmtNum(round2(total))} puntos totales - Puntaje máximo: ${fmtNum(round2(total))}</div>
      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Puntos obtenidos</th>
            <th>Puntos del criterio</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="obs">
        <label>Observaciones del docente</label>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
  </body></html>`;
}
// Construye la versión imprimible de la escala estimativa con columnas por nivel y espacio de observaciones.
function ieBuildScalePrintHtml(d, title='Escala estimativa') {
  const theme = ieResolveChecklistTheme(d || {});
  const criteria = Array.isArray(d?.criteria) ? d.criteria : [];
  const levels = Array.isArray(d?.levels) && d.levels.length ? d.levels : [{label:'Nivel 1'}];
  const total = parseFloat(d?.maxTotal ?? d?.maxScore) || 0;
  const safeTitle = escapeHtml(title || 'Escala estimativa');
  const courseText = escapeHtml(d?.courseId ? getGroupLabel(d.courseId) : 'Curso no seleccionado');
  const periodText = escapeHtml(periodName(d?.periodId));
  const firstColWidth = '40%';
  const levelColWidth = `${(60 / levels.length).toFixed(2)}%`;
  const headLevels = levels.map((l) => `<th>${escapeHtml(l?.label || 'Nivel')}</th>`).join('');
  const rowsHtml = criteria.map((c, idx) => {
    const label = escapeHtml(c?.label || c?.name || `Criterio ${idx + 1}`);
    const boxes = levels.map(() => '<td class="center">•</td>').join('');
    return `<tr><td>${idx + 1}. ${label}</td>${boxes}</tr>`;
  }).join('');
  const dynamicWidths = levels.map((_, i) => {
    const n = i + 2;
    return `th:nth-child(${n}),td:nth-child(${n}){width:${levelColWidth};text-align:center;}`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    @page { margin: 6mm; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    html,body{margin:0;padding:0;background:#fff;color:#0f172a;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .sheet{width:100%;max-width:100%;margin:0 auto;border:1px solid ${theme.tableBorder};border-radius:10px;overflow:hidden;}
    .head{padding:10px 12px;background:${theme.headerBg};color:${theme.headerText||ieContrastText(theme.headerBg)};font-weight:800;font-size:20px;}
    .meta{padding:10px 12px;background:${theme.rowAltBg};font-size:12px;}
    .sum{padding:10px 12px;background:${theme.rowBaseBg};font-size:12px;}
    table{width:100%;border-collapse:collapse;table-layout:fixed;}
    th,td{border-bottom:1px solid ${theme.tableBorder};padding:10px 12px;font-size:13.5px;line-height:1.35;white-space:normal;word-break:break-word;}
    th{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748b;background:${theme.rowAltBg};text-align:left;}
    th:nth-child(1), td:nth-child(1){width:${firstColWidth};text-align:left;color:#334e73;font-weight:700;}
    ${dynamicWidths}
    tbody tr:nth-child(even) td{background:${theme.rowAltBg};}
    .center{font-size:16px;color:#334e73;}
    .obs{padding:10px 12px;background:${theme.rowBaseBg};}
    .obs label{font-weight:700;display:block;margin-bottom:4px;}
    .line{border-bottom:1px solid ${theme.tableBorder};height:22px;}
  </style>
  </head><body>
    <div class="sheet">
      <div class="head">${safeTitle}</div>
      <div class="meta">Curso: ${courseText} - Período: ${periodText}</div>
      <div class="sum">Criterios: ${criteria.length} - Puntaje máximo: ${fmtNum(round2(total))}</div>
      <table>
        <thead><tr><th>Criterio</th>${headLevels}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="obs">
        <label>Observaciones del docente</label>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
  </body></html>`;
}
// Construye la versión imprimible de la rúbrica analítica con descriptores por nivel, puntos y peso.
function ieBuildRubricPrintHtml(d, title='Rúbrica analítica') {
  const theme = ieResolveAppearanceTheme(d || {});
  const levels = Array.isArray(d?.levels) ? d.levels : [];
  const criteria = Array.isArray(d?.criteria) ? d.criteria : [];
  const safeTitle = escapeHtml(title || 'Rúbrica analítica');
  const levelCount = Math.max(1, levels.length);
  const firstColWidth = '26%';
  const metaColsWidth = '11%';
  const levelColsWidth = `${(52 / levelCount).toFixed(2)}%`;
  const headLevels = levels.map((l) => `<th class="lvl">${escapeHtml(l?.label || 'Nivel')}</th>`).join('');
  const rowsHtml = criteria.map((c, idx) => {
    const label = escapeHtml(c?.label || c?.name || `Criterio ${idx + 1}`);
    const descs = levels.map((l) => {
      const text = escapeHtml((c?.descriptors || {})[l?.id] || '?');
      return `<td class="desc">${text}</td>`;
    }).join('');
    const maxPts = fmtNum(parseFloat(c?.maxPoints) || 0);
    const weight = fmtNum(parseFloat(c?.weightPct ?? c?.weight) || 0);
    return `<tr>
      <td class="criterion">${label}</td>
      ${descs}
      <td class="meta center">${maxPts}</td>
      <td class="meta center">${weight}</td>
    </tr>`;
  }).join('');
  const levelWidthRules = levels.map((_, i) => {
    const n = i + 2;
    return `th:nth-child(${n}),td:nth-child(${n}){width:${levelColsWidth};}`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
  <style>
    @page { margin: 6mm; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    html,body{margin:0;padding:0;background:#fff;color:#0f172a;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
    .sheet{width:100%;max-width:100%;margin:0 auto;border:1px solid ${theme.tableBorder};border-radius:10px;overflow:hidden;}
    .head{padding:10px 12px;background:${theme.headerBg};color:${theme.headerText||ieContrastText(theme.headerBg)};font-weight:800;font-size:20px;}
    table{width:100%;border-collapse:collapse;table-layout:fixed;}
    th,td{border-bottom:1px solid ${theme.tableBorder};padding:10px 12px;font-size:13px;line-height:1.35;white-space:normal;word-break:break-word;vertical-align:top;}
    th{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748b;background:${theme.rowAltBg};text-align:left;}
    th:nth-child(1),td:nth-child(1){width:${firstColWidth};}
    ${levelWidthRules}
    th:nth-last-child(2),td:nth-last-child(2),th:last-child,td:last-child{width:${metaColsWidth};}
    th.lvl{color:${theme.headerText||ieContrastText(theme.headerBg)};background:${theme.headerBg};}
    .criterion{font-weight:700;color:#334e73;}
    .desc{font-size:11.5px;color:#64748b;}
    .meta{background:${theme.metaColumnBg};}
    .center{text-align:center;vertical-align:middle;}
    tbody tr:nth-child(even) td:not(.meta){background:${theme.rowAltBg};}
    .obs{padding:10px 12px;background:${theme.rowBaseBg};}
    .obs label{font-weight:700;display:block;margin-bottom:4px;}
    .line{border-bottom:1px solid ${theme.tableBorder};height:22px;}
  </style>
  </head><body>
    <div class="sheet">
      <div class="head">${safeTitle}</div>
      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            ${headLevels}
            <th class="meta">Puntos del criterio</th>
            <th class="meta">Peso (%)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="obs">
        <label>Observaciones del docente</label>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
  </body></html>`;
}
// Abre la versión imprimible del instrumento en una pestaña nueva y dispara la impresión del navegador.
async function ieDownloadInstrumentPdf() {
  const preview = ieGetPreviewElement();
  if (!preview) { toast('No hay vista previa para exportar', true); return; }
  const name = ieExportBaseName();
  const d = INST_EDITOR.draft;
  const baseHtml = d?.type === 'rubrica_analitica'
    ? ieBuildRubricPrintHtml(d, name)
    : d?.type === 'lista_cotejo_a'
      ? ieBuildChecklistPrintHtml(d, name)
      : d?.type === 'lista_cotejo_b'
        ? ieBuildWeightedChecklistPrintHtml(d, name)
        : d?.type === 'escala_estimativa'
          ? ieBuildScalePrintHtml(d, name)
          : ieBuildExportHtml(name, iePrepareCloneForExport(ieCloneWithInlineStyles(preview)).outerHTML);
  const html = baseHtml.replace(
    '</body>',
    `<script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          try { window.focus(); window.print(); } catch (_) {}
        }, 180);
      });
    </script></body>`
  );
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    URL.revokeObjectURL(url);
    toast('Tu navegador bloqueó la ventana de impresión. Habilita pop-ups para este sitio.', true);
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
// Exporta la vista previa actual a un archivo .doc compatible con Word.
function ieDownloadInstrumentWord() {
  const preview = ieGetPreviewElement();
  if (!preview) { toast('No hay vista previa para exportar', true); return; }
  const name = ieExportBaseName();
  const clone = iePrepareCloneForExport(ieCloneWithInlineStyles(preview));
  const html = ieBuildExportHtml(name, clone.outerHTML, { mode: 'word' });
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name || 'instrumento'}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
// Carga un instrumento guardado en un editor temporal para reutilizar la misma lógica de exportación sin alterar el instrumento real.
async function ieDownloadInstrumentFromLibrary(instrumentId, format='pdf') {
  const inst = getInstrumentById(instrumentId);
  if (!inst) return;
  const realBody = document.getElementById('inst-editor-body');
  if (!realBody) { toast('No se pudo preparar la descarga', true); return; }
  const backup = {
    mode: INST_EDITOR.mode,
    draft: INST_EDITOR.draft ? JSON.parse(JSON.stringify(INST_EDITOR.draft)) : null,
    linkActivityId: INST_EDITOR.linkActivityId,
    openPanelId: INST_EDITOR.openPanelId,
    openAppearance: INST_EDITOR.openAppearance,
    _criteriaGapKey: INST_EDITOR._criteriaGapKey,
    invalidChecklistCriteria: new Set([...(INST_EDITOR.invalidChecklistCriteria || new Set())]),
    scaleMaxInputRaw: INST_EDITOR.scaleMaxInputRaw
  };
  const liveId = realBody.id;
  realBody.id = 'inst-editor-body-live';
  const tempBody = document.createElement('div');
  tempBody.id = 'inst-editor-body';
  tempBody.style.position = 'fixed';
  tempBody.style.left = '-10000px';
  tempBody.style.top = '0';
  tempBody.style.width = '1100px';
  tempBody.style.background = '#fff';
  document.body.appendChild(tempBody);
  try {
    INST_EDITOR.mode = 'edit';
    INST_EDITOR.linkActivityId = null;
    INST_EDITOR.draft = JSON.parse(JSON.stringify(inst));
    INST_EDITOR.openPanelId = null;
    INST_EDITOR.openAppearance = false;
    INST_EDITOR._criteriaGapKey = null;
    INST_EDITOR.invalidChecklistCriteria = new Set();
    INST_EDITOR.scaleMaxInputRaw = null;
    renderInstrumentEditor();
    if (format==='word') ieDownloadInstrumentWord();
    else await ieDownloadInstrumentPdf();
  } finally {
    tempBody.remove();
    realBody.id = liveId;
    INST_EDITOR.mode = backup.mode;
    INST_EDITOR.draft = backup.draft;
    INST_EDITOR.linkActivityId = backup.linkActivityId;
    INST_EDITOR.openPanelId = backup.openPanelId;
    INST_EDITOR.openAppearance = backup.openAppearance;
    INST_EDITOR._criteriaGapKey = backup._criteriaGapKey;
    INST_EDITOR.invalidChecklistCriteria = backup.invalidChecklistCriteria;
    INST_EDITOR.scaleMaxInputRaw = backup.scaleMaxInputRaw;
  }
}
// Cambia el curso/grupo del instrumento y vuelve a renderizar cuando el tipo depende del contexto académico.
function ieSetCourseId(vv) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  d.courseId = vv || null;
  if (d.type==='rubrica_analitica' || d.type==='lista_cotejo_a' || d.type==='lista_cotejo_b' || d.type==='escala_estimativa') renderInstrumentEditor();
}
// Cambia el período del instrumento para mantenerlo alineado con el calendario académico activo.
function ieSetPeriodId(vv) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  d.periodId = vv || S.activePeriodId || 'P1';
  if (d.type==='rubrica_analitica' || d.type==='lista_cotejo_a' || d.type==='lista_cotejo_b' || d.type==='escala_estimativa') renderInstrumentEditor();
}
// Cambia el año escolar de trabajo del instrumento sin perder el borrador actual.
function ieSetSchoolYear(vv) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  d.schoolYear = vv || (S.schoolYear?.name || '2025-2026');
  if (d.type==='rubrica_analitica' || d.type==='lista_cotejo_a' || d.type==='lista_cotejo_b' || d.type==='escala_estimativa') renderInstrumentEditor();
}
// Guarda el texto crudo del máximo de la escala mientras la persona sigue escribiendo.
function ieSetScaleMaxInputRaw(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  INST_EDITOR.scaleMaxInputRaw = vv;
}
// Confirma el máximo de la escala, lo valida y fuerza una normalización del borrador.
function ieCommitScaleMaxInput(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  const raw = String(vv ?? INST_EDITOR.scaleMaxInputRaw ?? '').trim();
  if (!raw) {
    INST_EDITOR.scaleMaxInputRaw = null;
    toast('El puntaje máximo no puede quedar vacío', true);
    renderInstrumentEditor();
    return;
  }
  const n = parseFloat(vv);
  if (!Number.isFinite(n) || n<=0) {
    INST_EDITOR.scaleMaxInputRaw = null;
    toast('El puntaje máximo debe ser mayor que 0', true);
    renderInstrumentEditor();
    return;
  }
  d.maxTotal = Math.max(0, n);
  d.maxScore = d.maxTotal;
  INST_EDITOR.scaleMaxInputRaw = null;
  normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Permite confirmar el máximo de la escala con Enter sin perder el foco del campo.
function ieHandleScaleMaxKey(ev, el) {
  if (!ev || ev.key!=='Enter') return;
  ev.preventDefault();
  ieCommitScaleMaxInput(el?.value ?? '');
}
// Actualiza el nombre de la actividad de la lista de cotejo simple y refresca la previsualización del título.
function ieSetChecklistActivityName(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  d.activityName = vv;
  d.name = composeInstrumentName('lista_cotejo_a', vv || '');
  const preview = document.getElementById('checklist-full-name-preview');
  if (preview) preview.textContent = d.name;
  ieRefreshChecklistPreview();
}
// Reconstruye la vista previa de la lista de cotejo simple con el título, los criterios y el bloque de observaciones.
function ieRefreshChecklistPreview() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  const tri = d.checklistMode === 'trichotomic';
  const total = parseFloat(d.maxTotal ?? d.maxScore) || 0;
  const checklistTheme = ieResolveChecklistTheme(d);
  const title = document.getElementById('checklist-preview-title');
  if (title) title.textContent = d.name || composeInstrumentName('lista_cotejo_a', '');
  const summary = document.getElementById('checklist-preview-summary');
  if (summary) summary.textContent = `${(d.criteria||[]).length} criterios ? ${fmtNum(round2(total))} puntos totales`;
  const rows = document.getElementById('checklist-preview-criteria');
  if (rows) {
    rows.innerHTML = `<div style="overflow-x:auto;">
      <table class="tbl" style="border-color:${checklistTheme.tableBorder};">
        <thead>
          <tr>
            <th style="background:${checklistTheme.metaColumnBg};">Criterio</th>
            <th style="color:${checklistTheme.yesColor};">Cumple</th>
            ${tri?`<th style="color:${checklistTheme.partialColor};">Parcial</th>`:''}
            <th style="color:${checklistTheme.noColor};">No cumple</th>
          </tr>
        </thead>
        <tbody>
          ${(d.criteria||[]).map((c, idx)=>`<tr style="background:${idx%2?checklistTheme.rowAltBg:checklistTheme.rowBaseBg};">
            <td style="font-weight:700;">${idx+1}. ${c.label||c.name||`Criterio ${idx+1}`}</td>
            <td style="text-align:center;font-size:16px;">✓</td>
            ${tri?`<td style="text-align:center;font-size:16px;">~</td>`:''}
            <td style="text-align:center;font-size:16px;">✕</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:10px;">
      <label style="font-weight:700;display:block;margin-bottom:4px;">Observaciones del docente</label>
      <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
      <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
      <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
      <div style="border-bottom:1px solid ${checklistTheme.tableBorder};height:22px;"></div>
    </div>`;
  }
}
// Cambia entre valores automáticos y manuales en la lista de cotejo simple.
function ieSetChecklistValueMode(mode) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  d.checklistValueMode = mode === 'manual' ? 'manual' : 'auto';
  normalizeChecklistDraft(d);
  renderInstrumentEditor();
}
// Restaura los valores automáticos por defecto para la lista de cotejo simple.
function ieResetChecklistAutoValues() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  d.checklistValueMode = 'auto';
  normalizeChecklistDraft(d);
  renderInstrumentEditor();
}
// Ajusta el valor numérico de un estado de la lista simple cuando la edición manual está activa.
function ieSetChecklistPoint(kind, vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  if (d.checklistValueMode!=='manual') return;
  if (!d.checklistPoints || typeof d.checklistPoints!=='object') d.checklistPoints = {};
  if (String(vv).trim()==='') {
    d.checklistPoints[kind] = 0;
  } else {
    const n = parseFloat(vv);
    d.checklistPoints[kind] = Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  normalizeChecklistDraft(d);
  renderInstrumentEditor();
}
// Mantiene compatibilidad con el nombre antiguo del setter de valores de lista de cotejo.
function ieSetChecklistFactor(kind, vv) {
  ieSetChecklistPoint(kind, vv);
}
// Resuelve la paleta visual de listas de cotejo, reutilizando la plantilla elegida o una versión personalizada.
function ieResolveChecklistTheme(d) {
  const t = RUBRIC_APPEARANCE_TEMPLATES[d?.appearanceTemplate || 'academic'] || RUBRIC_APPEARANCE_TEMPLATES.academic;
  const src = (d && d.appearanceTheme) ? d.appearanceTheme : {};
  const fallback = t.theme || RUBRIC_APPEARANCE_TEMPLATES.academic.theme;
  const statusDefaults = ['#16A34A','#EAB308','#DC2626'];
  return {
    headerBg: ieNormalizeHexColor(src.headerBg || fallback.headerBg, fallback.headerBg),
    headerText: src.headerText || ieContrastText(src.headerBg || fallback.headerBg),
    tableBorder: ieNormalizeHexColor(src.tableBorder || fallback.tableBorder, fallback.tableBorder),
    rowAltBg: ieNormalizeHexColor(src.rowAltBg || fallback.rowAltBg, fallback.rowAltBg),
    rowBaseBg: ieNormalizeHexColor(src.rowBaseBg || fallback.rowBaseBg, fallback.rowBaseBg),
    metaColumnBg: ieNormalizeHexColor(src.metaColumnBg || fallback.metaColumnBg, fallback.metaColumnBg),
    yesColor: ieNormalizeHexColor(src.checkYesColor || statusDefaults[0], statusDefaults[0]),
    partialColor: ieNormalizeHexColor(src.checkPartialColor || statusDefaults[1], statusDefaults[1]),
    noColor: ieNormalizeHexColor(src.checkNoColor || statusDefaults[2], statusDefaults[2]),
  };
}
// Cambia la lista de cotejo simple entre modo dicotómico y tricotómico.
function ieSetChecklistMode(mode) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  d.checklistMode = mode === 'trichotomic' ? 'trichotomic' : 'dichotomic';
  normalizeChecklistDraft(d);
  renderInstrumentEditor();
}
// Ajusta el porcentaje o valor asociado al estado parcial de la lista de cotejo.
function ieSetChecklistPartialValue(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  const n = parseFloat(vv);
  d.partialValue = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5;
}
// Abre o cierra un bloque tipo acordeón dentro del editor de instrumentos.
function ieToggleAccordion(key) {
  INST_EDITOR.openPanelId = (INST_EDITOR.openPanelId === key) ? null : key;
  renderInstrumentEditor();
}
// Evita que ciertos eventos dentro del acordeón repliquen el cierre o cambien la sección activa.
function ieStopAccordionEvent(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
}
// Cambia el puntaje máximo del instrumento y recalcula los derivados que dependen de ese total.
function ieSetMax(vv){
  if (String(vv).trim()==='') {
    INST_EDITOR.draft.maxScore = '';
    INST_EDITOR.draft.maxTotal = '';
    if (INST_EDITOR.draft?.type==='lista_cotejo_a') {
      normalizeChecklistDraft(INST_EDITOR.draft);
      INST_EDITOR.draft.maxScore = '';
      INST_EDITOR.draft.maxTotal = '';
      ieRefreshChecklistPreview();
      return;
    }
  }
  const n = parseFloat(vv)||20;
  INST_EDITOR.draft.maxScore = n;
  INST_EDITOR.draft.maxTotal = n;
  if (INST_EDITOR.draft?.type==='lista_cotejo_a') {
    normalizeChecklistDraft(INST_EDITOR.draft);
    renderInstrumentEditor();
    return;
  }
  if (INST_EDITOR.draft?.type==='lista_cotejo_b') {
    normalizeWeightedChecklistDraft(INST_EDITOR.draft);
    ieAutoAdjustWeightedChecklistPoints();
    renderInstrumentEditor();
    return;
  }
  if (INST_EDITOR.draft?.type==='rubrica_analitica') {
    ieCheckCriteriaPointsBudget(false);
  }
}
// Cambia el puntaje máximo de la lista ponderada manteniendo la edición abierta.
function ieSetWeightedMaxInput(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_b') return;
  if (String(vv).trim()==='') {
    d.maxTotal = '';
    d.maxScore = '';
    renderInstrumentEditor();
    return;
  }
  const n = parseFloat(vv);
  d.maxTotal = Number.isFinite(n) ? n : 0;
  d.maxScore = d.maxTotal;
  normalizeWeightedChecklistDraft(d);
  ieAutoAdjustWeightedChecklistPoints();
  renderInstrumentEditor();
}
// Recalcula automáticamente los puntos de la lista ponderada a partir del total del instrumento.
function ieAutoAdjustWeightedFromTotal() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_b') return;
  normalizeWeightedChecklistDraft(d);
  ieAutoAdjustWeightedChecklistPoints();
  renderInstrumentEditor();
}
// Cambia el máximo de la lista simple y vuelve a normalizar sus valores derivados.
function ieSetChecklistMaxInput(vv) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  if (String(vv).trim()==='') {
    d.maxTotal = '';
    d.maxScore = '';
    ieRefreshChecklistPreview();
    return;
  }
  const n = parseFloat(vv);
  d.maxTotal = Number.isFinite(n) ? n : '';
  d.maxScore = d.maxTotal;
  normalizeChecklistDraft(d);
  renderInstrumentEditor();
}
// Genera una secuencia de factores descendentes para niveles de desempeño, respetando un mínimo permitido.
function computeLevelFactors(count, minFactor=0) {
  const n = Math.max(2, Math.min(6, parseInt(count,10) || 4));
  const min = Math.max(0, Math.min(1, parseFloat(minFactor) || 0));
  const step = (1 - min) / (n - 1);
  const out = [];
  for (let i=0;i<n;i++) {
    let v = 1 - (i * step);
    if (i===0) v = 1;
    if (i===n-1) v = min;
    out.push(parseFloat(v.toFixed(10)));
  }
  return out;
}
// Alias semántico para reutilizar la misma secuencia de niveles en otras partes del editor.
function ieComputeLevelFactors(count, minFactor=0) {
  return computeLevelFactors(count, minFactor);
}
// Decide el factor mínimo recomendado según la cantidad de niveles disponibles.
function ieAutoAdjustMinFactorForCount(count) {
  const n = Math.max(2, Math.min(6, parseInt(count, 10) || 4));
  return n === 4 ? 0.25 : 0;
}
// Convierte el factor de un nivel en el formato corto que se muestra dentro de un input numérico.
function ieFormatLevelFactorForInput(v) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(2);
}
// Comprueba que los niveles de la rúbrica tengan valores válidos y que la secuencia tenga sentido para evaluación.
function ieValidateLevels(draft, showToast=true) {
  const d = draft || INST_EDITOR.draft;
  const levels = d?.levels || [];
  const invalidIds = [];
  if (!levels.length) {
    if (showToast) toast('Debes tener al menos un nivel', true);
    return {ok:false, invalidIds, message:'Debes tener al menos un nivel'};
  }
  const vals = levels.map(l=>{
    const n = parseFloat(l.valueFactor ?? l.factor);
    if (!Number.isFinite(n)) invalidIds.push(l.id);
    return n;
  });
  if (invalidIds.length) {
    const msg = 'Define el valor del nivel (0 a 1) o usa Autoajustar';
    if (showToast) toast(msg, true);
    return {ok:false, invalidIds, message:msg};
  }
  for (let i=0;i<vals.length;i++) {
    if (vals[i] < 0 || vals[i] > 1) invalidIds.push(levels[i].id);
  }
  if (invalidIds.length) {
    const msg = 'Valor inválido: cada factor debe estar entre 0 y 1';
    if (showToast) toast(msg, true);
    return {ok:false, invalidIds, message:msg};
  }
  const allEq = vals.every(v=>round2(v)===round2(vals[0]));
  if (allEq) {
    const msg = 'Los factores no pueden ser todos iguales';
    if (showToast) toast(msg, true);
    return {ok:false, invalidIds:levels.map(l=>l.id), message:msg};
  }
  return {ok:true, invalidIds:[], message:''};
}
// Activa o desactiva el autoajuste de niveles de la rúbrica.
function ieToggleAutoAdjustLevels(checked) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='rubrica_analitica') return;
  d.autoAdjustLevels = !!checked;
  if (d.autoAdjustLevels) ieAutoAdjustLevels();
}
// Normaliza un color hexadecimal para evitar valores incompletos o inválidos en la paleta del editor.
function ieNormalizeHexColor(hex, fallback='#1E3A8A') {
  const s = String(hex||'').trim();
  return /^#[0-9A-Fa-f]{6}$/.test(s) ? s : fallback;
}
// Calcula un color de texto contrastante para que se lea bien sobre el color de fondo recibido.
function ieContrastText(hex) {
  const h = ieNormalizeHexColor(hex, '#1E3A8A').slice(1);
  const r = parseInt(h.slice(0,2),16) / 255;
  const g = parseInt(h.slice(2,4),16) / 255;
  const b = parseInt(h.slice(4,6),16) / 255;
  // Gestiona to lin.
  const toLin = (c)=> c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  const lum = (0.2126*toLin(r)) + (0.7152*toLin(g)) + (0.0722*toLin(b));
  return lum < 0.5 ? '#FFFFFF' : '#111827';
}
// Devuelve un color por defecto para un nivel cuando la plantilla visual no tiene una asignación explícita.
function ieDefaultLevelColor(theme, idx=0) {
  const arr = Array.isArray(theme?.levelColors) && theme.levelColors.length ? theme.levelColors : ['#2563EB','#16A34A','#D97706','#DC2626'];
  return ieNormalizeHexColor(arr[idx % arr.length], '#2563EB');
}
// Sincroniza los colores de los niveles por ID para que no se pierdan al cambiar el orden o el número de niveles.
function ieSyncAppearanceLevelColorsById(d) {
  if (!d || !Array.isArray(d.levels)) return;
  if (!d.appearanceTheme || typeof d.appearanceTheme!=='object') d.appearanceTheme = {};
  const t = RUBRIC_APPEARANCE_TEMPLATES[d.appearanceTemplate || 'academic'] || RUBRIC_APPEARANCE_TEMPLATES.academic;
  const base = t.theme || RUBRIC_APPEARANCE_TEMPLATES.academic.theme;
  const legacyArr = Array.isArray(d.appearanceTheme.levelColors) ? d.appearanceTheme.levelColors : [];
  const byId = (d.appearanceTheme.levelColorsById && typeof d.appearanceTheme.levelColorsById==='object')
    ? {...d.appearanceTheme.levelColorsById}
    : {};
  d.levels.forEach((lv, idx)=>{
    const cur = byId[lv.id] || legacyArr[idx] || ieDefaultLevelColor(base, idx);
    byId[lv.id] = ieNormalizeHexColor(cur, ieDefaultLevelColor(base, idx));
  });
  Object.keys(byId).forEach(k=>{
    if (!d.levels.some(l=>l.id===k)) delete byId[k];
  });
  d.appearanceTheme.levelColorsById = byId;
  delete d.appearanceTheme.levelColors;
}
// Resuelve la paleta completa de la apariencia de la rúbrica, combinando plantilla, colores personalizados y niveles.
function ieResolveAppearanceTheme(d) {
  const t = RUBRIC_APPEARANCE_TEMPLATES[d?.appearanceTemplate || 'academic'] || RUBRIC_APPEARANCE_TEMPLATES.academic;
  const src = (d && d.appearanceTheme) ? d.appearanceTheme : {};
  const fallback = t.theme || RUBRIC_APPEARANCE_TEMPLATES.academic.theme;
  if (d) ieSyncAppearanceLevelColorsById(d);
  const byId = (d?.appearanceTheme?.levelColorsById && typeof d.appearanceTheme.levelColorsById==='object')
    ? d.appearanceTheme.levelColorsById
    : {};
  return {
    headerBg: ieNormalizeHexColor(src.headerBg || fallback.headerBg, fallback.headerBg),
    headerText: src.headerText || ieContrastText(src.headerBg || fallback.headerBg),
    tableBorder: ieNormalizeHexColor(src.tableBorder || fallback.tableBorder, fallback.tableBorder),
    rowAltBg: ieNormalizeHexColor(src.rowAltBg || fallback.rowAltBg, fallback.rowAltBg),
    rowBaseBg: ieNormalizeHexColor(src.rowBaseBg || fallback.rowBaseBg, fallback.rowBaseBg),
    metaColumnBg: ieNormalizeHexColor(src.metaColumnBg || fallback.metaColumnBg, fallback.metaColumnBg),
    levelColorsById: byId,
    levelFallback: fallback.levelColors || ['#2563EB','#16A34A','#D97706','#DC2626']
  };
}
// Obtiene el color concreto de un nivel, priorizando el mapa por ID y luego la paleta de respaldo.
function ieGetLevelColorById(theme, levelId, idx=0) {
  const fromId = theme?.levelColorsById?.[levelId];
  if (fromId) return fromId;
  const arr = Array.isArray(theme?.levelFallback) && theme.levelFallback.length ? theme.levelFallback : ['#2563EB','#16A34A','#D97706','#DC2626'];
  return ieNormalizeHexColor(arr[idx % arr.length], '#2563EB');
}
// Construye el estilo inline del encabezado de un nivel para la tabla de la rúbrica.
function ieLevelHeaderStyle(theme, levelId, idx) {
  const bg = ieGetLevelColorById(theme, levelId, idx);
  return `background:${bg};color:${ieContrastText(bg)};`;
}
// Abre o cierra el panel de personalización visual del instrumento.
function ieToggleAppearancePanel() {
  INST_EDITOR.openAppearance = !INST_EDITOR.openAppearance;
  renderInstrumentEditor();
}
// Cambia la plantilla visual del instrumento y restablece o conserva los colores según corresponda.
function ieSetAppearanceTemplate(mode) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  const current = ieResolveAppearanceTheme(d);
  d.appearanceTemplate = mode || 'academic';
  const tpl = RUBRIC_APPEARANCE_TEMPLATES[d.appearanceTemplate] || RUBRIC_APPEARANCE_TEMPLATES.academic;
  d.appearanceTheme = d.appearanceTemplate==='custom' ? {...current} : {...tpl.theme};
  d.appearanceTheme.headerText = ieContrastText(d.appearanceTheme.headerBg);
  if (d.appearanceTemplate==='print') {
    d.forceBWOnPrint = true;
    d.useColorsOnPrint = false;
  } else {
    d.forceBWOnPrint = false;
    d.useColorsOnPrint = true;
  }
  renderInstrumentEditor();
}
// Cambia un color global de la apariencia personalizada del instrumento.
function ieSetAppearanceColor(key, color) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  const currentTheme = ieResolveAppearanceTheme(d);
  d.appearanceTemplate = 'custom';
  if (!d.appearanceTheme || typeof d.appearanceTheme!=='object') d.appearanceTheme = {...currentTheme};
  const current = d.appearanceTheme[key] || RUBRIC_APPEARANCE_TEMPLATES.custom.theme[key] || '#1E3A8A';
  d.appearanceTheme[key] = ieNormalizeHexColor(color, current);
  if (key==='headerBg') d.appearanceTheme.headerText = ieContrastText(d.appearanceTheme.headerBg);
  renderInstrumentEditor();
}
// Cambia el color de un estado puntual de la lista de cotejo simple.
function ieSetChecklistStatusColor(key, color) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='lista_cotejo_a') return;
  const t = ieResolveChecklistTheme(d);
  d.appearanceTemplate = 'custom';
  if (!d.appearanceTheme || typeof d.appearanceTheme!=='object') d.appearanceTheme = {};
  const fb = key==='checkYesColor' ? t.yesColor : (key==='checkPartialColor' ? t.partialColor : t.noColor);
  d.appearanceTheme[key] = ieNormalizeHexColor(color, fb);
  renderInstrumentEditor();
}
// Cambia el color individual de un nivel de rúbrica identificado por su ID.
function ieSetAppearanceLevelColor(levelId, color) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  const currentTheme = ieResolveAppearanceTheme(d);
  d.appearanceTemplate = 'custom';
  if (!d.appearanceTheme || typeof d.appearanceTheme!=='object') d.appearanceTheme = {...currentTheme};
  if (!d.appearanceTheme.levelColorsById || typeof d.appearanceTheme.levelColorsById!=='object') d.appearanceTheme.levelColorsById = {...(currentTheme.levelColorsById||{})};
  const idx = Math.max(0, (d.levels||[]).findIndex(l=>l.id===levelId));
  const cur = d.appearanceTheme.levelColorsById[levelId] || ieGetLevelColorById(currentTheme, levelId, idx);
  d.appearanceTheme.levelColorsById[levelId] = ieNormalizeHexColor(color, cur);
  renderInstrumentEditor();
}
// Activa o desactiva opciones de impresión como blanco y negro o impresión a color.
function ieSetPrintOption(kind, checked) {
  const d = INST_EDITOR.draft;
  if (!d) return;
  if (kind==='bw') {
    d.forceBWOnPrint = !!checked;
    if (d.forceBWOnPrint) d.useColorsOnPrint = false;
  }
  if (kind==='colors') {
    d.useColorsOnPrint = !!checked;
    if (d.useColorsOnPrint) d.forceBWOnPrint = false;
  }
  renderInstrumentEditor();
}
// Cambia la cantidad de niveles o escalones usados por la plantilla activa del instrumento.
function ieChangeLevels(vv){
  INST_EDITOR.draft.levelsCount = Math.max(2,Math.min(6,parseInt(vv)||4));
  INST_EDITOR.draft.levels = (INST_EDITOR.draft.type==='rubrica_analitica')
    ? defaultRubricLevels(INST_EDITOR.draft.levelsCount)
    : defaultLevelsForType(INST_EDITOR.draft.type, INST_EDITOR.draft.levelsCount);
  if (INST_EDITOR.draft.type==='rubrica_analitica') {
    INST_EDITOR.draft.criteria = normalizeRubricCriteria(INST_EDITOR.draft.criteria, INST_EDITOR.draft.levels);
  }
  renderInstrumentEditor();
}
// Cambia el tipo de instrumento dentro del editor, regenerando la estructura base asociada.
function ieChangeType(type){
  if (!isBasicInstrumentType(type)) {
    toast('Solo se permiten los 4 tipos básicos en esta versión', true);
    return;
  }
  const d = INST_EDITOR.draft;
  d.type = type;
  d.levels = type==='rubrica_analitica'
    ? defaultRubricLevels(d.levelsCount||4)
    : defaultLevelsForType(type, d.levelsCount||4);
  d.criteria = defaultCriteriaForType(type, parseInt(d.maxScore)||20);
  if (type==='rubrica_analitica') d.criteria = normalizeRubricCriteria(d.criteria, d.levels);
  renderInstrumentEditor();
}
// Agrega un criterio nuevo al borrador del instrumento usando valores iniciales coherentes con el tipo actual.
function ieAddCriterion(){
  const d = INST_EDITOR.draft;
  const next = {id:uid(), name:`Criterio ${d.criteria.length+1}`, label:`Criterio ${d.criteria.length+1}`, maxPoints:Math.max(1,Math.round((d.maxScore||20)/Math.max(d.criteria.length+1,1))), weightPct:0, weight:0, order:d.criteria.length+1, descriptors:{}};
  if (d.type==='rubrica_analitica') (d.levels||[]).forEach(l=>next.descriptors[l.id]='');
  d.criteria.push(next);
  if (d.type==='lista_cotejo_a') normalizeChecklistDraft(d);
  if (d.type==='lista_cotejo_b') { normalizeWeightedChecklistDraft(d); ieAutoAdjustWeightedChecklistPoints(); }
  if (d.type==='escala_estimativa') normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Edita un campo específico de un criterio y, si hace falta, recalcula pesos o totales relacionados.
function ieSetCriterion(cid, field, value, inputEl){
  const c = INST_EDITOR.draft.criteria.find(x=>x.id===cid);
  if(!c) return;
  if (field==='name' || field==='label') {
    c.label = value;
    c.name = value;
    if (INST_EDITOR.invalidChecklistCriteria?.has?.(cid)) INST_EDITOR.invalidChecklistCriteria.delete(cid);
    if (INST_EDITOR.draft?.type==='lista_cotejo_a') ieRefreshChecklistPreview();
  } else {
    const prev = parseFloat(c[field]) || 0;
    c[field] = (parseFloat(value)||0);
    if (field==='maxPoints' && INST_EDITOR.draft?.type==='rubrica_analitica') {
      c.maxPoints = Math.max(0, c.maxPoints);
      const budgetOk = ieCheckCriteriaPointsBudget(true);
      if (!budgetOk) {
        c.maxPoints = prev;
        if (inputEl) inputEl.value = fmtNum(prev);
      } else {
        ieRecalcWeightsFromPoints(true);
      }
    }
    if (field==='weightPct') c.weight = c.weightPct;
  }
}
// Guarda el descriptor textual de un criterio para un nivel específico de la rúbrica.
function ieSetDescriptor(cid, levelId, value){
  const c = INST_EDITOR.draft.criteria.find(x=>x.id===cid);
  if(!c) return;
  if (!c.descriptors || typeof c.descriptors!=='object') c.descriptors = {};
  c.descriptors[levelId] = value;
}
// Cambia el nombre o el factor numérico de un nivel de desempeño.
function ieSetLevel(levelId, field, value){
  const l = (INST_EDITOR.draft.levels||[]).find(x=>x.id===levelId);
  if(!l) return;
  if (field==='label') l.label = value;
  else {
    if (String(value).trim()==='') {
      l.valueFactor = null;
      l.factor = null;
      return;
    }
    const n = parseFloat(value);
    if (!Number.isFinite(n)) {
      l.valueFactor = null;
      l.factor = null;
      return;
    }
    let fixed = n;
    if (fixed<0 || fixed>1) {
      fixed = Math.max(0, Math.min(1, fixed));
      toast('Valor inválido: debe estar entre 0 y 1', true);
    }
    l.valueFactor = fixed;
    l.factor = l.valueFactor;
  }
}
// Agrega un nuevo nivel a la escala estimativa y vuelve a normalizar su estructura.
function ieAddScaleLevel() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  d.levels.push({id:uid(), label:`Nivel ${(d.levels||[]).length+1}`, value:0});
  normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Elimina un nivel de la escala estimativa, preservando un mínimo funcional.
function ieDelScaleLevel(levelId) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  if ((d.levels||[]).length<=2) return;
  d.levels = (d.levels||[]).filter(l=>l.id!==levelId);
  normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Edita un campo de la escala estimativa y vuelve a recalcular su estructura derivada.
function ieSetScaleLevel(levelId, field, value) {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='escala_estimativa') return;
  const l = (d.levels||[]).find(x=>x.id===levelId);
  if (!l) return;
  if (field==='label') l.label = value;
  if (field==='value') l.value = Math.max(0, parseFloat(value)||0);
  normalizeEstimativeDraft(d);
  renderInstrumentEditor();
}
// Recalcula automáticamente los factores de la rúbrica para repartir los niveles de forma coherente.
function ieAutoAdjustLevels() {
  const d = INST_EDITOR.draft;
  if (!d || d.type!=='rubrica_analitica') return;
  const levels = d.levels || [];
  const n = levels.length;
  if (!n) return;
  const factors = computeLevelFactors(n, ieAutoAdjustMinFactorForCount(n));
  levels.forEach((l, idx)=>{
    const v = factors[idx];
    l.valueFactor = Math.max(0, Math.min(1, v));
    l.factor = l.valueFactor;
  });
  renderInstrumentEditor();
}
// Reparte automáticamente los puntos de los criterios según el total objetivo del instrumento.
function ieAutoAdjustCriteriaPoints() {
  const d = INST_EDITOR.draft;
  if (!d || !Array.isArray(d.criteria) || d.criteria.length===0) return;
  const m = d.criteria.length;
  const maxTotal = Math.max(0, parseFloat(d.maxTotal ?? d.maxScore) || 0);
  const integerTotal = Number.isInteger(maxTotal);
  if (integerTotal) {
    const base = Math.floor(maxTotal / m);
    const remainder = maxTotal - (base * m);
    d.criteria.forEach((c, idx)=>{
      c.maxPoints = base + (idx < remainder ? 1 : 0);
    });
  } else {
    const even = round2(maxTotal / m);
    d.criteria.forEach(c=>{ c.maxPoints = even; });
    const sum = round2(d.criteria.reduce((s,c)=>s + (parseFloat(c.maxPoints)||0),0));
    const diff = round2(maxTotal - sum);
    if (d.criteria[0]) d.criteria[0].maxPoints = round2((parseFloat(d.criteria[0].maxPoints)||0) + diff);
  }
  ieRecalcWeightsFromPoints(false);
  ieCheckCriteriaPointsBudget(false);
  renderInstrumentEditor();
}
// Refresca los inputs de peso para que reflejen el cálculo actual de la rúbrica en pantalla.
function ieRefreshCriteriaWeightInputs() {
  const d = INST_EDITOR.draft;
  if (!d || !Array.isArray(d.criteria)) return;
  d.criteria.forEach(c=>{
    const v = fmtNum(parseFloat(c.weightPct ?? c.weight) || 0);
    const a = document.querySelector(`[data-focus-id="crt-${c.id}-weight"]`);
    if (a) a.value = v;
    const b = document.querySelector(`[data-focus-id="inst-crt-${c.id}-weight"]`);
    if (b) b.value = v;
  });
}
// Recalcula los pesos porcentuales de la rúbrica a partir de los puntos asignados a cada criterio.
function ieRecalcWeightsFromPoints(updateUI=true) {
  const d = INST_EDITOR.draft;
  if (!d || !Array.isArray(d.criteria) || d.criteria.length===0) return;
  const vals = d.criteria.map(c=>Math.max(0, parseFloat(c.maxPoints) || 0));
  const totalPoints = round2(vals.reduce((s,v)=>s+v,0));
  if (totalPoints<=0) {
    d.criteria.forEach(c=>{ c.weightPct = 0; c.weight = 0; });
    if (updateUI) ieRefreshCriteriaWeightInputs();
    return;
  }
  let sumPrev = 0;
  const lastIdx = d.criteria.length - 1;
  d.criteria.forEach((c, idx)=>{
    if (idx===lastIdx) return;
    const w = round2((vals[idx] / totalPoints) * 100);
    c.weightPct = w;
    c.weight = w;
    sumPrev = round2(sumPrev + w);
  });
  let lastWeight = round2(100 - sumPrev);
  if (lastWeight < 0) {
    let overflow = round2(-lastWeight);
    lastWeight = 0;
    for (let i = lastIdx - 1; i >= 0 && overflow > 0; i--) {
      const cur = parseFloat(d.criteria[i].weightPct) || 0;
      const dec = Math.min(cur, overflow);
      d.criteria[i].weightPct = round2(cur - dec);
      d.criteria[i].weight = d.criteria[i].weightPct;
      overflow = round2(overflow - dec);
    }
  }
  d.criteria[lastIdx].weightPct = round2(lastWeight);
  d.criteria[lastIdx].weight = d.criteria[lastIdx].weightPct;
  const finalSum = round2(d.criteria.reduce((s,c)=>s + (parseFloat(c.weightPct)||0),0));
  const fix = round2(100 - finalSum);
  if (fix !== 0) {
    d.criteria[lastIdx].weightPct = round2((parseFloat(d.criteria[lastIdx].weightPct)||0) + fix);
    d.criteria[lastIdx].weight = d.criteria[lastIdx].weightPct;
  }
  if (updateUI) ieRefreshCriteriaWeightInputs();
}
// Verifica que la suma de puntos de los criterios no supere el total objetivo del instrumento.
function ieCheckCriteriaPointsBudget(showWarning=true){
  const d = INST_EDITOR.draft;
  if (!d || !Array.isArray(d.criteria)) return true;
  const maxTotal = round2(Math.max(0, parseFloat(d.maxTotal ?? d.maxScore) || 0));
  const sumTotal = round2(d.criteria.reduce((s,c)=>s + (parseFloat(c.maxPoints)||0),0));
  if (sumTotal > maxTotal) {
    toast(`No se puede: la suma de criterios excede el total (${fmtNum(maxTotal)} pts).`, true);
    INST_EDITOR._criteriaGapKey = null;
    return false;
  }
  const missing = round2(maxTotal - sumTotal);
  if (showWarning && missing > 0) {
    const gapKey = `${maxTotal}:${missing}`;
    if (INST_EDITOR._criteriaGapKey !== gapKey) {
      toast(`Atención: faltan ${fmtNum(missing)} puntos para completar el total (${fmtNum(maxTotal)} pts). Usa Autoajustar puntajes.`, 'warn');
      INST_EDITOR._criteriaGapKey = gapKey;
    }
  } else if (missing<=0) {
    INST_EDITOR._criteriaGapKey = null;
  }
  return true;
}
// Agrega un nivel nuevo a la rúbrica analítica y, si corresponde, autoajusta sus factores.
function ieAddLevel(){
  const d = INST_EDITOR.draft;
  if (d.type!=='rubrica_analitica') return;
  if ((d.levels||[]).length>=6) { toast('Máximo 6 niveles', true); return; }
  d.levels.push({id:uid(), label:`Nivel ${(d.levels||[]).length+1}`, valueFactor:null, factor:null});
  d.levelsCount = d.levels.length;
  if (d.autoAdjustLevels!==false) {
    const factors = computeLevelFactors(d.levels.length, ieAutoAdjustMinFactorForCount(d.levels.length));
    d.levels.forEach((lv, idx)=>{ lv.valueFactor = factors[idx]; lv.factor = factors[idx]; });
  } else {
    toast('Define el valor del nivel (0 a 1) o usa Autoajustar', 'warn');
  }
  d.criteria = normalizeRubricCriteria(d.criteria, d.levels);
  renderInstrumentEditor();
}
// Elimina un nivel de la rúbrica analítica y renormaliza la matriz de descriptores.
function ieDelLevel(levelId){
  const d = INST_EDITOR.draft;
  if (d.type!=='rubrica_analitica') return;
  if ((d.levels||[]).length<=2) return;
  d.levels = d.levels.filter(x=>x.id!==levelId);
  d.levelsCount = d.levels.length;
  if (d.autoAdjustLevels!==false) {
    const factors = computeLevelFactors(d.levels.length, ieAutoAdjustMinFactorForCount(d.levels.length));
    d.levels.forEach((lv, idx)=>{ lv.valueFactor = factors[idx]; lv.factor = factors[idx]; });
  }
  d.criteria = normalizeRubricCriteria(d.criteria, d.levels);
  renderInstrumentEditor();
}
// Reordena un criterio dentro de la lista moviéndolo una posición hacia arriba o abajo.
function ieMoveCriterion(cid, dir){
  const arr = INST_EDITOR.draft.criteria;
  const i = arr.findIndex(x=>x.id===cid);
  if(i<0) return;
  const j = i + dir;
  if(j<0||j>=arr.length) return;
  const tmp = arr[i]; arr[i]=arr[j]; arr[j]=tmp;
  arr.forEach((c,idx)=>c.order = idx+1);
  renderInstrumentEditor();
}
// Elimina un criterio y asegura que el instrumento siga teniendo al menos un criterio válido.
function ieDelCriterion(cid){
  INST_EDITOR.draft.criteria = INST_EDITOR.draft.criteria.filter(x=>x.id!==cid);
  if (INST_EDITOR.draft?.type==='lista_cotejo_a') {
    if (INST_EDITOR.invalidChecklistCriteria?.has?.(cid)) INST_EDITOR.invalidChecklistCriteria.delete(cid);
    normalizeChecklistDraft(INST_EDITOR.draft);
    renderInstrumentEditor();
    return;
  }
  if (INST_EDITOR.draft?.type==='lista_cotejo_b') {
    if (INST_EDITOR.draft.criteria.length===0) {
      ieAddCriterion();
      return;
    }
    normalizeWeightedChecklistDraft(INST_EDITOR.draft);
    ieAutoAdjustWeightedChecklistPoints();
    renderInstrumentEditor();
    return;
  }
  if (INST_EDITOR.draft?.type==='escala_estimativa') {
    if (INST_EDITOR.draft.criteria.length===0) {
      ieAddCriterion();
      return;
    }
    normalizeEstimativeDraft(INST_EDITOR.draft);
    renderInstrumentEditor();
    return;
  }
  if(INST_EDITOR.draft.criteria.length===0) ieAddCriterion();
  else renderInstrumentEditor();
}

// Valida el borrador completo del instrumento, lo guarda y, si corresponde, lo vincula con la actividad origen.
function saveInstrumentEditor(andLink=false) {
  // Valida, guarda y opcionalmente vincula el instrumento actual a una actividad del flujo de origen.
  const d = INST_EDITOR.draft;
  INST_EDITOR.invalidChecklistCriteria = new Set();
  if (d?.type==='lista_cotejo_a') {
    normalizeChecklistDraft(d);
    if (!d.courseId) { toast('Debes seleccionar el curso o grado del instrumento', true); return; }
    const total = parseFloat(d.maxTotal ?? d.maxScore) || 0;
    if (total<=0) { toast('El puntaje máximo debe ser mayor que 0', true); return; }
    if (!Array.isArray(d.criteria) || d.criteria.length===0) { toast('Debes agregar al menos un criterio', true); return; }
    const invalid = (d.criteria||[])
      .filter(c=>!(c.label||c.name||'').trim())
      .map(c=>c.id);
    if (invalid.length) {
      INST_EDITOR.invalidChecklistCriteria = new Set(invalid);
      renderInstrumentEditor();
      toast('Hay criterios vacíos. Completa los campos marcados en rojo', true);
      return;
    }
    const valueCheck = validateChecklistPoints(d);
    if (valueCheck.severe) {
      toast(`${valueCheck.severeMessage}`, true);
      return;
    }
    d.activityName = stripInstrumentNamePrefix('lista_cotejo_a', d.activityName || d.name || '');
    d.name = composeInstrumentName('lista_cotejo_a', d.activityName || '');
  } else if (d?.type==='rubrica_analitica') {
    d.name = composeInstrumentName('rubrica_analitica', d.name || '');
  } else if (d?.type==='lista_cotejo_b') {
    normalizeWeightedChecklistDraft(d);
    if (!d.courseId) { toast('Debes seleccionar el curso del instrumento', true); return; }
    d.name = composeInstrumentName('lista_cotejo_b', d.name || '');
    const total = parseFloat(d.maxTotal ?? d.maxScore) || 0;
    if (total<=0) { toast('El puntaje máximo debe ser mayor que 0', true); return; }
    if (!Array.isArray(d.criteria) || d.criteria.length===0) { toast('Debes agregar al menos un criterio', true); return; }
    if (d.criteria.some(c=>!(c.label||c.name||'').trim())) { toast('Hay criterios sin nombre', true); return; }
    const sumCriteria = weightedCriteriaSum(d);
    if (round2(sumCriteria)!==round2(total)) {
      toast('La suma de los criterios no coincide con el puntaje máximo del instrumento.', 'warn');
    }
  } else if (d?.type==='escala_estimativa') {
    if (INST_EDITOR.scaleMaxInputRaw!==null) {
      ieCommitScaleMaxInput(INST_EDITOR.scaleMaxInputRaw);
      if (INST_EDITOR.scaleMaxInputRaw!==null) return;
    }
    normalizeEstimativeDraft(d);
    if (!d.courseId) { toast('Debes seleccionar el curso del instrumento', true); return; }
    d.name = composeInstrumentName('escala_estimativa', d.name || '');
    if ((parseFloat(d.maxTotal ?? d.maxScore) || 0) <= 0) { toast('El puntaje máximo debe ser mayor que 0', true); return; }
    if (!Array.isArray(d.levels) || d.levels.length<2) { toast('Debes definir al menos 2 niveles', true); return; }
    if (d.levels.some(l=>!(l.label||'').trim())) { toast('Hay niveles sin nombre', true); return; }
    if (d.levels.some(l=>(parseFloat(l.value)||0) < 0)) { toast('Los valores de la escala no pueden ser negativos', true); return; }
    if (!Array.isArray(d.criteria) || d.criteria.length===0) { toast('Debes agregar al menos un criterio', true); return; }
    if (d.criteria.some(c=>!(c.label||c.name||'').trim())) { toast('Hay criterios sin nombre', true); return; }
  } else if (!d?.name) {
    toast('Nombre requerido', true);
    return;
  }
  if (!Array.isArray(d.criteria) || d.criteria.length===0) { toast('Debes tener al menos un criterio', true); return; }
  d.schoolYear = d.schoolYear || S.schoolYear?.name || '2025-2026';
  d.periodId = d.periodId || S.activePeriodId;
  d.maxTotal = parseFloat(d.maxTotal ?? d.maxScore) || 20;
  d.maxScore = d.maxTotal;
  if (d.type==='rubrica_analitica') {
    normalizeRubricaInstrument(d);
    const levelCheck = ieValidateLevels(d, true);
    if (!levelCheck.ok) return;
    if (d.criteria.some(c=>!(c.label||c.name||'').trim())) { toast('Hay criterios sin nombre', true); return; }
    ieRecalcWeightsFromPoints(false);
    const weightTotal = round2(d.criteria.reduce((s,c)=>s+(parseFloat(c.weightPct ?? c.weight)||0),0));
    if (weightTotal!==100) { toast('El peso total de la rúbrica debe ser 100%', true); return; }
  }
  if (INST_EDITOR.mode==='new' && !isBasicInstrumentType(d.type)) {
    toast('No se pueden crear instrumentos fuera de los 4 tipos básicos', true);
    return;
  }
  if (d.type==='lista_cotejo_a') normalizeChecklistDraft(d);
  if (d.type==='lista_cotejo_b') normalizeWeightedChecklistDraft(d);
  if (d.type==='escala_estimativa') normalizeEstimativeDraft(d);
  let saved;
  if (INST_EDITOR.mode==='edit') {
    saved = instrumentService.update(d.id, d);
  } else {
    d.periodId = d.periodId || S.activePeriodId;
    d.courseId = d.courseId || S.activeGroupId || null;
    d.updatedAt = nowIso();
    S.instruments.push(d);
    persist();
    saved = d;
  }
  if (!saved) { toast('No se pudo guardar', true); return; }
  if (andLink || INST_EDITOR.linkActivityId) {
    instrumentService.link(INST_EDITOR.linkActivityId, saved.id);
  }
  closeM('m-inst-editor');
  toast(andLink||INST_EDITOR.linkActivityId ? 'Instrumento guardado y vinculado' : 'Instrumento guardado');
  go(currentPage==='actividades'?'actividades':'instrumentos');
}

// Crea una copia del instrumento seleccionado para usarlo como base de una nueva versión.
function duplicateInstrument(id) {
  const src = getInstrumentById(id);
  if (src && !isBasicInstrumentType(src.type)) {
    toast('No se puede duplicar un instrumento legacy en esta versión', true);
    return;
  }
  const c = instrumentService.duplicate(id);
  if (!c) return;
  toast('Instrumento duplicado');
  go('instrumentos');
}
// Elimina un instrumento de la biblioteca después de pedir confirmación explícita.
function deleteInstrument(id) {
  if (!confirm('¿Eliminar instrumento de la biblioteca?')) return;
  instrumentService.remove(id);
  toast('Instrumento eliminado');
  go('instrumentos');
}

// Busca la última evaluación registrada para el mismo estudiante, instrumento, actividad y período activo.
function latestEvaluation(activityId, instrumentId, studentId, groupId = S.activeGroupId) {
  for (let i=S.evaluations.length-1; i>=0; i--) {
    const e = S.evaluations[i];
    if (e.activityId===activityId && e.instrumentId===instrumentId && e.studentId===studentId && e.groupId===groupId && (e.periodId||'P1')===S.activePeriodId) return e;
  }
  return null;
}

// Abre el modal de aplicación de un instrumento y prepara el primer estudiante disponible como contexto.
function openApplyInstrumentModal(activityId, preselectStudentId=null) {
  // Prepara la evaluación de una actividad concreta cargando instrumento, estudiante y contexto actual.
  const f = findActivity(activityId);
  if (!f) return;
  ensureActivityInstrumentFields(f.activity);
  if (!f.activity.instrumentId) { toast('Esta actividad no tiene instrumento vinculado', true); return; }
  const ests = studentsInGroup(S.activeGroupId);
  if (ests.length===0) { toast('No hay estudiantes en este grupo', true); return; }
  APPLY_CTX.activityId = activityId;
  APPLY_CTX.studentId = preselectStudentId || ests[0].id;
  APPLY_CTX.values = {};
  APPLY_CTX.criterionComments = {};
  APPLY_CTX.teacherCommentGeneral = '';
  renderApplyInstrumentModal();
  openM('m-apply-inst');
}

// Renderiza el formulario de evaluación del estudiante actual con sus criterios y el total recalculado.
function renderApplyInstrumentModal() {
  // Pinta el modal de aplicación del instrumento con criterios, entradas y total recalculado en vivo.
  const f = findActivity(APPLY_CTX.activityId);
  if (!f) return;
  const instBase = getInstrumentById(f.activity.instrumentId);
  if (!instBase) return;
  if ((instBase.periodId||'P1') !== S.activePeriodId) { toast('El instrumento pertenece a otro período', true); return; }
  const inst = instBase.type==='lista_cotejo_a'
    ? normalizeChecklistDraft(JSON.parse(JSON.stringify(instBase)))
    : instBase;
  const prev = latestEvaluation(APPLY_CTX.activityId, inst.id, APPLY_CTX.studentId, S.activeGroupId);
  APPLY_CTX.values = prev ? JSON.parse(JSON.stringify(prev.values||{})) : {};
  APPLY_CTX.criterionComments = {};
  APPLY_CTX.teacherCommentGeneral = prev?.teacherCommentGeneral || '';
  if (prev?.perCriterion?.length) {
    prev.perCriterion.forEach(pc=>{
      if (pc?.criterionId && pc?.levelId && !APPLY_CTX.values[pc.criterionId]) APPLY_CTX.values[pc.criterionId] = pc.levelId;
      if (pc?.criterionId && pc?.teacherComment) APPLY_CTX.criterionComments[pc.criterionId] = pc.teacherComment;
    });
  }
  const ests = studentsInGroup(S.activeGroupId);
  const studentOps = ests.map(s=>`<option value="${s.id}" ${s.id===APPLY_CTX.studentId?'selected':''}>${s.nombre} ${s.apellido}</option>`).join('');
  const calc = evaluateInstrument(inst, APPLY_CTX.values);
  const b = document.getElementById('apply-inst-body');
  if (!b) return;
  const rubricEvalTable = inst.type==='rubrica_analitica' ? renderRubricApplyTable(inst) : '';
  const weightedEvalTable = inst.type==='lista_cotejo_b' ? `<div style="overflow-x:auto;margin-top:8px;">
      <table class="tbl"><thead><tr><th>Criterio</th><th>Puntos obtenidos</th><th>Puntos del criterio</th></tr></thead><tbody>
      ${inst.criteria.map(c=>`<tr>
        <td>${c.name}</td>
        <td>${renderApplyInput(inst,c,APPLY_CTX.values[c.id])}</td>
        <td style="text-align:center;">${fmtNum(c.maxPoints)}</td>
      </tr>`).join('')}
      </tbody></table>
    </div>` : '';
  b.innerHTML = `
    ${renderInstrumentContextLines(S.activeGroupId, S.activePeriodId)}
    <div style="margin-bottom:10px;font-size:13px;color:var(--mute);">${getActivityLabel(APPLY_CTX.activityId)} · Instrumento: <strong style="color:var(--ink2);">${inst.name}</strong></div>
    <div class="fr">
      <div class="fg"><label class="lbl">Estudiante</label><select class="sel" onchange="changeApplyStudent(this.value)">${studentOps}</select></div>
      <div class="fg"><label class="lbl">Total calculado</label><div id="apply-total" style="padding:9px 12px;border:1.5px solid var(--line2);border-radius:var(--r);font-weight:700;">${fmtNum(calc.totalScore)} / ${fmtNum(calc.maxScore)} · Nota actividad: ${fmtNum(mapEvaluationToActivityScore(calc.totalScore, calc.maxScore, f.activity.pts))} / ${fmtNum(f.activity.pts)}</div></div>
    </div>
    ${rubricEvalTable || weightedEvalTable || `<div style="overflow-x:auto;margin-top:8px;">
      <table class="tbl"><thead><tr><th>Criterio</th><th>Valor</th><th>Máx</th></tr></thead><tbody>
      ${inst.criteria.map(c=>`<tr>
        <td>${c.name}</td>
        <td>${renderApplyInput(inst,c,APPLY_CTX.values[c.id])}</td>
        <td style="text-align:center;">${fmtNum(c.maxPoints)}</td>
      </tr>`).join('')}
      </tbody></table>
    </div>`}
    <div class="fg" style="margin-top:10px;">
      <label class="lbl">Observaciones del docente</label>
      <textarea class="ta" rows="5" placeholder="Escribe aquí observaciones del docente..." oninput="setApplyGeneralComment(this.value)">${APPLY_CTX.teacherCommentGeneral||''}</textarea>
    </div>
    <div class="mf">
      <button class="btn btn-outline" onclick="closeM('m-apply-inst')">Cerrar</button>
      <button class="btn btn-primary" onclick="saveCurrentEvaluation()">Guardar</button>
      <button class="btn btn-amber" onclick="saveCurrentEvaluation(true)">Guardar y siguiente</button>
    </div>
  `;
}
// Dibuja la tabla de evaluación de una rúbrica para que cada criterio pueda marcarse por nivel.
function renderRubricApplyTable(inst) {
  const levels = inst.levels || [];
  const rows = (inst.criteria||[]).map(c=>{
    const radios = levels.map(l=>{
      const checked = APPLY_CTX.values[c.id]===l.id ? 'checked' : '';
      const pts = fmtNum((parseFloat(c.maxPoints)||0) * (parseFloat(l.valueFactor ?? l.factor)||0));
      return `<td style="text-align:center;">
        <label style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <input type="radio" name="rb-${c.id}" ${checked} onchange="setApplyValue('${c.id}','${l.id}')">
          <span style="font-size:11px;color:var(--mute);">${pts}</span>
        </label>
      </td>`;
    }).join('');
    return `<tr>
      <td style="font-weight:700;">${c.label||c.name}</td>
      ${radios}
      <td style="text-align:center;font-weight:700;">${fmtNum(c.maxPoints)}</td>
    </tr>
    <tr><td colspan="${levels.length+2}" style="padding-top:0;">
      <textarea class="ta" rows="2" placeholder="Comentario del docente sobre este criterio" oninput="setApplyCriterionComment('${c.id}',this.value)">${APPLY_CTX.criterionComments[c.id]||''}</textarea>
    </td></tr>`;
  }).join('');
  return `<div style="overflow-x:auto;margin-top:8px;">
    <table class="tbl">
      <thead><tr><th>Criterio</th>${levels.map(l=>`<th style="text-align:center;">${l.label}</th>`).join('')}<th>Máx</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// Devuelve el control de entrada correcto para evaluar un criterio según el tipo de instrumento.
function renderApplyInput(inst, c, value) {
  const cid = c.id;
  if (inst.type==='lista_cotejo_a') {
    const tri = inst.checklistMode === 'trichotomic';
    const current = (value===true || value===1 || value==='1' || value==='cumple') ? 'cumple'
      : (value==='partial' || value==='parcial') ? 'partial'
      : (value===false || value===0 || value==='0' || value==='nocumple' || value==='no') ? 'nocumple'
      : '';
    if (tri) {
      return `<select class="sel" onchange="setApplyValue('${cid}',this.value)">
        <option value="">?</option>
        <option value="cumple" ${current==='cumple'?'selected':''}>Cumple</option>
        <option value="partial" ${current==='partial'?'selected':''}>Parcial</option>
        <option value="nocumple" ${current==='nocumple'?'selected':''}>No cumple</option>
      </select>`;
    }
    return `<select class="sel" onchange="setApplyValue('${cid}',this.value)">
      <option value="">?</option>
      <option value="cumple" ${current==='cumple'?'selected':''}>Cumple</option>
      <option value="nocumple" ${current==='nocumple'?'selected':''}>No cumple</option>
    </select>`;
  }
  if (inst.type==='lista_cotejo_b') {
    const max = Math.max(0, parseFloat(c.maxPoints)||0);
    const current = Number.isFinite(parseFloat(value)) ? parseFloat(value) : '';
    return `<input class="inp" type="number" min="0" max="${max}" step="0.01" value="${current}" oninput="setApplyValue('${cid}',this.value)">`;
  }
  const lvOpts = inst.levels.map(l=>`<option value="${l.id}" ${value===l.id?'selected':''}>${l.label}</option>`).join('');
  return `<select class="sel" onchange="setApplyValue('${cid}',this.value)"><option value="">?</option>${lvOpts}</select>`;
}

// Cambia el estudiante activo dentro del modal de aplicación sin perder los valores ya escritos.
function changeApplyStudent(studentId) {
  APPLY_CTX.studentId = studentId;
  renderApplyInstrumentModal();
}
// Guarda el valor seleccionado para un criterio y recalcula la nota total en vivo.
function setApplyValue(cid, v) {
  APPLY_CTX.values[cid] = v;
  const f = findActivity(APPLY_CTX.activityId);
  if (!f) return;
  const inst = getInstrumentById(f.activity.instrumentId);
  if (!inst) return;
  const calc = evaluateInstrument(inst, APPLY_CTX.values);
  const score = mapEvaluationToActivityScore(calc.totalScore, calc.maxScore, f.activity.pts);
  const el = document.getElementById('apply-total');
  if (el) el.textContent = `${fmtNum(calc.totalScore)} / ${fmtNum(calc.maxScore)} · Nota actividad: ${fmtNum(score)} / ${fmtNum(f.activity.pts)}`;
}
// Guarda un comentario específico del docente para un criterio dentro de la evaluación actual.
function setApplyCriterionComment(cid, text) {
  APPLY_CTX.criterionComments[cid] = text;
}
// Guarda la observación general del docente para la evaluación en curso.
function setApplyGeneralComment(text) {
  APPLY_CTX.teacherCommentGeneral = text;
}

// Guarda la evaluación actual, persiste el resultado y opcionalmente avanza al siguiente estudiante.
function saveCurrentEvaluation(next=false) {
  // Guarda la evaluación del estudiante actual, recalcula nota de actividad y opcionalmente avanza al siguiente.
  const f = findActivity(APPLY_CTX.activityId);
  if (!f) return;
  const inst = getInstrumentById(f.activity.instrumentId);
  if (!inst) return;
  const calc = evaluateInstrument(inst, APPLY_CTX.values);
  if (inst.type==='rubrica_analitica') {
    const missing = (inst.criteria||[]).some(c=>!APPLY_CTX.values[c.id]);
    if (missing) { toast('Debes seleccionar un nivel en todos los criterios', true); return; }
  }
  const activityScore = mapEvaluationToActivityScore(calc.totalScore, calc.maxScore, f.activity.pts);
  const perCriterion = (calc.perCriterion && calc.perCriterion.length)
    ? calc.perCriterion.map(pc=>({...pc, teacherComment: APPLY_CTX.criterionComments[pc.criterionId] || ''}))
    : (inst.criteria||[]).map(c=>({criterionId:c.id, levelId:APPLY_CTX.values[c.id]||null, points:0, teacherComment: APPLY_CTX.criterionComments[c.id] || ''}));
  instrumentService.applyEvaluation({
    id: uid(),
    activityId: APPLY_CTX.activityId,
    instrumentId: inst.id,
    studentId: APPLY_CTX.studentId,
    values: JSON.parse(JSON.stringify(APPLY_CTX.values)),
    totalScore: calc.totalScore,
    maxScore: calc.maxScore,
    total: calc.totalScore,
    perCriterion,
    teacherCommentGeneral: APPLY_CTX.teacherCommentGeneral || '',
    activityScore,
    groupId: S.activeGroupId,
    courseId: S.activeGroupId,
    periodId: S.activePeriodId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    timestamp: nowIso(),
    teacherId: S.profile?.name || 'docente'
  });
  toast(`Evaluación guardada (${fmtNum(activityScore)}/${fmtNum(f.activity.pts)})`);
  if (next) {
    const ests = studentsInGroup(S.activeGroupId);
    const idx = ests.findIndex(s=>s.id===APPLY_CTX.studentId);
    const nx = ests[idx+1] || ests[0];
    APPLY_CTX.studentId = nx.id;
    renderApplyInstrumentModal();
  } else {
    renderApplyInstrumentModal();
  }
  if (currentPage==='matriz') go('matriz');
  refreshTop();
}
