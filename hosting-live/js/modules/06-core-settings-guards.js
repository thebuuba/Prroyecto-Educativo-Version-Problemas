/* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
   GUARDIAS COMPARTIDAS DE AJUSTES
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
// Determina si el panel de ajustes sigue abierto y su formulario está sucio para decidir si se puede navegar fuera.
function hasPendingSettingsChanges() {
  const onSettings = currentPage === 'settings' || S.currentPage === 'settings';
  if (!onSettings) return false;
  if (!document.getElementById('settings-save-wrap')) return false;
  if (typeof isSettingsDirty !== 'function') return false;
  return isSettingsDirty();
}

// Bloquea la salida del panel de ajustes si hay cambios pendientes para evitar perder configuraciones al navegar.
function canLeaveSettingsPage(nextPage) {
  if (!hasPendingSettingsChanges()) return true;
  if (nextPage === 'settings') return true;
  toast('Tienes cambios sin guardar. Guarda o descarta antes de salir.', true);
  return false;
}
