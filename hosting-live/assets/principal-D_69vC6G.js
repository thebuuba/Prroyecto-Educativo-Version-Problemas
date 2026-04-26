import{S as t,p as a,g as o,t as r}from"./main-CaBILF-9.js";function l(e){if(t.usuarios||(t.usuarios=[]),t.usuarios.length===0){e.innerHTML=`
      <div class="px-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div class="bg-white border border-slate-100 rounded-[3rem] p-12 text-center shadow-sm">
           <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
           </div>
           <h2 class="text-2xl font-black text-slate-800 mb-2">Sin usuarios adicionales</h2>
           <p class="text-slate-400 font-medium mb-10">Agrega coordinadores, directores u otros docentes <br> para gestionar la plataforma de forma colaborativa.</p>
           
           <button onclick="window.openUsrM()" class="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 mx-auto">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
             Agregar Usuario
           </button>
        </div>
      </div>
    `;return}e.innerHTML=`
    <div class="px-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div class="flex items-center justify-between gap-6 mb-12">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Colaboradores</h1>
          <p class="text-slate-500 font-medium">Gestión de accesos adicionales a la institución.</p>
        </div>
        
        <button onclick="window.openUsrM()" class="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Nuevo Usuario
        </button>
      </div>

      <div class="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th class="px-8 py-5 text-left">Nombre</th>
              <th class="px-6 py-5 text-left">Email</th>
              <th class="px-6 py-5 text-left">Rol</th>
              <th class="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${t.usuarios.map(s=>renderUserRow(s)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function n(){window.RENDERS.usuarios=e=>renderUsersPanel(e),window.delUsr=async e=>{confirm("¿Eliminar este usuario de acceso adicional?")&&(t.usuarios=(t.usuarios||[]).filter(s=>s.id!==e),a({immediate:!0}),o("usuarios"),r("Usuario eliminado"))}}export{n as inicializar,l as renderizarUsersPanel};
