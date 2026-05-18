import { BNAME } from '../../../../../../js/core/config.ts';
import { persist } from '../../../../../../js/core/hydration.ts';
import { go } from '../../../../../../js/core/routing.ts';
import { S } from '../../../../../../js/core/state.ts';
import { closeM, toast } from '../../../../../../js/core/ui.ts';
import { syncSqlActivityCreateOrUpdate } from '../../../../../../js/core/api-sql.ts';
import {
  getGroupCfg,
  parseDecimalInput,
  round2,
  uid,
} from '../../../../../../js/core/domain-utils.ts';

function inputValue(id: string): string {
  const field = document.getElementById(id);
  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim();
  }
  return '';
}

function selectValue(id: string): string {
  const field = document.getElementById(id);
  if (field instanceof HTMLSelectElement || field instanceof HTMLInputElement) return field.value;
  return '';
}

export function saveAct(): boolean {
  const name = inputValue('a-nom');
  if (!name) {
    toast('Nombre requerido', true);
    return false;
  }
  if (!S.activeGroupId) {
    toast('Selecciona/crea un grupo primero', true);
    return false;
  }

  const blockId = selectValue('a-blq') || 'B1';
  const type = inputValue('a-tipo');
  const points = Math.max(0, round2(parseDecimalInput(inputValue('a-pts'), 20)));
  if (points <= 0) {
    toast('Los puntos deben ser mayores que 0', true);
    return false;
  }

  const cfg = getGroupCfg(S.activeGroupId);
  const block = cfg?.[blockId];
  if (!block?.activities) return false;

  const activity = {
    id: uid(),
    name,
    courseId: S.activeGroupId,
    periodId: S.activePeriodId,
    pts: points,
    tipo: type,
    fecha: inputValue('a-fecha'),
    desc: inputValue('a-obs'),
    producto: '',
    instrumentId: null,
    instrumentIds: [],
    instrumentHistory: [],
  };

  block.activities.push(activity);
  persist();
  syncSqlActivityCreateOrUpdate(activity, {
    sectionId: S.activeGroupId,
    periodId: S.activePeriodId,
    blockKey: blockId,
  }).catch((error) => {
    console.warn('[AulaBase][sql-api] No se pudo sincronizar la actividad creada con SQL', error);
  });
  closeM('m-act');
  go('config');
  toast(`Actividad agregada al bloque ${BNAME[blockId]}`);
  return true;
}

export function saveTpl(): boolean {
  const name = inputValue('tpl-name');
  if (!name) {
    toast('Nombre requerido', true);
    return false;
  }

  const snapshot = JSON.parse(JSON.stringify(getGroupCfg(S.activeGroupId)));
  S.templates.push({
    id: uid(),
    name,
    desc: inputValue('tpl-desc'),
    cfg: snapshot,
    created: new Date().toLocaleDateString('es-DO'),
  });
  persist();
  closeM('m-tpl');
  toast('Plantilla guardada');
  return true;
}
