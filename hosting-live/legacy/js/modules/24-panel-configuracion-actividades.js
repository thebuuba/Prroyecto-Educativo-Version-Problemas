/* -------------------- CONFIGURACIÓN DE ACTIVIDADES -------------------- */
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
