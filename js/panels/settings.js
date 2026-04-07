/**
 * Settings Panel Module
 * Modernized version of the teacher profile and app configuration.
 */

import { S, persist } from '../core/state.js';
import { periodName, logoutAuth } from '../core/domain-utils.js';

/**
 * UI Rendering
 */

export function renderSettingsPanel(container) {
  container.innerHTML = `
    <div class="max-w-[800px] mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Header -->
      <header class="mb-12">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Configuración del Perfil</h1>
        <p class="text-slate-500 mt-1">Gestiona tu identidad docente y la información de tu centro educativo.</p>
      </header>
      
      <!-- Profile Bento Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="md:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
           <div class="flex items-center gap-6 mb-8">
              <div class="relative">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(S.user?.name || 'User')}&background=4F46E5&color=fff&size=80" alt="Avatar" class="w-20 h-20 rounded-3xl shadow-lg">
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-slate-900">${S.user?.name || 'Docente Invitado'}</h3>
                <p class="text-slate-500 font-medium">${S.user?.email || 'sin-correo@aulabase.edu'}</p>
                <div class="mt-2 inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                  Rol: ${S.user?.role || 'Docente'}
                </div>
              </div>
           </div>
           
           <div class="grid grid-cols-1 gap-6">
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input type="text" value="${S.user?.name || ''}" readonly class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed">
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input type="email" value="${S.user?.email || ''}" readonly class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed">
              </div>
           </div>
        </div>
        
        <div class="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
           <div class="relative z-10">
             <h4 class="font-bold text-lg mb-2">Estado de Cuenta</h4>
             <p class="text-indigo-100 text-sm leading-relaxed">Tu cuenta está activa y sincronizada con la nube.</p>
           </div>
           
           <div class="mt-8 relative z-10">
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Periodo Activo</div>
              <div class="text-xl font-black">${periodName()}</div>
           </div>

           <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>
      
      <!-- School Information Card -->
      <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm mb-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900">Institución Educativa</h3>
        </div>
        
        <div class="space-y-6">
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Centro Educativo</label>
            <input type="text" id="set-inst" value="${S.school?.name || ''}" 
                   class="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                   placeholder="Ej. Colegio San Miguel"
                   oninput="window.S.school.name = this.value; window.persist()">
          </div>
          
          <div class="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
            <div class="text-amber-600 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-sm text-amber-800/80 leading-relaxed">
              El nombre del centro aparecerá en todos los reportes generados (Excel y PDF). Asegúrate de que los datos sean correctos según el registro del MINERD.
            </p>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white mb-8">
        <div class="flex items-center justify-between">
           <div>
             <h4 class="text-lg font-bold">Sesión</h4>
             <p class="text-slate-400 text-sm">Gestiona tu acceso seguro a la plataforma.</p>
           </div>
           <button onclick="window.logoutAuth()" class="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all">
             Cerrar Sesión
           </button>
        </div>
      </div>
      
      <div class="text-center py-6">
        <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AulaBase v3.0 · Powered by Advanced Agentic Coding</p>
      </div>

    </div>
  `;
}

// Global Registration
window.RENDERS.settings = renderSettingsPanel;
