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
