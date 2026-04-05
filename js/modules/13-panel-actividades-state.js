let ACT_VIEW_MODE = 'blocks';

// Cambia la vista de actividades y persiste el modo para que el panel vuelva exactamente donde el usuario lo dejó.
function setActView(mode) {
  ACT_VIEW_MODE = ['blocks', 'matrix', 'config'].includes(mode) ? mode : 'blocks';
  S.activityViewMode = ACT_VIEW_MODE;
  persist();
  go('actividades', { activityViewMode: ACT_VIEW_MODE });
}
