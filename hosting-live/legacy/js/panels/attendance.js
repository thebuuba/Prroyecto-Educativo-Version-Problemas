/**
 * Módulo del Panel de Asistencia (EduGest Attendance V3).
 * --------------------------------------------------------------------------
 * Gestiona el registro de asistencia diaria, tardanzas y ausencias.
 * Implementa una cuadrícula interactiva con soporte para meses lectivos,
 * sincronización SQL y exportación de reportes.
 */

import { S } from '../core/state.js';
import { go } from '../core/routing.js';
import { persist } from '../core/hydration.js';
import { scheduleNonCriticalTask } from '../core/utils.js';
import { getGroups, isAcademicMonthActive } from '../core/domain-utils.js';
import { scheduleSqlAttendanceMonthSync } from '../core/api-sql.js';
import { registerAttendanceActions } from './attendance-actions.js';
import { renderAttendanceEmpty, renderAttendancePanel as renderAttendancePanelView } from './attendance-render.js';
import {
  ATTENDANCE_V2_CODE_ORDER,
  ATTENDANCE_V2_EXCEPTION_ORDER,
  createSlotMeta,
  ensureAttendanceState,
  getEffectiveCode,
  getMarkClass,
  getMonthLongLabel,
  getMonthRecord,
  normalizeMonthKey,
  setSlotCode,
  shiftMonthKey,
} from './attendance-model.js';

// UI State (Private to module)
const UI = {
  sectionId: '',
  monthKey: '',
  studentIds: [],
  activeType: '',
  activeStudentId: '',
  activeSlotIndex: 0,
  dayDrafts: {},
  attendanceMonthPinned: false
};

/**
 * Registra y renderiza el panel de asistencia en el contenedor proporcionado.
 * @param {HTMLElement} container - Contenedor del panel.
 */
export function registerAttendancePanel(container) {
  ensureAttendanceState();
  if (!S.activeGroupId) {
    const groups = getGroups();
    if (groups.length) S.activeGroupId = groups[0].id;
  }
  
  const activeGroup = getGroups().find(g => g.id === S.activeGroupId) || null;
  const monthKey = normalizeMonthKey(S.attendance.monthKey);
  
  if (!activeGroup) {
    renderAttendanceEmpty(container);
    return;
  }

  renderAttendancePanelView(container, activeGroup, monthKey, {
    isAcademicMonthActive,
    getMonthLongLabel,
    getMonthRecord,
    getEffectiveCode,
    createSlotMeta,
    getMarkClass,
  });
}

// --- Initialization ---

/**
 * Inicializa el módulo de asistencia y registra el renderizador.
 */
export function init() {
  registerAttendanceActions({
    UI,
    S,
    go,
    persist,
    shiftMonthKey,
    getEffectiveCode,
    getMonthRecord,
    setSlotCode,
    scheduleSqlAttendanceMonthSync,
    ATTENDANCE_V2_CODE_ORDER,
    ATTENDANCE_V2_EXCEPTION_ORDER,
    createSlotMeta,
  });
  if (!window.RENDERS) window.RENDERS = {};
  window.RENDERS.asistencia = (container) => {
    registerAttendancePanel(container);
  };
}

// Auto-run if loaded via traditional script but we are in ESM
if (S.currentPage === 'asistencia') {
  scheduleNonCriticalTask(() => {
    const c = document.getElementById('panel-content');
    if (c) registerAttendancePanel(c);
  }, 50);
}
