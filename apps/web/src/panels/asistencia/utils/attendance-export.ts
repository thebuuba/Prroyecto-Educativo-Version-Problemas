export function exportAttendanceExcel(): boolean {
  const fn = (window as Record<string, unknown>).exportToExcel;
  if (typeof fn !== 'function') return false;
  fn();
  return true;
}

export function exportAttendancePdf(): boolean {
  const fn = (window as Record<string, unknown>).exportToPdf;
  if (typeof fn !== 'function') return false;
  fn();
  return true;
}

export function printAttendance(): void {
  window.print();
}
