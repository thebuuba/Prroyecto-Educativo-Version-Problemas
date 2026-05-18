/**
 * Registro de acciones globales del panel de asistencia.
 * Mantiene la capa `window.*` separada del resto del módulo.
 */

export function registerAttendanceActions(deps) {
  const {
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
  } = deps;

  window.shiftMonth = (delta) => {
    UI.attendanceMonthPinned = true;
    const next = shiftMonthKey(S.attendance.monthKey, delta);
    S.attendance.monthKey = next;
    persist();
    go('asistencia');
  };

  window.setActiveGroup = (id) => {
    S.activeGroupId = id;
    persist();
    go('asistencia');
  };

  window.cycleMark = (studentId, slotIndex) => {
    const sectionId = S.activeGroupId;
    const monthKey = S.attendance.monthKey;
    const current = getEffectiveCode(sectionId, monthKey, studentId, slotIndex);
    const idx = ATTENDANCE_V2_CODE_ORDER.indexOf(current);
    const next = ATTENDANCE_V2_CODE_ORDER[(idx + 1) % ATTENDANCE_V2_CODE_ORDER.length];

    setSlotCode(sectionId, monthKey, studentId, slotIndex, next);
    persist();
    go('asistencia');
  };

  window.commitDayDay = (slotIndex, value) => {
    const sectionId = S.activeGroupId;
    const monthKey = S.attendance.monthKey;
    const record = getMonthRecord(sectionId, monthKey, true);

    const clean = String(value || '').replace(/\D/g, '').slice(0, 2);
    const day = parseInt(clean, 10);

    if (!clean || (day >= 1 && day <= 31)) {
      record.slotDays[slotIndex] = clean;
      record.visibleCount = Math.max(record.visibleCount || 1, slotIndex + 1);
      persist();
      scheduleSqlAttendanceMonthSync(sectionId, monthKey);
      go('asistencia');
    }
  };

  window.cycleException = (slotIndex) => {
    const sectionId = S.activeGroupId;
    const monthKey = S.attendance.monthKey;
    const record = getMonthRecord(sectionId, monthKey, true);
    const current = record.slotMeta[slotIndex]?.type || '';
    const idx = ATTENDANCE_V2_EXCEPTION_ORDER.indexOf(current);
    const next = ATTENDANCE_V2_EXCEPTION_ORDER[(idx + 1) % ATTENDANCE_V2_EXCEPTION_ORDER.length];

    record.slotMeta[slotIndex] = createSlotMeta(next);
    persist();
    scheduleSqlAttendanceMonthSync(sectionId, monthKey);
    go('asistencia');
  };

  window.applyWeeklySchedule = () => {
    go('asistencia');
  };
}
