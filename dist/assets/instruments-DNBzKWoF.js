import{S as o,n as d,t as i,p as x,y as r,k as b,z as v}from"./main-DzuOqHLs.js";const l=["rubrica_analitica","lista_cotejo_a","lista_cotejo_b","escala_estimativa"],a={rubrica_analitica:{title:"Rúbrica Analítica",icon:"📊",desc:"Evaluación detallada por criterios y niveles."},lista_cotejo_a:{title:"Lista de Cotejo Simple",icon:"✅",desc:"Cumple / No cumple (binaria)."},lista_cotejo_b:{title:"Lista Ponderada",icon:"⚖️",desc:"Cotejo con pesos específicos por criterio."},escala_estimativa:{title:"Escala Estimativa",icon:"📈",desc:"Valoración cualitativa (Siempre... Nunca)."}},c={filters:{type:"",gradeId:"",subject:"",periodId:""}};function n(e){o.instruments||(o.instruments=[]);const t=y();e.innerHTML=`
    <div class="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      <!-- Cabecera -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Instrumentos</h1>
          <p class="text-slate-500 font-medium">Biblioteca de rúbricas y criterios de evaluación.</p>
        </div>
        
        <button onclick="window.openInstrumentCreator()" 
          class="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Nuevo Instrumento
        </button>
      </div>

      <!-- Accesos Directos de Creación (Bento) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        ${l.map(s=>f(s)).join("")}
      </div>

      <!-- Sección de Biblioteca -->
      <div class="bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <h2 class="text-xl font-black text-slate-800">Biblioteca Personal</h2>
           
           <div class="flex flex-wrap gap-3">
              <select onchange="window.setInstFilter('gradeId', this.value)" class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Todos los Grados</option>
                ${d().map(s=>`<option value="${s.id}">${s.gradeName} ${s.sectionName}</option>`).join("")}
              </select>
              <select onchange="window.setInstFilter('type', this.value)" class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Todos los Tipos</option>
                ${l.map(s=>`<option value="${s}">${a[s].title}</option>`).join("")}
              </select>
           </div>
        </div>

        ${t.length===0?g():h(t)}
      </div>
    </div>
  `}function f(e){const t=a[e];return`
    <div onclick="window.createNewInstrument('${e}')" 
         class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
      <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:scale-110 transition-all mb-6">
        ${t.icon}
      </div>
      <h3 class="text-lg font-black text-slate-800 mb-2">${t.title}</h3>
      <p class="text-slate-400 text-xs font-medium leading-relaxed">${t.desc}</p>
    </div>
  `}function g(){return`
    <div class="py-20 text-center">
       <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
       </div>
       <h3 class="text-lg font-bold text-slate-400">No se encontraron instrumentos</h3>
       <p class="text-slate-300 text-sm mt-1">Refina tus filtros o crea uno nuevo arriba.</p>
    </div>
  `}function h(e){return`
    <div class="overflow-x-auto -mx-8 md:-mx-12">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
            <th class="px-8 md:px-12 py-4 text-left">Instrumento</th>
            <th class="px-6 py-4 text-left">Tipo</th>
            <th class="px-6 py-4 text-left">Asignatura / Grado</th>
            <th class="px-6 py-4 text-center">Máximo</th>
            <th class="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>w(t)).join("")}
        </tbody>
      </table>
    </div>
  `}function w(e){const t=a[e.type]||{title:"Otro",icon:"📄"},s=d().find(m=>m.id===e.courseId),u=s?`${s.gradeName} ${s.sectionName}`:"--",p=s?s.materia:e.subjectName||"--";return`
    <tr class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
      <td class="px-8 md:px-12 py-6">
        <div class="flex items-center gap-4">
           <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">${t.icon}</div>
           <div>
             <div class="text-sm font-black text-slate-800">${i(e.name)}</div>
             <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">${x(e.periodId)}</div>
           </div>
        </div>
      </td>
      <td class="px-6 py-6 font-bold text-xs text-slate-500">${t.title}</td>
      <td class="px-6 py-6">
        <div class="text-xs font-bold text-slate-600">${i(p)}</div>
        <div class="text-[10px] font-medium text-slate-400 mt-0.5">${u}</div>
      </td>
      <td class="px-6 py-6 text-center">
        <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">
          ${I(e)} pts
        </span>
      </td>
      <td class="px-6 py-6 text-right">
        <div class="flex items-center justify-end gap-2 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
           <button onclick="window.editInstrument('${e.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
           </button>
           <button onclick="window.deleteInstrument('${e.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
           </button>
        </div>
      </td>
    </tr>
  `}function y(){const e=c.filters;return(o.instruments||[]).filter(t=>!(e.type&&t.type!==e.type||e.gradeId&&t.courseId!==e.gradeId||e.periodId&&t.periodId!==e.periodId))}function I(e){return e.type==="rubrica_analitica"?e.maxTotal||e.maxScore||0:e.type==="lista_cotejo_a"?e.maxTotal||(e.criteria?e.criteria.length:0):e.maxScore||0}window.setInstFilter=(e,t)=>{c.filters[e]=t,n(document.getElementById("p-content"))};window.createNewInstrument=e=>{r(`Iniciando creador de ${a[e].title}...`,!1)};window.editInstrument=e=>{r(`Cargando editor para el instrumento ${e}...`,!1)};window.deleteInstrument=e=>{confirm("¿Estás seguro de que deseas eliminar este instrumento?")&&(o.instruments=o.instruments.filter(t=>t.id!==e),b(),n(document.getElementById("p-content")),r("Instrumento eliminado"))};window.openInstrumentCreator=()=>{v("m-inst-type")};window.RENDERS.instrumentos=e=>n(e);export{l as BASIC_INSTRUMENT_TYPES,a as INSTRUMENT_META,n as renderInstrumentsPanel};
