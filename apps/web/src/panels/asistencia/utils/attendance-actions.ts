import { S } from '../../../../../../js/core/state.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { persist } from '../../../../../../js/core/hydration.ts';
import { scheduleSqlAttendanceMonthSync } from '../../../../../../js/core/api-sql.ts';
import {
  ATTENDANCE_V2_CODE_ORDER,
  ATTENDANCE_V2_EXCEPTION_ORDER,
  createSlotMeta,
  getEffectiveCode,
  getMonthRecord,
  setSlotCode,
  shiftMonthKey,
} from './model.ts';
import { exportAttendanceExcel, exportAttendancePdf, printAttendance } from './attendance-export.ts';

type AttendanceActionContext = {
  trigger: HTMLElement;
  event: Event;
};

type AttendanceActionHandler = (context: AttendanceActionContext) => boolean | void | Promise<boolean | void>;

function data(trigger: HTMLElement, key: string): string {
  return String(trigger.dataset?.[key] || '').trim();
}

function valueFromTrigger(trigger: HTMLElement): string {
  if (trigger instanceof HTMLInputElement || trigger instanceof HTMLSelectElement || trigger instanceof HTMLTextAreaElement) {
    return trigger.value;
  }
  return data(trigger, 'attendanceValue') || data(trigger, 'value');
}

function numberFromData(trigger: HTMLElement, key: string, fallback = 0): number {
  const value = Number.parseInt(data(trigger, key), 10);
  return Number.isFinite(value) ? value : fallback;
}

function currentSectionId(): string {
  return String(S.activeGroupId || S.activeCourseId || '').trim();
}

function currentMonthKey(): string {
  return String(S.attendance?.monthKey || '').trim();
}

function rerenderAttendance(): void {
  persist();
  go('asistencia');
}

function setMonth(delta: number): void {
  S.attendanceMonthPinned = true;
  if (!S.attendance || typeof S.attendance !== 'object') S.attendance = { monthKey: '', records: {} };
  S.attendance.monthKey = shiftMonthKey(currentMonthKey(), delta);
  rerenderAttendance();
}

function setActiveGroup(id: string): void {
  if (!id) return;
  S.activeGroupId = id;
  S.activeCourseId = id;
  rerenderAttendance();
}

function setAttendanceCode(trigger: HTMLElement, explicitCode = ''): void {
  const sectionId = data(trigger, 'attendanceSectionId') || currentSectionId();
  const monthKey = data(trigger, 'attendanceMonth') || currentMonthKey();
  const studentId = data(trigger, 'attendanceStudentId');
  const slotIndex = numberFromData(trigger, 'attendanceSlotIndex');
  if (!sectionId || !monthKey || !studentId) return;

  const current = getEffectiveCode(sectionId, monthKey, studentId, slotIndex);
  const code = explicitCode || data(trigger, 'attendanceStatus');
  const nextCode = code || ATTENDANCE_V2_CODE_ORDER[(ATTENDANCE_V2_CODE_ORDER.indexOf(current) + 1) % ATTENDANCE_V2_CODE_ORDER.length];
  setSlotCode(sectionId, monthKey, studentId, slotIndex, nextCode);
  rerenderAttendance();
}

function commitDay(trigger: HTMLElement): void {
  const sectionId = data(trigger, 'attendanceSectionId') || currentSectionId();
  const monthKey = data(trigger, 'attendanceMonth') || currentMonthKey();
  const slotIndex = numberFromData(trigger, 'attendanceSlotIndex');
  const record = getMonthRecord(sectionId, monthKey, true);
  const clean = valueFromTrigger(trigger).replace(/\D/g, '').slice(0, 2);
  const day = Number.parseInt(clean, 10);

  if (!clean || (day >= 1 && day <= 31)) {
    record.slotDays[slotIndex] = clean;
    record.visibleCount = Math.max(record.visibleCount || 1, slotIndex + 1);
    persist();
    scheduleSqlAttendanceMonthSync(sectionId, monthKey);
    go('asistencia');
  }
}

function cycleException(trigger: HTMLElement): void {
  const sectionId = data(trigger, 'attendanceSectionId') || currentSectionId();
  const monthKey = data(trigger, 'attendanceMonth') || currentMonthKey();
  const slotIndex = numberFromData(trigger, 'attendanceSlotIndex');
  const record = getMonthRecord(sectionId, monthKey, true);
  const current = record.slotMeta[slotIndex]?.type || '';
  const next = ATTENDANCE_V2_EXCEPTION_ORDER[(ATTENDANCE_V2_EXCEPTION_ORDER.indexOf(current) + 1) % ATTENDANCE_V2_EXCEPTION_ORDER.length];

  record.slotMeta[slotIndex] = createSlotMeta(next);
  persist();
  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
  go('asistencia');
}

const attendanceActionRegistry: Record<string, AttendanceActionHandler> = {
  open: () => go('asistencia'),
  'mark-present': ({ trigger }) => setAttendanceCode(trigger, 'P'),
  'mark-absent': ({ trigger }) => setAttendanceCode(trigger, 'A'),
  'mark-late': ({ trigger }) => setAttendanceCode(trigger, 'T'),
  justify: ({ trigger }) => cycleException(trigger),
  edit: ({ trigger }) => setAttendanceCode(trigger),
  save: ({ trigger }) => commitDay(trigger),
  cancel: () => go('asistencia'),
  'change-date': ({ trigger }) => commitDay(trigger),
  'change-month': ({ trigger }) => {
    const value = valueFromTrigger(trigger);
    if (!value) return;
    if (!S.attendance || typeof S.attendance !== 'object') S.attendance = { monthKey: '', records: {} };
    S.attendanceMonthPinned = true;
    S.attendance.monthKey = value;
    rerenderAttendance();
  },
  'previous-day': () => {},
  'next-day': () => {},
  'previous-month': () => setMonth(-1),
  'next-month': () => setMonth(1),
  filter: ({ trigger }) => {
    const target = data(trigger, 'attendanceTarget');
    if (target === 'course' || target === 'section' || target === 'group') setActiveGroup(valueFromTrigger(trigger));
    if (target === 'weekly-schedule') go('asistencia');
  },
  'clear-filter': () => {},
  'select-course': ({ trigger }) => setActiveGroup(data(trigger, 'attendanceCourseId') || valueFromTrigger(trigger)),
  'select-section': ({ trigger }) => setActiveGroup(data(trigger, 'attendanceSectionId') || valueFromTrigger(trigger)),
  'select-student': () => {},
  export: ({ trigger }) => {
    const format = data(trigger, 'attendanceFormat');
    if (format === 'pdf') exportAttendancePdf();
    else exportAttendanceExcel();
  },
  print: () => printAttendance(),
};

export function handleDeclarativeAttendanceAction(trigger: Element, event: Event): boolean {
  if (!(trigger instanceof HTMLElement)) return false;
  const action = data(trigger, 'attendanceAction');
  const handler = attendanceActionRegistry[action];
  if (!handler) {
    console.warn('[EduGest][attendance-actions] Acción no permitida.', { action });
    return false;
  }

  const expectedEvent = data(trigger, 'attendanceEvent');
  if (expectedEvent && expectedEvent !== event.type) return false;

  if (event.type === 'click') {
    event.preventDefault();
    event.stopPropagation();
  }

  void handler({ trigger, event });
  return true;
}
