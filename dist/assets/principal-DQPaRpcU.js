import{J as c,K as u,L as r,M as v,N as p,O as f}from"./main-DiLCuoHx.js";function l(){return v(),window.S}function w(){const e=l();e.lessonPlanDraft=c(e.activeGroupId,e.activePeriodId),e.lessonPlanUi.mode="editor",e.lessonPlanUi.activeSectionId="general",window.go("planificaciones")}function m(e){const n=l(),s=n.lessonPlans.find(t=>t.id===e);s&&(n.lessonPlanDraft=JSON.parse(JSON.stringify(s)),n.lessonPlanUi.mode="editor",n.lessonPlanUi.activeSectionId=s.editorStep||"general",window.go("planificaciones"))}function g(){const e=l();e.lessonPlanUi.mode="home",window.go("planificaciones")}function x(e){const n=l();n.lessonPlanUi.activeSectionId=e,u(),window.go("planificaciones")}function h(e,n){const s=r(),t=e.split(".");t.length===2?s[t[0]][t[1]]=n:s[e]=n}function b(e,n){const s=r();s.curriculum[e]=n}function P(){window.lessonPlanNew=w,window.lessonPlanContinue=m,window.lessonPlanReturnHome=g,window.lessonPlanSetActiveSection=x,window.lessonPlanSetGeneralField=h,window.lessonPlanSetCurriculumField=b}function S(e){const n=l(),s=n.lessonPlanUi.mode||"home",t=p(),o=f(n.activeGroupId),d=o.length;if(s==="home"){e.innerHTML=`
      <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in fade-in duration-500">
        ${renderHeader(t.length,d)}
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-8 flex flex-col gap-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              ${renderCtaCard()}
              
              <div class="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold text-slate-800">Recientes</h3>
                  <span class="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase tracking-wider">Borradores</span>
                </div>
                ${renderDraftList(t)}
              </div>
            </div>
            
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-slate-800">Planificaciones del grupo</h3>
              </div>
              
              ${o.length?`
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${o.map(renderPlanCard).join("")}
                </div>
              `:`
                <div class="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h4 class="text-xl font-bold text-slate-800 mb-2">Comienza a planificar</h4>
                  <p class="text-slate-500 max-w-sm mx-auto">Aún no hay planificaciones completadas en este grupo. Crea una nueva para comenzar.</p>
                </div>
              `}
            </div>
          </div>
          
          <div class="lg:col-span-4 flex flex-col gap-8">
            <div class="bg-slate-900 rounded-[2rem] p-8 text-white">
              <h3 class="text-lg font-bold mb-6">Métricas de Diseño</h3>
              <div class="space-y-6">
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Carga Curricular</span>
                    <span class="text-2xl font-bold">84%</span>
                  </div>
                  <div class="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-400 w-[84%]"></div>
                  </div>
                </div>
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Actividades Unidas</span>
                    <span class="text-2xl font-bold">12</span>
                  </div>
                  <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;return}const i=n.lessonPlanDraft,a=n.lessonPlanUi.activeSectionId||"general";e.innerHTML=`
    <div class="max-w-[1600px] mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-5 duration-500">
      <div class="flex items-center justify-between mb-8">
        <button onclick="lessonPlanReturnHome()" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver
        </button>
        <div class="flex gap-3">
          <button onclick="lessonPlanPersistDraftNow()" class="px-7 py-2.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Guardar Borrador
          </button>
        </div>
      </div>

      ${renderStepRail(a)}

      <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
        ${a==="general"?renderEditorGeneral(i):""}
        ${a==="curriculum"?renderEditorCurriculum(i):""}
        ${a==="design"?renderEditorDesign(i):""}
        ${a==="evaluation"?renderEditorEvaluation(i):""}
        ${a==="preview"?renderEditorPreview(i):""}
      </div>
    </div>
  `}function C(){P(),window.RENDERS||(window.RENDERS={}),window.RENDERS.planificaciones=S}export{C as inicializar};
