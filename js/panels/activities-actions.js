import { S } from '../core/state.js';
import { go } from '../core/routing.js';
import { persist } from '../core/hydration.js';
import { uid, getGroupCfg, findActivity } from '../core/domain-utils.js';

async function syncActivityRecord(activity, meta = {}) {
  if (!activity || !window.AulaBaseSqlApi?.isEnabled?.() || typeof window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate !== 'function') {
    return null;
  }
  const payloadActivity = {
    ...activity,
    id: activity.sqlId || activity.id,
  };
  const sqlActivity = await window.AulaBaseSqlApi.syncSqlActivityCreateOrUpdate(payloadActivity, meta);
  const newId = String(sqlActivity?.id || '').trim();
  if (newId) {
    activity.sqlId = newId;
  }
  return sqlActivity;
}

async function deleteActivityRecord(activityId, meta = {}) {
  if (!window.AulaBaseSqlApi?.isEnabled?.()) return;
  const schoolContext = typeof window.AulaBaseSqlApi.ensureSqlAcademicContext === 'function'
    ? await window.AulaBaseSqlApi.ensureSqlAcademicContext()
    : null;
  if (!schoolContext?.schoolId) return;
  if (typeof window.AulaBaseSqlApi.syncSqlActivityDelete === 'function') {
    await window.AulaBaseSqlApi.syncSqlActivityDelete(activityId);
  } else if (typeof window.AulaBaseSqlApi.deleteActivity === 'function') {
    await window.AulaBaseSqlApi.deleteActivity(activityId, { schoolId: schoolContext.schoolId });
  }
  if (typeof window.AulaBaseSqlApi.deleteEvaluations === 'function') {
    await window.AulaBaseSqlApi.deleteEvaluations({
      schoolId: schoolContext.schoolId,
      sectionId: meta.sectionId || S.activeGroupId || '',
      periodId: meta.periodId || S.activePeriodId || 'P1',
      activityId,
    });
  }
}

export function registerActivitiesActions() {
  window.setActView = (mode) => {
    S.activityViewMode = ['blocks', 'matrix', 'config'].includes(mode) ? mode : 'blocks';
    persist();
    go('actividades');
  };

  window.updateBlockMeta = (blockId, value) => {
    const nextValue = parseFloat(value) || 100;
    getGroupCfg(S.activeGroupId)[blockId].meta = nextValue;
    persist();
    go('actividades');
  };

  window.handleActNameInput = async (blockId, activityId, input) => {
    const found = findActivity(activityId);
    if (found) found.activity.name = input.value;
    persist();
    if (found?.activity) {
      await syncActivityRecord(found.activity, {
        sectionId: S.activeGroupId,
        periodId: S.activePeriodId,
        blockKey: found.block || blockId,
      }).catch((error) => {
        console.warn('[EduGest][sql] No se pudo sincronizar el nombre de la actividad', error);
      });
    }
  };

  window.updateActPts = async (blockId, activityId, value) => {
    const nextValue = parseFloat(value) || 0;
    const found = findActivity(activityId);
    if (found) found.activity.pts = nextValue;
    persist();
    if (found?.activity) {
      await syncActivityRecord(found.activity, {
        sectionId: S.activeGroupId,
        periodId: S.activePeriodId,
        blockKey: found.block || blockId,
      }).catch((error) => {
        console.warn('[EduGest][sql] No se pudo sincronizar los puntos de la actividad', error);
      });
    }
  };

  window.addActToBlock = async (blockId) => {
    const activities = getGroupCfg(S.activeGroupId)[blockId].activities;
    const activity = {
      id: uid(),
      name: `Actividad ${activities.length + 1}`,
      pts: 20,
      courseId: S.activeGroupId,
      periodId: S.activePeriodId,
      instrumentId: null,
      instrumentIds: [],
      instrumentHistory: [],
    };
    activities.push(activity);
    persist();
    await syncActivityRecord(activity, {
      sectionId: S.activeGroupId,
      periodId: S.activePeriodId,
      blockKey: blockId,
    }).catch((error) => {
      console.warn('[EduGest][sql] No se pudo sincronizar la actividad creada', error);
    });
    go('actividades');
  };

  window.removeActFromBlock = async (blockId, activityId) => {
    const cfg = getGroupCfg(S.activeGroupId)[blockId];
    const removed = cfg.activities.find((activity) => activity.id === activityId);
    cfg.activities = cfg.activities.filter((activity) => activity.id !== activityId);
    S.evaluations = S.evaluations.filter((evaluation) => !(evaluation.activityId === activityId && (evaluation.periodId || 'P1') === S.activePeriodId));
    persist();
    await deleteActivityRecord(removed?.sqlId || activityId, {
      sectionId: S.activeGroupId,
      periodId: S.activePeriodId,
    }).catch((error) => {
      console.warn('[EduGest][sql] No se pudo sincronizar la eliminación de la actividad', error);
    });
    go('actividades');
  };

  window.autoAdjustBlock = (blockId) => {
    const cfg = getGroupCfg(S.activeGroupId)[blockId];
    const acts = cfg.activities;
    if (!acts.length) return;
    const target = cfg.meta || 100;
    const base = Math.floor(target / acts.length);
    const extra = target % acts.length;
    acts.forEach((activity, index) => {
      activity.pts = base + (index < extra ? 1 : 0);
    });
    persist();
    Promise.all(acts.map((activity) => syncActivityRecord(activity, {
      sectionId: S.activeGroupId,
      periodId: S.activePeriodId,
      blockKey: blockId,
    }))).catch((error) => {
      console.warn('[EduGest][sql] No se pudo sincronizar el ajuste automático de actividades', error);
    });
    go('actividades');
  };
}
