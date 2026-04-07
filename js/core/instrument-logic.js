import { nowIso } from './utils.js';

/**
 * Global Instrument Domain Logic
 * --------------------------------------------------------------------------
 */

/**
 * Normaliza los atributos de una rúbrica analítica para asegurar integridad.
 */
export function normalizeRubricaInstrument(inst) {
  if (!inst || inst.type !== 'rubrica_analitica') return inst;
  inst.levelsCount = Math.max(2, Math.min(6, inst.levels?.length || 4));
  inst.maxScore = parseFloat(inst.maxTotal ?? inst.maxScore) || 20;
  inst.updatedAt = nowIso();
  return inst;
}

/**
 * Evalúa un instrumento de evaluación contra un set de valores (calificaciones por criterio).
 */
export function evaluateInstrument(instrument, values) {
  if (!instrument || !values) return { totalScore: 0, perCriterion: [] };
  let total = 0;
  const perCriterion = (instrument.criteria || []).map(c => {
    const val = values[c.id];
    let score = 0;
    if (instrument.type === 'rubrica_analitica') {
      const level = (instrument.levels || []).find(l => l.id === val);
      score = (parseFloat(level?.factor) || 0) * (parseFloat(c.maxPoints) || 0);
    } else {
      score = parseFloat(val) || 0;
    }
    total += score;
    return { id: c.id, score, value: val };
  });

  return { totalScore: total, perCriterion };
}

/**
 * Devuelve la etiqueta amigable para un tipo de instrumento.
 */
export function instrumentTypeLabel(type) {
  const m = {
    rubrica_analitica: 'Rúbrica analítica',
    lista_cotejo_a: 'Lista de cotejo (simple)',
    lista_cotejo_b: 'Lista de cotejo ponderada',
    escala_estimativa: 'Escala estimativa',
  };
  return m[type] || type;
}

/**
 * Sugiere un tipo de instrumento basado en metadatos de la actividad (IA heurística).
 */
export function suggestInstrumentForActivity(meta) {
  const txt = `${meta.name||''} ${meta.descripcion||''} ${meta.producto||''} ${meta.tipo||''}`.toLowerCase();
  if (txt.includes('exposición') || txt.includes('oral')) return 'rubrica_analitica';
  if (txt.includes('informe') || txt.includes('redacción') || txt.includes('escrito')) return 'rubrica_analitica';
  if (txt.includes('experimento') || txt.includes('laboratorio')) return 'lista_cotejo_b';
  if (txt.includes('participación') || txt.includes('observable') || txt.includes('práctica en aula')) return 'lista_cotejo_a';
  return 'escala_estimativa';
}
