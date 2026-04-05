RENDERS.instrumentos = function(c) {
  const typeCards = BASIC_INSTRUMENT_TYPES.map(t=>{
    const meta = BASIC_INSTRUMENT_META[t];
    return `<button class="card cp instrument-type-card" style="text-align:left;cursor:pointer;border:1px solid var(--line);" onclick="openCreateInstrumentTypePicker(null,'${t}')">
      <div style="font-size:24px;">${meta.icon}</div>
      <div style="font-weight:800;margin-top:8px;">${meta.title}</div>
      <div style="font-size:12px;color:var(--mute);margin-top:4px;">${meta.desc}</div>
    </button>`;
  }).join('');
  c.innerHTML = `
  <div class="card cp" style="margin-bottom:16px;">
    <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;margin-bottom:6px;">Crear instrumento de evaluación</div>
    <div style="font-size:12px;color:var(--mute);margin-bottom:12px;">Selecciona el tipo de instrumento que deseas crear.</div>
    <div class="g2">${typeCards}</div>
  </div>
  <div class="card">
    <div class="ch"><span class="ch-title">Biblioteca de instrumentos</span></div>
    <div class="cp">${renderInstrumentLibraryFilters()}${renderInstrumentTable()}</div>
  </div>`;
};

