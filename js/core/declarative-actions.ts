import { go } from './routing.ts';
import { closeM } from './ui.ts';
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

    const navigationTrigger = target.closest('[data-route], [data-action="navigate"][data-route]');
    if (navigationTrigger) handleNavigation(navigationTrigger, event);

    const studentTrigger = target.closest('[data-student-action]');
    if (studentTrigger) handleDeclarativeStudentAction(studentTrigger, event);

    const academicTrigger = target.closest('[data-academic-action]');
    if (academicTrigger) handleDeclarativeAcademicAction(academicTrigger, event);

    const attendanceTrigger = target.closest('[data-attendance-action]');
    if (attendanceTrigger) handleDeclarativeAttendanceAction(attendanceTrigger, event);
  });

  document.addEventListener('change', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const authTarget = target.closest('[data-auth-action]');
    if (authTarget) {
      handleDeclarativeAuthAction(authTarget, event);
      return;
    }

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget) handleDeclarativeStudentAction(studentTarget, event);

    const academicTarget = target.closest('[data-academic-action]');
    if (academicTarget) handleDeclarativeAcademicAction(academicTarget, event);

    const attendanceTarget = target.closest('[data-attendance-action]');
    if (attendanceTarget) handleDeclarativeAttendanceAction(attendanceTarget, event);
  });

  document.addEventListener('input', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget && handleDeclarativeStudentAction(studentTarget, event)) return;

    const academicTarget = target.closest('[data-academic-action]');
    if (academicTarget && handleDeclarativeAcademicAction(academicTarget, event)) return;

    const attendanceTarget = target.closest('[data-attendance-action]');
    if (attendanceTarget && handleDeclarativeAttendanceAction(attendanceTarget, event)) return;

    handleDeclarativeInput(target, event);
  });

  document.addEventListener('dblclick', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const studentTarget = target.closest('[data-student-action]');
    if (studentTarget) handleDeclarativeStudentAction(studentTarget, event);
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
