/**
 * Módulo del Panel de Asistencia (EduGest Attendance V3).
 * --------------------------------------------------------------------------
 * Gestiona el registro de asistencia diaria, tardanzas y ausencias.
 * Implementa una cuadrícula interactiva con soporte para meses lectivos,
 * sincronización SQL y exportación de reportes.
 */

import { S } from '../../core/state.ts';
import { go } from '../../core/routing.ts';
import { persist } from '../../core/hydration.ts';
import { scheduleNonCriticalTask } from '../../core/utils.ts';
import { getGroups, isAcademicMonthActive } from '../../core/domain-utils.ts';
import { scheduleSqlAttendanceMonthSync } from '../../core/api-sql.ts';
import { registerAttendanceActions } from './logic.ts';
import { renderizarAttendanceEmpty, renderizarAttendancePanel as renderAttendancePanelView } from './view.ts';
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
} from './logic.ts';

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
export function registrarAttendancePanel(container) {
  ensureAttendanceState();
  if (!S.activeGroupId) {
    const groups = getGroups();
    if (groups.length) S.activeGroupId = groups[0].id;
  }
  
  const activeGroup = getGroups().find(g => g.id === S.activeGroupId) || null;
  const monthKey = normalizeMonthKey(S.attendance.monthKey);
  
  if (!activeGroup) {
    renderizarAttendanceEmpty(container);
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
export function inicializar() {
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
    registrarAttendancePanel(container);
  };
}

// Auto-run if loaded via traditional script but we are in ESM
if (S.currentPage === 'asistencia') {
  scheduleNonCriticalTask(() => {
    const c = document.getElementById('panel-content');
    if (c) registrarAttendancePanel(c);
  }, 50);
}
