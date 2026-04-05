/* AUTO-GENERADO: no editar directamente.
 * Fuente: js/modules/* + scripts/assemble-app-bundles.sh
 */

/* ------------------------- MATRIX ------------------------- */
// Renderiza la matriz consolidada del grupo activo y muestra accesos rápidos cuando faltan estudiantes o actividades.
RENDERS.matriz = function(c) {
  const ests = studentsInGroup(S.activeGroupId);
  console.debug('[EduGest][matriz]', {activeCourseId: S.activeCourseId||S.activeGroupId, filteredStudents: ests.length});
  if(ests.length===0||totalActs()===0){
    c.innerHTML=`<div class="card"><div class="empty"><div class="ei"><i class="ri-inbox-2-line"></i></div><div class="et">Matriz vacía</div>
      <div class="es">${ests.length===0?'Registra estudiantes en el grupo seleccionado.':'Configura actividades en los bloques.'}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        ${ests.length===0?`<button class="btn btn-outline" onclick="go('estudiantes')">Ir a estudiantes</button>`:''}
        ${totalActs()===0?`<button class="btn btn-primary" onclick="go('config')">Ir a configuración</button>`:''}
      </div>
    </div></div>`;
    return;
  }

  const cfg = getGroupCfg(S.activeGroupId);
  const blockActs = {};
  BLOCKS.forEach(b => blockActs[b] = cfg[b].activities);
  // Gestiona block total100.
  const blockTotal100 = (estId, b) => {
    const meta = blockMeta(b, S.activeGroupId) || 100;
    const score = studentBlockScore(estId, b, S.activeGroupId);
    if (meta <= 0) return 0;
    return Math.round((score / meta) * 100);
  };

  let th1 = `<tr><th class="st" rowspan="2">Estudiante</th>`;
  BLOCKS.forEach(b=>{
    const n = blockActs[b].length;
    if(n>0) th1+=`<th class="bh ${b}" colspan="${n+1}">${BICON[b]} ${BNAME[b]}<br><span style="font-size:10px;font-weight:500;opacity:.8;">TOTAL BLOQUE (0-100)</span></th>`;
  });
  th1+=`<th class="bh tot" colspan="2">Final</th></tr>`;

  let th2='<tr>';
  BLOCKS.forEach(b=>{
    blockActs[b].forEach(a=>{
      th2+=`<th class="ah ${b}" title="${a.name}">${a.name.length>10?a.name.slice(0,10)+'...':a.name}<br><span style="font-size:9px;">${fmtNum(a.pts)}pt</span></th>`;
    });
    if(blockActs[b].length>0){
      th2+=`<th class="ah tot">TOTAL BLOQUE<br><span style="font-size:9px;">/100 pts</span></th>`;
    }
  });
  th2+=`<th class="ah tot">PROMEDIO<br><span style="font-size:9px;">(0-100)</span></th><th class="ah tot">% FINAL</th></tr>`;

  let tbody='<tbody>';
  ests.forEach(e=>{
    tbody+=`<tr><td class="sc">${e.nombre} ${e.apellido}</td>`;
    const totals = [];
    BLOCKS.forEach(b=>{
      blockActs[b].forEach(a=>{
        const raw=(S.notas[e.id]||{})[a.id]||0;
        const cls=scoreClass(raw,a.pts);
        const shown = raw===0 ? '0' : (raw||'?');
        tbody+=`<td style="padding:5px;text-align:center;" title="Se califica desde Actividades -> Evaluar (Instrumentos).">
          <span class="si ${cls}" style="display:inline-flex;align-items:center;justify-content:center;cursor:not-allowed;">${shown}</span>
        </td>`;
      });
      if(blockActs[b].length>0){
        const tb = blockTotal100(e.id,b);
        totals.push(tb);
        const cls=scoreClass(tb,100);
        tbody+=`<td class="bt ${cls}" style="color:${BCOLOR[b]};">${tb}</td>`;
      }
    });
    const avg = totals.length ? Math.round(totals.reduce((s,v)=>s+v,0)/4) : 0;
    tbody+=`<td class="ft">${avg}</td>`;
    tbody+=`<td class="ft">${avg}%</td>`;
    tbody+='</tr>';
  });
  tbody+='</tbody>';

  c.innerHTML=`<div class="card"><div class="ch"><span class="ch-title">Vista matriz - ${getGroupLabel(S.activeGroupId)} ? ${periodName()}</span></div><div class="mtx-wrap"><table class="mtx"><thead>${th1}${th2}</thead>${tbody}</table></div></div>`;
};

