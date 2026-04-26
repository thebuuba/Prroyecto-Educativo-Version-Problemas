import{S as e,p as a,g as r,t as i,e as o}from"./main-BqMwzFXj.js";function l(t){if(e.usuarios||(e.usuarios=[]),e.usuarios.length===0){t.innerHTML=`
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
    `;return}t.innerHTML=`
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
            ${e.usuarios.map(s=>n(s)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function n(t){const s=t.rol==="Dirección"?"bg-rose-50 text-rose-600":t.rol==="Coordinador"?"bg-amber-50 text-amber-600":"bg-blue-50 text-blue-600";return`
    <tr class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
      <td class="px-8 py-6">
        <div class="text-sm font-black text-slate-800">${o(t.nombre||"Sin nombre")}</div>
      </td>
      <td class="px-6 py-6 text-sm text-slate-500 font-medium">${o(t.email||"--")}</td>
      <td class="px-6 py-6">
        <span class="px-3 py-1 ${s} rounded-lg text-[10px] font-black uppercase tracking-wider">
          ${o(t.rol||"Docente")}
        </span>
      </td>
      <td class="px-6 py-6 text-right">
        <button onclick="window.delUsr('${t.id}')" class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    </tr>
  `}function c(){window.RENDERS.usuarios=t=>l(t),window.delUsr=async t=>{confirm("¿Eliminar este usuario de acceso adicional?")&&(e.usuarios=(e.usuarios||[]).filter(s=>s.id!==t),a({immediate:!0}),r("usuarios"),i("Usuario eliminado"))}}export{c as init,l as renderUsersPanel};
