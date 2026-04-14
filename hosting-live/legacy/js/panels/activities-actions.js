import { S } from '../core/state.js';
import { go } from '../core/routing.js';
import { persist } from '../core/hydration.js';
import { uid, getGroupCfg, findActivity } from '../core/domain-utils.js';

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

  window.handleActNameInput = (blockId, activityId, input) => {
    const found = findActivity(activityId);
    if (found) found.activity.name = input.value;
    persist();
  };

  window.updateActPts = (blockId, activityId, value) => {
    const nextValue = parseFloat(value) || 0;
    const found = findActivity(activityId);
    if (found) found.activity.pts = nextValue;
    persist();
  };

  window.addActToBlock = (blockId) => {
    const activities = getGroupCfg(S.activeGroupId)[blockId].activities;
    activities.push({
      id: uid(),
      name: `Actividad ${activities.length + 1}`,
      pts: 20,
      courseId: S.activeGroupId,
      periodId: S.activePeriodId,
      instrumentId: null,
      instrumentIds: [],
      instrumentHistory: [],
    });
    persist();
    go('actividades');
  };

  window.removeActFromBlock = (blockId, activityId) => {
    const cfg = getGroupCfg(S.activeGroupId)[blockId];
    cfg.activities = cfg.activities.filter((activity) => activity.id !== activityId);
    S.evaluations = S.evaluations.filter((evaluation) => !(evaluation.activityId === activityId && (evaluation.periodId || 'P1') === S.activePeriodId));
    persist();
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
    go('actividades');
  };
}
