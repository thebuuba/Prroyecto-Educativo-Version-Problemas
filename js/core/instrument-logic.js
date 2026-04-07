/**
 * Lógica de Instrumentos de Evaluación.
 * --------------------------------------------------------------------------
 * Este módulo gestiona la definición, normalización y cálculo de puntajes para 
 * diversos instrumentos pedagógicos como rúbricas analíticas, listas de cotejo 
 * y escalas estimativas.
 */

import { nowIso } from './utils.js';

/**
 * Normaliza los atributos de una rúbrica analítica para asegurar su integridad estructural.
 * Ajusta el conteo de niveles, puntaje máximo y marca de tiempo.
 * @param {Object} inst - Instancia del instrumento.
 * @returns {Object} Instrumento normalizado.
 */
export function normalizeRubricaInstrument(inst) {
  if (!inst || inst.type !== 'rubrica_analitica') return inst;
  inst.levelsCount = Math.max(2, Math.min(6, inst.levels?.length || 4));
  inst.maxScore = parseFloat(inst.maxTotal ?? inst.maxScore) || 20;
  inst.updatedAt = nowIso();
  return inst;
}

/**
 * Evalúa los resultados de un instrumento contra un conjunto de valores (calificaciones dadas).
 * Calcula el puntaje total obtenido y el desglose por criterio.
 * @param {Object} instrument - Definición del instrumento.
 * @param {Object} values - Mapa de valores seleccionados (ID Criterio -> ID Nivel/Puntaje).
 * @returns {Object} Resultado con puntaje total y desglose.
 */
export function evaluateInstrument(instrument, values) {
  if (!instrument || !values) return { totalScore: 0, perCriterion: [] };
  let total = 0;
  const perCriterion = (instrument.criteria || []).map(c => {
    const val = values[c.id];
    let score = 0;
    if (instrument.type === 'rubrica_analitica') {
      // Cálculo basado en factor de nivel (0.0 - 1.0) * puntos máximos del criterio
      const level = (instrument.levels || []).find(l => l.id === val);
      score = (parseFloat(level?.factor) || 0) * (parseFloat(c.maxPoints) || 0);
    } else {
      // Suma directa para listas de cotejo o escalas
      score = parseFloat(val) || 0;
    }
    total += score;
    return { id: c.id, score, value: val };
  });

  return { totalScore: total, perCriterion };
}

/**
 * Retorna una etiqueta legible en español para el tipo de instrumento técnico.
 * @param {string} type - Identificador del tipo.
 * @returns {string} Nombre descriptivo.
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
 * Sugiere un tipo de instrumento adecuado basado en el nombre y descripción de una actividad.
 * Utiliza heurística de palabras clave para determinar la complejidad pedagógica.
 * @param {Object} meta - Metadatos de la actividad (nombre, descripción, producto).
 * @returns {string} Tipo de instrumento recomendado.
 */
export function suggestInstrumentForActivity(meta) {
  const txt = `${meta.name||''} ${meta.descripcion||''} ${meta.producto||''} ${meta.tipo||''}`.toLowerCase();
  
  // Rúbricas para producciones complejas y orales
  if (txt.includes('exposición') || txt.includes('oral')) return 'rubrica_analitica';
  if (txt.includes('informe') || txt.includes('redacción') || txt.includes('escrito')) return 'rubrica_analitica';
  
  // Listas de cotejo para procedimientos y laboratorios
  if (txt.includes('experimento') || txt.includes('laboratorio')) return 'lista_cotejo_b';
  if (txt.includes('participación') || txt.includes('observable') || txt.includes('práctica en aula')) return 'lista_cotejo_a';
  
  // Escala estimativa como fallback versátil
  return 'escala_estimativa';
}
