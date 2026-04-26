import{S as i,F as l,t as o,p as d,G as c}from"./main-AFE2lkXK.js";const s=["rubrica_analitica","lista_cotejo_a","lista_cotejo_b","escala_estimativa"],r={rubrica_analitica:{title:"Rúbrica Analítica",icon:"📊",desc:"Evaluación detallada por criterios y niveles."},lista_cotejo_a:{title:"Lista de Cotejo Simple",icon:"✅",desc:"Cumple / No cumple (binaria)."},lista_cotejo_b:{title:"Lista Ponderada",icon:"⚖️",desc:"Cotejo con pesos específicos por criterio."},escala_estimativa:{title:"Escala Estimativa",icon:"📈",desc:"Valoración cualitativa (Siempre... Nunca)."}},a={filters:{type:"",gradeId:"",subject:"",periodId:""}};function p(e){i.instruments||(i.instruments=[]);const t=u();e.innerHTML=`
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
        ${s.map(n=>renderTypeShortCard(n)).join("")}
      </div>

      <!-- Sección de Biblioteca -->
      <div class="bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <h2 class="text-xl font-black text-slate-800">Biblioteca Personal</h2>
           
           <div class="flex flex-wrap gap-3">
              <select onchange="window.setInstFilter('gradeId', this.value)" class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Todos los Grados</option>
                ${l().map(n=>`<option value="${n.id}">${n.gradeName} ${n.sectionName}</option>`).join("")}
              </select>
              <select onchange="window.setInstFilter('type', this.value)" class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Todos los Tipos</option>
                ${s.map(n=>`<option value="${n}">${r[n].title}</option>`).join("")}
              </select>
           </div>
        </div>

        ${t.length===0?renderEmptyLibrary():renderInstrumentTable(t)}
      </div>
    </div>
  `}function u(){const e=a.filters;return(i.instruments||[]).filter(t=>!(e.type&&t.type!==e.type||e.gradeId&&t.courseId!==e.gradeId||e.periodId&&t.periodId!==e.periodId))}window.setInstFilter=(e,t)=>{a.filters[e]=t,renderInstrumentsPanel(document.getElementById("p-content"))};window.createNewInstrument=e=>{o(`Iniciando creador de ${r[e].title}...`,!1)};window.editInstrument=e=>{o(`Cargando editor para el instrumento ${e}...`,!1)};window.deleteInstrument=e=>{confirm("¿Estás seguro de que deseas eliminar este instrumento?")&&(i.instruments=i.instruments.filter(t=>t.id!==e),d(),renderInstrumentsPanel(document.getElementById("p-content")),o("Instrumento eliminado"))};function f(){window.RENDERS||(window.RENDERS={}),window.RENDERS.instrumentos=e=>renderInstrumentsPanel(e)}window.openInstrumentCreator=()=>{c("m-inst-type")};export{s as BASIC_INSTRUMENT_TYPES,r as INSTRUMENT_META,f as inicializar,p as renderizarInstrumentsPanel};
