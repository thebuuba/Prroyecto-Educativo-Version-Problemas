import { S } from '../core/state.js';
import { academicCalendarActiveMonths } from '../core/domain-utils.js';
import { scheduleSqlAttendanceMonthSync } from '../core/api-sql.js';

export const ATTENDANCE_V2_SLOT_CAPACITY = 96;
export const ATTENDANCE_V2_CODE_ORDER = ['', 'P', 'T', 'A', 'E', 'R'];
export const ATTENDANCE_V2_EXCEPTION_ORDER = ['', 'holiday', 'suspension', 'no-school'];

export function ensureAttendanceState() {
  if (!S.attendance || typeof S.attendance !== 'object') {
    S.attendance = { monthKey: getCurrentMonthKey(), records: {} };
  }
  if (!S.attendance.monthKey) S.attendance.monthKey = getCurrentMonthKey();
  if (!S.attendance.records || typeof S.attendance.records !== 'object') S.attendance.records = {};
  if (!S.attendance.settings || typeof S.attendance.settings !== 'object') S.attendance.settings = {};
  if (!S.attendance.groupSettings || typeof S.attendance.groupSettings !== 'object') S.attendance.groupSettings = {};
  if (!('advanceOnKeyboard' in S.attendance.settings)) S.attendance.settings.advanceOnKeyboard = true;
  S.attendance.settings.activeSchoolMonths = [...academicCalendarActiveMonths()];
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function normalizeMonthKey(monthKey) {
  const match = String(monthKey || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return getCurrentMonthKey();
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) return getCurrentMonthKey();
  return `${match[1]}-${String(month).padStart(2, '0')}`;
}

export function getMonthStart(monthKey) {
  const normalized = normalizeMonthKey(monthKey);
  const [year, month] = normalized.split('-').map((value) => parseInt(value, 10));
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

export function shiftMonthKey(monthKey, delta) {
  const date = getMonthStart(monthKey);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLongLabel(monthKey) {
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(getMonthStart(monthKey));
}

export function createSlotMeta(type = '', reason = '') {
  return {
    type: ATTENDANCE_V2_EXCEPTION_ORDER.includes(type) ? type : '',
    reason: String(reason || '').trim().slice(0, 140),
  };
}

function createMonthRecord() {
  return {
    slotDays: Array(ATTENDANCE_V2_SLOT_CAPACITY).fill(''),
    slotMeta: Array.from({ length: ATTENDANCE_V2_SLOT_CAPACITY }, () => createSlotMeta()),
    studentCodes: {},
    retiredCarryOverrides: {},
    retiredPolicy: 'until-retirement',
    scheduleLinked: false,
    visibleCount: 1,
    __normalized: true,
  };
}

function getGroupSettings(sectionId, createIfMissing = false) {
  ensureAttendanceState();
  if (!sectionId) return { scheduleLinked: false };
  if (!S.attendance.groupSettings[sectionId]) {
    if (!createIfMissing) return { scheduleLinked: false };
    S.attendance.groupSettings[sectionId] = { scheduleLinked: false };
  }
  return S.attendance.groupSettings[sectionId];
}

export function getMonthRecord(sectionId, monthKey, createIfMissing = false) {
  ensureAttendanceState();
  const normalizedMonth = normalizeMonthKey(monthKey);
  if (!sectionId) return createMonthRecord();

  const groupSettings = getGroupSettings(sectionId, createIfMissing);

  if (!S.attendance.records[sectionId]) {
    if (!createIfMissing) return createMonthRecord();
    S.attendance.records[sectionId] = {};
  }

  if (!S.attendance.records[sectionId][normalizedMonth]) {
    if (!createIfMissing) return createMonthRecord();
    S.attendance.records[sectionId][normalizedMonth] = {
      ...createMonthRecord(),
      scheduleLinked: !!groupSettings.scheduleLinked,
    };
  }

  const record = S.attendance.records[sectionId][normalizedMonth];
  if (!record.__normalized) record.__normalized = true;
  record.scheduleLinked = !!groupSettings.scheduleLinked;
  return record;
}

function getStudentRow(sectionId, monthKey, studentId, createIfMissing = false) {
  const record = getMonthRecord(sectionId, monthKey, createIfMissing);
  if (!record.studentCodes[studentId]) {
    if (!createIfMissing) return Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
    record.studentCodes[studentId] = Array(ATTENDANCE_V2_SLOT_CAPACITY).fill('');
  }
  return record.studentCodes[studentId];
}

function hasAnyMark(row) {
  return Array.isArray(row) && row.some((code) => String(code || '').trim());
}

function isInheritedRetired(sectionId, monthKey, studentId) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const record = getMonthRecord(sectionId, normalizedMonth, false);
  if (record.retiredCarryOverrides?.[studentId]) return false;

  const currentRow = getStudentRow(sectionId, normalizedMonth, studentId, false);
  if (currentRow.includes('R')) return false;
  if (hasAnyMark(currentRow)) return false;

  const sectionRecords = S.attendance?.records?.[sectionId];
  if (!sectionRecords) return false;

  let inherited = false;
  Object.keys(sectionRecords)
    .filter((key) => normalizeMonthKey(key) < normalizedMonth)
    .sort()
    .forEach((key) => {
      const prevRow = getStudentRow(sectionId, key, studentId, false);
      if (prevRow.includes('R')) inherited = true;
      else if (hasAnyMark(prevRow)) inherited = false;
    });

  return inherited;
}

export function getEffectiveCode(sectionId, monthKey, studentId, slotIndex) {
  const row = getStudentRow(sectionId, monthKey, studentId, false);
  const stored = String(row[slotIndex] || '').toUpperCase();
  if (stored) return stored;
  return isInheritedRetired(sectionId, monthKey, studentId) ? 'R' : '';
}

export function setSlotCode(sectionId, monthKey, studentId, slotIndex, code) {
  if (!sectionId || !studentId || slotIndex < 0 || slotIndex >= ATTENDANCE_V2_SLOT_CAPACITY) return;
  const record = getMonthRecord(sectionId, monthKey, true);
  const cleanCode = String(code || '').toUpperCase();

  if (isInheritedRetired(sectionId, monthKey, studentId) && cleanCode !== 'R' && cleanCode !== '') {
    record.retiredCarryOverrides[studentId] = true;
  } else if (cleanCode === 'R') {
    delete record.retiredCarryOverrides[studentId];
  }

  const row = getStudentRow(sectionId, monthKey, studentId, true);
  row[slotIndex] = ATTENDANCE_V2_CODE_ORDER.includes(cleanCode) ? cleanCode : '';

  if (cleanCode === 'R') {
    for (let i = slotIndex + 1; i < ATTENDANCE_V2_SLOT_CAPACITY; i += 1) row[i] = '';
  }

  scheduleSqlAttendanceMonthSync(sectionId, monthKey);
}

export function getMarkClass(code) {
  if (code === 'P') return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50';
  if (code === 'A') return 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm shadow-rose-100/50';
  if (code === 'T') return 'bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-100/50';
  if (code === 'E') return 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm shadow-blue-100/50';
  if (code === 'R') return 'bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm';
  return 'bg-white text-slate-300 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30';
}
