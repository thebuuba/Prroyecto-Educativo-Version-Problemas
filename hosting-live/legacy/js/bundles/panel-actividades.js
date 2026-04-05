/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

let ACT_VIEW_MODE = 'blocks';

// Cambia la vista de actividades y persiste el modo para que el panel vuelva exactamente donde el usuario lo dejó.
function setActView(mode) {
  ACT_VIEW_MODE = ['blocks', 'matrix', 'config'].includes(mode) ? mode : 'blocks';
  S.activityViewMode = ACT_VIEW_MODE;
  persist();
  go('actividades', { activityViewMode: ACT_VIEW_MODE });
}

// Renderiza el modulo de actividades y decide si mostrar bloques, matriz o configuracion segun el modo activo.
RENDERS.actividades = function(c) {
  let html=`<div class="act-view-toggle">
    <button class="btn btn-outline ${ACT_VIEW_MODE==='blocks'?'on':''}" onclick="setActView('blocks')">Vista por bloques</button>
    <button class="btn btn-outline ${ACT_VIEW_MODE==='matrix'?'on':''}" onclick="setActView('matrix')">Vista matriz</button>
    <button class="btn btn-outline ${ACT_VIEW_MODE==='config'?'on':''}" onclick="setActView('config')">Configuración de actividades</button>
  </div>`;
  if (ACT_VIEW_MODE !== 'config') {
    html+=`<div style="margin-bottom:16px;"><div style="font-size:13px;color:var(--mute);background:rgba(51,149,255,.06);border:1px solid rgba(51,149,255,.2);border-radius:var(--r);padding:12px 14px;">Las actividades y puntos de cada bloque se configuran en <strong style="color:var(--ink);">Configuración de actividades</strong>. Aquí puedes ver el resumen.</div></div>`;
  }
  if (ACT_VIEW_MODE==='blocks') html += renderActividadesByBloques();
  if (ACT_VIEW_MODE==='matrix') html += renderActividadesMatriz();
  if (ACT_VIEW_MODE==='config') html += renderActivitiesConfigPanel();
  c.innerHTML=html;
  if (ACT_VIEW_MODE==='config') BLOCKS.forEach(b => renderActivitiesConfigBlock(b));
};

// Construye el resumen por bloques con actividades, instrumentos vinculados y promedio registrado por curso activo.
function renderActividadesByBloques() {
  let html = '';
  html+='<div class="g2">';
  const cfg = getGroupCfg(S.activeGroupId);
  const ests = studentsInGroup(S.activeGroupId);
  BLOCKS.forEach(b=>{
    const acts=cfg[b].activities;
    const rawMax=blockRawMax(b);
    const meta=blockMeta(b);
    let rows='';
    if(acts.length===0) rows=`<div class="empty" style="padding:24px;"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="es">Sin actividades</div><button class="btn btn-outline btn-sm" onclick="go('config')">Configurar actividades</button></div>`;
    else acts.forEach((a,i)=>{
      ensureActivityInstrumentFields(a);
      const linked = getInstrumentById(a.instrumentId);
      const vals = ests.map(s=>((S.notas[s.id]||{})[a.id])).filter(x=>x!==undefined);
      const avg = vals.length ? round2(vals.reduce((s,v)=>s+v,0)/vals.length) : null;
      rows+=`<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--off);">
        <span style="font-size:11px;font-weight:800;color:var(--mute);width:20px;margin-top:3px;">${i+1}</span>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;">${a.name}</div>
          <div style="font-size:11px;color:var(--mute);margin-top:3px;">Instrumento vinculado: ${linked?`<strong style="color:var(--ink2);">${linked.name}</strong>`:'Sin instrumento'}</div>
          <div style="font-size:11px;color:var(--mute);margin-top:2px;">Promedio registrado: ${avg!==null?`${fmtNum(avg)}/${fmtNum(a.pts)}`:'?'} ? Evaluaciones: ${S.evaluations.filter(e=>e.activityId===a.id && e.groupId===S.activeGroupId && (e.periodId||'P1')===S.activePeriodId).length}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:7px;">
            <button class="btn btn-outline btn-sm" onclick="openLinkInstrumentModal('${a.id}')">${linked?'Cambiar':'Crear/Vincular'}</button>
            <button class="btn btn-primary btn-sm" ${linked?'':'disabled style="opacity:.55;cursor:not-allowed;"'} onclick="${linked?`openApplyInstrumentModal('${a.id}')`:''}">Evaluar</button>
          </div>
        </div>
        <span style="font-size:12px;font-weight:700;padding:3px 9px;background:var(--off2);border-radius:20px;">${fmtNum(a.pts)} pts</span>
      </div>`;
    });
    html+=`<div class="card">
      <div class="ch"><span class="ch-title" style="color:${BCOLOR[b]};">${BICON[b]} ${BNAME[b]}</span><span class="pill ${rawMax===meta?'p-green':rawMax>meta?'p-rose':'p-amber'}">${fmtNum(rawMax)}/${fmtNum(meta)} pts</span></div>
      <div class="cp">${rows}</div>
    </div>`;
  });
  html+='</div>';
  return html;
}

// Genera la vista matricial para cruzar estudiantes y actividades en una sola tabla operativa.
function renderActividadesMatriz() {
  const ests = studentsInGroup(S.activeGroupId);
  if (ests.length===0) {
    return `<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Sin estudiantes</div><div class="es">Registra estudiantes para usar la vista matriz.</div><button class="btn btn-outline" onclick="go('estudiantes')">Ir a estudiantes</button></div></div>`;
  }
  const cfg = getGroupCfg(S.activeGroupId);
  const blockActs = {};
  BLOCKS.forEach(b => blockActs[b] = cfg[b].activities);

  let h1 = `<tr><th class="ax-st" rowspan="2">Estudiante</th>`;
  BLOCKS.forEach(b=>{
    const n = blockActs[b].length;
    if(n>0) {
      h1 += `<th class="ax-bh ${b}" colspan="${n+1}">${BICON[b]} ${BNAME[b]}<br><span style="font-size:10px;opacity:.9;">${blockMeta(b)}/${blockMeta(b)} pts</span></th>`;
    }
  });
  h1 += `<th class="ax-finalh" rowspan="2">Total final</th></tr>`;

  let h2 = '<tr>';
  BLOCKS.forEach(b=>{
    blockActs[b].forEach((a,idx)=>{
      const last = idx===blockActs[b].length-1 ? 'sep-r' : '';
      h2 += `<th class="ax-ah ${b} ${last}" title="${a.name}">${a.name||`Actividad ${idx+1}`}<br><span style="font-size:9px;opacity:.8;">/${fmtNum(a.pts)}</span></th>`;
    });
    if(blockActs[b].length>0) h2 += `<th class="ax-sumh sep-r">Calificación</th>`;
  });
  h2 += '</tr>';

  let body = '<tbody>';
  ests.forEach(e=>{
    body += `<tr><td class="ax-name">${e.nombre} ${e.apellido}</td>`;
    BLOCKS.forEach(b=>{
      blockActs[b].forEach((a,idx)=>{
        const val = (S.notas[e.id]||{})[a.id];
        const shown = (val===0 || !!val) ? `${fmtNum(val)}/${fmtNum(a.pts)}` : '?';
        const hasInst = !!a.instrumentId;
        const title = hasInst ? 'Clic para evaluar esta actividad para este estudiante' : 'Primero vincula un instrumento';
        const last = idx===blockActs[b].length-1 ? 'sep-r' : '';
        body += `<td class="ax-cell ${last}" title="${title}" onclick="quickEvalFromMatrix('${a.id}','${e.id}')">${shown}</td>`;
      });
      if(blockActs[b].length>0){
        body += `<td class="ax-sum sep-r">${studentBlockScore(e.id,b)}</td>`;
      }
    });
    body += `<td class="ax-final">${studentFinal(e.id, S.activeGroupId) ?? '—'}</td></tr>`;
  });
  body += '</tbody>';

  return `<div class="card"><div class="cp">
    <div style="font-weight:800;margin-bottom:8px;">Vista matriz ? ${getGroupLabel(S.activeGroupId)} ? ${periodName()}</div>
    <div class="ax-wrap">
      <table class="ax">
        <thead>${h1}${h2}</thead>
        ${body}
      </table>
    </div>
    <div style="margin-top:8px;font-size:11px;color:var(--mute);">Clic en una celda para evaluar rápidamente estudiante + actividad.</div>
  </div></div>`;
}

// Abre la evaluacion rapida desde la matriz y, si falta instrumento, guia primero al flujo de vinculacion.
function quickEvalFromMatrix(activityId, studentId) {
  const f = findActivity(activityId);
  if (!f) return;
  ensureActivityInstrumentFields(f.activity);
  if (!f.activity.instrumentId) {
    toast('Esta actividad no tiene instrumento vinculado', true);
    openLinkInstrumentModal(activityId);
    return;
  }
  openApplyInstrumentModal(activityId, studentId);
}

﻿/* -------------------- CONFIGURACIÓN DE ACTIVIDADES -------------------- */
function renderActivitiesConfigPanel() {
  // Arma la vista base de configuración de actividades para el grupo y período activos.
  return `
  <div class="cfg-panel">
    <div class="cfg-header">
      <div>
        <div class="cfg-title">Configuraci?n de actividades</div>
        <div class="cfg-sub">Grupo activo: ${getGroupLabel(S.activeGroupId)} ? ${periodName()} ? Define actividades, puntos y normalizaci?n por bloque.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.15);" onclick="repairUtf8Text()">Reparar texto (UTF-8)</button>
        <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.15);" onclick="openM('m-tpl')">Guardar plantilla</button>
        <button class="btn btn-amber btn-sm" onclick="autoAdjustAll()">Autoajustar todo</button>
      </div>
    </div>
    <div class="cfg-body">
      ${S.templates.length>0?renderActivityTemplatesSection():''}
      <div id="cfg-blocks"></div>
    </div>
  </div>`;
}
RENDERS.config = function(c) {
  ACT_VIEW_MODE = 'config';
  RENDERS.actividades(c);
};
RENDERS.ai = function(c) {
  c.innerHTML = renderAiPanel();
};
// Devuelve el mes actual normalizado para reutilizarlo como referencia temporal en configuraciones y vínculos dependientes.
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Renderiza renderizar actividad templates sección.
function renderActivityTemplatesSection() {
  // Renderiza las plantillas reutilizables que permiten aplicar configuraciones completas de actividades.
  let cards='';
  S.templates.forEach(t=>{
    cards+=`<div class="tpl-card">
      <div class="tpl-name">${t.name}</div>
      <div class="tpl-desc">${t.desc||''} ? ${t.created}</div>
      <div class="tpl-apply" style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn btn-primary btn-sm" onclick="applyTemplate('${t.id}')">Aplicar</button>
        <button class="btn btn-danger btn-sm" onclick="delTpl('${t.id}')"><i class="ri-delete-bin-line"></i></button>
      </div>
    </div>`;
  });
  return `<div style="margin-bottom:22px;">
    <div style="font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:10px;">Plantillas guardadas</div>
    <div class="tpl-grid">${cards}</div>
  </div>`;
}

// Renderiza renderizar actividades config block.
function renderActivitiesConfigBlock(b) {
  // Pinta y refresca un bloque específico con sus actividades, metas, alertas y controles de ajuste.
  const container = document.getElementById('cfg-blocks');
  if(!container) return;
  let el = document.getElementById('cfg-block-'+b);
  if(!el){
    el = document.createElement('div');
    el.id = 'cfg-block-'+b;
    container.appendChild(el);
  }
  const cfg = getGroupCfg(S.activeGroupId)[b];
  const acts = cfg.activities;
  const rawMax = blockRawMax(b);
  const meta = blockMeta(b);
  const diff = round2(rawMax - meta);
  const norm = cfg.normalize !== false;

  let actRows='';
  acts.forEach((a,i)=>{
    actRows+=`<div class="act-row">
      <div class="act-num">${i+1}</div>
      <input class="act-name-inp" value="${a.name}" oninput="handleActNameInput('${b}','${a.id}',this)" onblur="handleActNameBlur('${b}','${a.id}',this)" placeholder="Nombre de actividad">
      <input class="act-pts-inp" type="number" value="${fmtNum(a.pts)}" min="0" max="999" step="0.1" inputmode="decimal" placeholder="Ej. 5.5" title="Puntos (admite decimales)" oninput="updateActPts('${b}','${a.id}',this.value,false)" onblur="updateActPts('${b}','${a.id}',this.value,true)" onchange="updateActPts('${b}','${a.id}',this.value,true)">
      <div style="font-size:10.5px;color:rgba(255,255,255,.35);text-align:center;">pts</div>
      <button onclick="removeActFromBlock('${b}','${a.id}')" style="background:rgba(244,63,94,.1);border:none;border-radius:6px;color:rgba(244,63,94,.7);cursor:pointer;width:26px;height:26px;font-size:13px;display:flex;align-items:center;justify-content:center;transition:var(--t);" onmouseover="this.style.background='rgba(244,63,94,.3)'" onmouseout="this.style.background='rgba(244,63,94,.1)'"><i class="ri-delete-bin-line"></i></button>
    </div>`;
  });

  // alert class
  const alertCls = diff===0?'pa-ok':diff>0?'pa-over':'pa-under';
  const alertMsg = diff===0
    ? 'Total coincide con la meta'
    : diff>0 ? `Te sobran ${fmtNum(diff)} pts sobre la meta`
    : `Faltan ${fmtNum(Math.abs(diff))} pts para la meta`;

  // slider value
  const sliderVal = acts.length;

  el.innerHTML=`
  <div class="block-section">
    <div class="block-hdr">
      <div class="block-name">
        <div class="block-dot" style="background:${BCOLOR[b]};"></div>
        ${BICON[b]} ${BNAME[b]}
      </div>
      <div class="block-controls">
        <span style="font-size:11px;color:rgba(255,255,255,.4);">Meta:</span>
        <input class="meta-inp" type="number" value="${meta}" min="1" max="999" onchange="updateMeta('${b}',this.value)" title="Puntaje meta del bloque">
        <span class="meta-label">pts meta</span>
        <button onclick="addActToBlock('${b}')" style="background:rgba(51,149,255,.15);border:1px solid rgba(51,149,255,.3);color:var(--aqua);border-radius:7px;padding:5px 11px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;transition:var(--t);" onmouseover="this.style.background='rgba(51,149,255,.28)'" onmouseout="this.style.background='rgba(51,149,255,.15)'">+ Act.</button>
        <button onclick="autoAdjustBlock('${b}')" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);color:var(--amber);border-radius:7px;padding:5px 11px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;transition:var(--t);" onmouseover="this.style.background='rgba(245,158,11,.28)'" onmouseout="this.style.background='rgba(245,158,11,.15)'">Auto</button>
      </div>
    </div>

    <div style="padding:10px 18px 4px;display:flex;align-items:center;gap:14px;">
      <span style="font-size:12px;color:rgba(255,255,255,.4);">Cantidad de actividades:</span>
      <input type="range" min="1" max="15" value="${sliderVal}" style="flex:1;max-width:200px;" oninput="sliderChangeCount('${b}',this.value)" onchange="sliderChangeCount('${b}',this.value)">
      <span style="font-size:14px;font-weight:800;color:#fff;min-width:20px;">${sliderVal}</span>
    </div>

    <div class="act-table-wrap">
      <div style="display:grid;grid-template-columns:36px 1fr 90px 90px 32px;gap:8px;padding:4px 0 8px;">
        <div></div>
        <div style="font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.25);">Nombre</div>
        <div style="font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.25);text-align:center;">Puntos</div>
        <div></div><div></div>
      </div>
      ${actRows || `<div style="padding:16px 0;text-align:center;color:rgba(255,255,255,.3);font-size:13px;">Sin actividades ? <span style="cursor:pointer;color:var(--aqua);" onclick="addActToBlock('${b}')">+ Agregar</span></div>`}
    </div>

    <div class="progress-section">
      <div class="prog-header">
        <span class="prog-label">Total de puntos del bloque</span>
        <span class="prog-values" style="color:${diff===0?'#34d399':diff>0?'#fb7185':'#fbbf24'};">${fmtNum(rawMax)} / ${fmtNum(meta)} pts</span>
      </div>
      <div class="prog-bar">
        <div class="prog-fill" id="pf-${b}" style="width:${meta>0?Math.min(rawMax/meta*100,100):0}%;background:${diff===0?'#10b981':diff>0?'var(--rose)':'var(--amber)'}"></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span class="prog-alert ${alertCls}">${alertMsg}</span>
      </div>
    </div>

    <div class="sw-row">
      <div>
        <div class="sw-label">Normalizar a escala meta</div>
        <div class="sw-sub">Si activo: convierte el total real del bloque a la escala meta (ej. siempre sobre 100)</div>
      </div>
      <label class="switch">
        <input type="checkbox" ${norm?'checked':''} onchange="toggleNormalize('${b}',this.checked)">
        <div class="sw-track"></div>
        <div class="sw-thumb"></div>
      </label>
    </div>
  </div>`;
}

// Recalcula el bloque visible después de cualquier cambio para mantener puntajes, sliders y totales en sincronía.
function renderActivitiesConfigProgress(b) {
  // Recalcula el bloque visible después de cualquier cambio para mantener puntajes, sliders y totales en sincronía.
  renderActivitiesConfigBlock(b);
}

// Gestiona slider change count.
function sliderChangeCount(b, val) {
  // Ajusta la cantidad de actividades de un bloque y limpia notas/evaluaciones si se reducen filas.
  const n = parseInt(val)||1;
  const current = getGroupCfg(S.activeGroupId)[b].activities;
  if(n > current.length){
    for(let i=current.length;i<n;i++){
      current.push({
        id:uid(), name:`Actividad ${i+1}`, courseId:S.activeGroupId, periodId:S.activePeriodId, pts:20, tipo:'', fecha:'', desc:'', producto:'',
        instrumentId:null, instrumentIds:[], instrumentHistory:[]
      });
    }
  } else if(n < current.length){
    // Remove from end, clean notes
    const removed = current.splice(n);
    removed.forEach(a=>{
      Object.keys(S.notas).forEach(eid=>{ if(S.notas[eid]) delete S.notas[eid][a.id]; });
      S.evaluations = S.evaluations.filter(e=>!(e.activityId===a.id && (e.periodId||'P1')===S.activePeriodId));
    });
  }
  persist(); renderActivitiesConfigBlock(b);
}

