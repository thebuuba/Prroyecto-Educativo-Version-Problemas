const LINK_ACTIVITY_KEY = '_linkActId';
const LINK_STUDENT_KEY = '_linkStudentId';

type LinkContext = {
  activityId: string;
  studentId?: string;
};

let linkContext: LinkContext = { activityId: '' };

function legacyValue(key: string): string {
  return String((window as Record<string, unknown>)[key] || '').trim();
}

function mirrorLegacyContext(context: LinkContext): void {
  (window as Record<string, unknown>)[LINK_ACTIVITY_KEY] = context.activityId || '';
  if (context.studentId) {
    (window as Record<string, unknown>)[LINK_STUDENT_KEY] = context.studentId;
  } else {
    delete (window as Record<string, unknown>)[LINK_STUDENT_KEY];
  }
}

export function setLinkContext(activityId: string, studentId?: string): LinkContext {
  linkContext = {
    activityId: String(activityId || '').trim(),
    studentId: String(studentId || '').trim() || undefined,
  };
  mirrorLegacyContext(linkContext);
  return linkContext;
}

export function getLinkContext(): LinkContext {
  const activityId = linkContext.activityId || legacyValue(LINK_ACTIVITY_KEY);
  const studentId = linkContext.studentId || legacyValue(LINK_STUDENT_KEY) || undefined;
  return { activityId, studentId };
}

export function clearLinkContext(): void {
  linkContext = { activityId: '' };
  mirrorLegacyContext(linkContext);
}

export function getLinkActivityId(): string {
  return getLinkContext().activityId;
}
