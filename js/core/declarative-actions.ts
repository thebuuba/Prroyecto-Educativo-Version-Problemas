import { go } from './routing.ts';
import { closeM } from './ui.ts';
import { S } from './state.ts';
import { persist } from './hydration.ts';
import { flushSqlProfileSync } from './api-sql.ts';
import {
  handleDeclarativeBlur,
  handleDeclarativeFocus,
  handleDeclarativeInput,
  handleDeclarativeKeydown,
} from './form-actions.ts';
import { handleDeclarativeAuthAction } from '../panels/autenticacion/utils/auth-actions.ts';
import { handleDeclarativeStudentAction } from '../panels/estudiantes/utils/student-actions.ts';
import { handleDeclarativeAcademicAction } from '../panels/configuracion-academica/utils/academic-actions.ts';
import { handleDeclarativeAttendanceAction } from '../panels/asistencia/utils/attendance-actions.ts';
import { handleDeclarativeScheduleAction } from '../panels/horario/utils/schedule-actions.ts';
import { handleDeclarativeActivityAction } from '../panels/actividades/utils/activity-actions.ts';
import { handleDeclarativeUserAction } from '../panels/usuarios/utils/user-actions.ts';
import { handleDeclarativePlanningAction } from '../panels/planificaciones/utils/planning-actions.ts';
import { handleDeclarativeReportAction } from '../panels/reportes/utils/report-actions.ts';

function getDatasetValue(element: Element, key: string): string {
  return String((element as HTMLElement).dataset?.[key] || '').trim();
}

function shouldHandleAuthClick(trigger: Element): boolean {
  const action = getDatasetValue(trigger, 'authAction');
  const tagName = trigger.tagName.toLowerCase();
  if (['input', 'select', 'textarea'].includes(tagName) && action === 'clear-terms-error') return false;
  return true;
}

function handleModalClose(trigger: Element, event: Event): boolean {
  const modalId = getDatasetValue(trigger, 'modalClose') || getDatasetValue(trigger, 'modalId');
  if (!modalId) return false;

  event.preventDefault();
  event.stopPropagation();
  closeM(modalId);
  return true;
}

function handleNavigation(trigger: Element, event: Event): boolean {
  const route = getDatasetValue(trigger, 'route');
  if (!route) return false;
  const routeOptions = readRouteOptions(trigger);

  event.preventDefault();
  event.stopPropagation();
  go(route, routeOptions);
  return true;
}

function valueFromTrigger(trigger: Element): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return getDatasetValue(trigger, 'value');
}

function rerenderCurrentPage(): void {
  persist({ immediate: true });
  go(S.currentPage || 'tablero');
}

function handleUiAction(trigger: Element, event: Event): boolean {
  const action = getDatasetValue(trigger, 'uiAction');
  if (!action) return false;

  const expectedEvent = getDatasetValue(trigger, 'uiEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  if (action === 'open-dashboard-course') {
    const sectionId = getDatasetValue(trigger, 'sectionId');
    if (!sectionId) return false;
    S.activeGroupId = sectionId;
    S.activeCourseId = sectionId;
    const section = (S.secciones || []).find((item) => item.id === sectionId);
    if (section?.gradeId) S.activeGradeId = section.gradeId;
    persist({ immediate: true });
    go('actividades');
    return true;
  }

  if (action === 'set-active-group') {
    const sectionId = valueFromTrigger(trigger);
    if (!sectionId) return false;
    S.activeGroupId = sectionId;
    S.activeCourseId = sectionId;
    const section = (S.secciones || []).find((item) => item.id === sectionId);
    if (section?.gradeId) S.activeGradeId = section.gradeId;
    rerenderCurrentPage();
    return true;
  }

  if (action === 'set-active-period') {
    const periodId = valueFromTrigger(trigger);
    if (!periodId) return false;
    S.activePeriodId = periodId;
    rerenderCurrentPage();
    return true;
  }

  if (action === 'update-institution') {
    if (!S.profile) S.profile = {};
    S.profile.inst = valueFromTrigger(trigger);
    delete S.profile.schoolId;
    delete S.profile.school;
    if (event.type === 'change') {
      persist({ immediate: true });
      void flushSqlProfileSync().catch((error) => {
        console.warn('[EduGest][declarative-actions] No se pudo sincronizar el perfil.', error);
      });
    } else {
      persist();
    }
    return true;
  }

  console.warn('[EduGest][declarative-actions] data-ui-action no permitida.', { action });
  return false;
}

function readRouteOptions(trigger: Element): Record<string, unknown> {
  const rawOptions = getDatasetValue(trigger, 'routeOptions');
  if (!rawOptions) return {};

  try {
    const parsed = JSON.parse(rawOptions);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch (error) {
    console.warn('[EduGest][declarative-actions] data-route-options inválido.', { rawOptions, error });
    return {};
  }

  console.warn('[EduGest][declarative-actions] data-route-options debe ser un objeto JSON.', { rawOptions });
  return {};
}

export function bindDeclarativeActions(): void {
  if (window.__AULABASE_DECLARATIVE_ACTIONS_BOUND) return;
  window.__AULABASE_DECLARATIVE_ACTIONS_BOUND = true;

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const modalCloseTrigger = target.closest('[data-modal-close], [data-action="modal-close"][data-modal-id]');
    if (modalCloseTrigger && handleModalClose(modalCloseTrigger, event)) return;

    const authTrigger = target.closest('[data-auth-action]');
    if (authTrigger && shouldHandleAuthClick(authTrigger)) {
      event.preventDefault();
      event.stopPropagation();
      handleDeclarativeAuthAction(authTrigger, event);
      return;
    }

    const uiTrigger = target.closest('[data-ui-action]');
    if (uiTrigger && handleUiAction(uiTrigger, event)) return;

    const navigationTrigger = target.closest('[data-route], [data-action="navigate"][data-route]');
    if (navigationTrigger) handleNavigation(navigationTrigger, event);

    const studentTrigger = target.closest('[data-student-action]');
    if (studentTrigger) handleDeclarativeStudentAction(studentTrigger, event);

    const academicTrigger = target.closest('[data-academic-action]');
    if (academicTrigger) handleDeclarativeAcademicAction(academicTrigger, event);

    const attendanceTrigger = target.closest('[data-attendance-action]');
    if (attendanceTrigger) handleDeclarativeAttendanceAction(attendanceTrigger, event);

    const scheduleTrigger = target.closest('[data-schedule-action]');
    if (scheduleTrigger) handleDeclarativeScheduleAction(scheduleTrigger, event);

    const activityTrigger = target.closest('[data-activity-action]');
    if (activityTrigger) handleDeclarativeActivityAction(activityTrigger, event);

    const userTrigger = target.closest('[data-user-action]');
    if (userTrigger) handleDeclarativeUserAction(userTrigger, event);

    const planningTrigger = target.closest('[data-planning-action]');
    if (planningTrigger) handleDeclarativePlanningAction(planningTrigger, event);

    const reportTrigger = target.closest('[data-report-action]');
    if (reportTrigger) handleDeclarativeReportAction(reportTrigger, event);
  });

  document.addEventListener('change', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const authTarget = target.closest('[data-auth-action]');
    if (authTarget) {
      handleDeclarativeAuthAction(authTarget, event);
      return;
    }

    const uiTarget = target.closest('[data-ui-action]');
    if (uiTarget && handleUiAction(uiTarget, event)) return;

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget) handleDeclarativeStudentAction(studentTarget, event);

    const academicTarget = target.closest('[data-academic-action]');
    if (academicTarget) handleDeclarativeAcademicAction(academicTarget, event);

    const attendanceTarget = target.closest('[data-attendance-action]');
    if (attendanceTarget) handleDeclarativeAttendanceAction(attendanceTarget, event);

    const scheduleTarget = target.closest('[data-schedule-action]');
    if (scheduleTarget) handleDeclarativeScheduleAction(scheduleTarget, event);

    const activityTarget = target.closest('[data-activity-action]');
    if (activityTarget) handleDeclarativeActivityAction(activityTarget, event);

    const userTarget = target.closest('[data-user-action]');
    if (userTarget) handleDeclarativeUserAction(userTarget, event);

    const planningTarget = target.closest('[data-planning-action]');
    if (planningTarget) handleDeclarativePlanningAction(planningTarget, event);

    const reportTarget = target.closest('[data-report-action]');
    if (reportTarget) handleDeclarativeReportAction(reportTarget, event);
  });

  document.addEventListener('input', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const uiTarget = target.closest('[data-ui-action]');
    if (uiTarget && handleUiAction(uiTarget, event)) return;

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget && handleDeclarativeStudentAction(studentTarget, event)) return;

    const academicTarget = target.closest('[data-academic-action]');
    if (academicTarget && handleDeclarativeAcademicAction(academicTarget, event)) return;

    const attendanceTarget = target.closest('[data-attendance-action]');
    if (attendanceTarget && handleDeclarativeAttendanceAction(attendanceTarget, event)) return;

    const scheduleTarget = target.closest('[data-schedule-action]');
    if (scheduleTarget && handleDeclarativeScheduleAction(scheduleTarget, event)) return;

    const activityTarget = target.closest('[data-activity-action]');
    if (activityTarget && handleDeclarativeActivityAction(activityTarget, event)) return;

    const userTarget = target.closest('[data-user-action]');
    if (userTarget && handleDeclarativeUserAction(userTarget, event)) return;

    const planningTarget = target.closest('[data-planning-action]');
    if (planningTarget && handleDeclarativePlanningAction(planningTarget, event)) return;

    const reportTarget = target.closest('[data-report-action]');
    if (reportTarget && handleDeclarativeReportAction(reportTarget, event)) return;

    handleDeclarativeInput(target, event);
  });

  document.addEventListener('dblclick', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget) handleDeclarativeStudentAction(studentTarget, event);

    const scheduleTarget = target.closest('[data-schedule-action]');
    if (scheduleTarget) handleDeclarativeScheduleAction(scheduleTarget, event);

    const activityTarget = target.closest('[data-activity-action]');
    if (activityTarget) handleDeclarativeActivityAction(activityTarget, event);
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target) handleDeclarativeKeydown(target, event);
  });

  document.addEventListener('focusin', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target) handleDeclarativeFocus(target, event);
  });

  document.addEventListener('focusout', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target) handleDeclarativeBlur(target, event);
  });
}
