import {
  deleteActivity,
  deleteEvaluations,
  ensureSqlAcademicContext,
  isEnabled,
  syncSqlActivityCreateOrUpdate,
  syncSqlActivityDelete,
} from '../../../../../../js/core/api-sql.ts';
import { S } from '../../../../../../js/core/state.ts';

function legacySqlApi(): any {
  return (window as any).AulaBaseSqlApi || null;
}

function sqlApiEnabled(): boolean {
  return Boolean(isEnabled?.() || legacySqlApi()?.isEnabled?.());
}

async function sqlAcademicContext(): Promise<any | null> {
  if (typeof ensureSqlAcademicContext === 'function') {
    return ensureSqlAcademicContext();
  }
  const legacy = legacySqlApi();
  if (typeof legacy?.ensureSqlAcademicContext === 'function') {
    return legacy.ensureSqlAcademicContext();
  }
  return null;
}

export async function syncActivityRecord(activity: any, meta: Record<string, unknown> = {}): Promise<any | null> {
  if (!activity || !sqlApiEnabled()) return null;
  const payloadActivity = {
    ...activity,
    id: activity.sqlId || activity.id,
  };

  const syncFn = typeof syncSqlActivityCreateOrUpdate === 'function'
    ? syncSqlActivityCreateOrUpdate
    : legacySqlApi()?.syncSqlActivityCreateOrUpdate;
  if (typeof syncFn !== 'function') return null;

  const sqlActivity = await syncFn(payloadActivity, meta);
  const newId = String(sqlActivity?.id || '').trim();
  if (newId) {
    activity.sqlId = newId;
  }
  return sqlActivity;
}

export async function deleteActivityRecord(activityId: string, meta: Record<string, any> = {}): Promise<void> {
  if (!sqlApiEnabled()) return;
  const schoolContext = await sqlAcademicContext();
  if (!schoolContext?.schoolId) return;

  const deleteFn = typeof syncSqlActivityDelete === 'function'
    ? syncSqlActivityDelete
    : legacySqlApi()?.syncSqlActivityDelete;
  if (typeof deleteFn === 'function') {
    await deleteFn(activityId);
  } else if (typeof deleteActivity === 'function') {
    await deleteActivity(activityId, { schoolId: schoolContext.schoolId });
  } else if (typeof legacySqlApi()?.deleteActivity === 'function') {
    await legacySqlApi().deleteActivity(activityId, { schoolId: schoolContext.schoolId });
  }

  const deleteEvaluationsFn = typeof deleteEvaluations === 'function'
    ? deleteEvaluations
    : legacySqlApi()?.deleteEvaluations;
  if (typeof deleteEvaluationsFn === 'function') {
    await deleteEvaluationsFn({
      schoolId: schoolContext.schoolId,
      sectionId: meta.sectionId || S.activeGroupId || '',
      periodId: meta.periodId || S.activePeriodId || 'P1',
      activityId,
    });
  }
}
