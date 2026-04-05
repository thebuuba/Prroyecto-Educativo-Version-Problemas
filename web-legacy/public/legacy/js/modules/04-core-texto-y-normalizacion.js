// Detecta cadenas con señales típicas de texto roto por codificación UTF-8/Windows-1252.
function hasMojibakeMarkers(str) {
  if (typeof str !== 'string') return false;
  return /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\u00F0[\u0080-\u00BF]{2,3}|\uFFFD)/.test(str);
}
// Detecta palabras o frases en español que quedaron con signos de interrogación o reemplazos parciales.
function hasQuestionMarkWordCorruption(str) {
  if (typeof str !== 'string') return false;
  return /[A-Za-z]\?[A-Za-z]/.test(str)
    || /[A-Za-z]\uFFFD[A-Za-z]/.test(str)
    || /[A-Za-z0-9)]\s+\?\s+[A-Za-z0-9(]/.test(str)
    || /^\?\s+[A-Za-z]/.test(str);
}
// Intenta reinterpretar una cadena como bytes cp1252 para rescatar texto que llegó con doble codificación.
function decodeCp1252Utf8(str) {
  try {
    const bytes = new Uint8Array(Array.from(str, ch => ch.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (_) {
    return str;
  }
}
// Corrige preguntas y palabras comunes que quedaron convertidas en signos de interrogación durante una importación.
function fixQuestionMarkCorruption(str) {
  if (typeof str !== 'string' || !hasQuestionMarkWordCorruption(str)) return str;
  let fixed = str;
  // Repara signos de apertura en preguntas comunes cuando llegan como '?'.
  fixed = fixed.replace(/(^|[\s"'([{])\?([A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1])/g, '$1\u00BF$2');
  fixed = fixed.replace(/\?\s*Selecciona \u00E1rea\s*\?/gi, 'Selecciona \u00E1rea');
  fixed = fixed.replace(/\?\s*Selecciona asignatura\s*\?/gi, 'Selecciona asignatura');
  fixed = fixed.replace(/^\?\s+M\u00E1s opciones\b/gm, 'M\u00E1s opciones');
  fixed = fixed.replace(/([A-Za-z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F10-9)])\s+\?\s+([A-Za-z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F10-9(])/g, '$1 - $2');
  const replacements = [
    [/\bAq\?\b/g, 'Aqu\u00ED'],
    [/\baq\?\b/g, 'aqu\u00ED'],
    [/\bQu\?\b/g, 'Qu\u00E9'],
    [/\bqu\?\b/g, 'qu\u00E9'],
    [/\baqu\?\b/gi, 'aqu\u00ED'],
    [/per\?odo/gi, 'per\u00EDodo'],
    [/acci\?n/gi, 'acci\u00F3n'],
    [/m\?s/gi, 'm\u00E1s'],
    [/v\?lido/gi, 'v\u00E1lido'],
    [/v\?lida/gi, 'v\u00E1lida'],
    [/inv\?lido/gi, 'inv\u00E1lido'],
    [/inv\?lida/gi, 'inv\u00E1lida'],
    [/m\?ximo/gi, 'm\u00E1ximo'],
    [/m\?nimo/gi, 'm\u00EDnimo'],
    [/r\?pido/gi, 'r\u00E1pido'],
    [/r\?pida/gi, 'r\u00E1pida'],
    [/r\?pidas/gi, 'r\u00E1pidas'],
    [/matr\?cula/gi, 'matr\u00EDcula'],
    [/secci\?n/gi, 'secci\u00F3n'],
    [/a\?o/gi, 'a\u00F1o'],
    [/sesi\?n/gi, 'sesi\u00F3n'],
    [/configuraci\?n/gi, 'configuraci\u00F3n'],
    [/todav\?a/gi, 'todav\u00EDa'],
    [/a\?n/gi, 'a\u00FAn'],
    [/d\?a/gi, 'd\u00EDa'],
    [/d\?as/gi, 'd\u00EDas'],
    [/tel\?fono/gi, 'tel\u00E9fono'],
    [/instituci\?n/gi, 'instituci\u00F3n'],
    [/informaci\?n/gi, 'informaci\u00F3n'],
    [/evaluaci\?n/gi, 'evaluaci\u00F3n'],
    [/planificaci\?n/gi, 'planificaci\u00F3n'],
    [/resoluci\?n/gi, 'resoluci\u00F3n'],
    [/participaci\?n/gi, 'participaci\u00F3n'],
    [/producci\?n/gi, 'producci\u00F3n'],
    [/exposici\?n/gi, 'exposici\u00F3n'],
    [/observaci\?n/gi, 'observaci\u00F3n'],
    [/descripci\?n/gi, 'descripci\u00F3n'],
    [/duraci\?n/gi, 'duraci\u00F3n'],
    [/selecci\?n/gi, 'selecci\u00F3n'],
    [/organizaci\?n/gi, 'organizaci\u00F3n'],
    [/intenci\?n/gi, 'intenci\u00F3n'],
    [/sincronizaci\?n/gi, 'sincronizaci\u00F3n'],
    [/redacci\?n/gi, 'redacci\u00F3n'],
    [/ponderaci\?n/gi, 'ponderaci\u00F3n'],
    [/exportaci\?n/gi, 'exportaci\u00F3n'],
    [/educaci\?n/gi, 'educaci\u00F3n'],
    [/f\?sica/gi, 'f\u00EDsica'],
    [/cient\?fica/gi, 'cient\u00EDfica'],
    [/cient\?fico/gi, 'cient\u00EDfico'],
    [/tecnol\?gica/gi, 'tecnol\u00F3gica'],
    [/tecnolog\?a/gi, 'tecnolog\u00EDa'],
    [/pedag\?gica/gi, 'pedag\u00F3gica'],
    [/acad\?mica/gi, 'acad\u00E9mica'],
    [/did\?ctica/gi, 'did\u00E1ctica'],
    [/autom\?tica/gi, 'autom\u00E1tica'],
    [/autom\?ticamente/gi, 'autom\u00E1ticamente'],
    [/anal\?tica/gi, 'anal\u00EDtica'],
    [/pr\?ctica/gi, 'pr\u00E1ctica'],
    [/b\?sico/gi, 'b\u00E1sico'],
    [/b\?sica/gi, 'b\u00E1sica'],
    [/b\?sicos/gi, 'b\u00E1sicos'],
    [/l\?gico/gi, 'l\u00F3gico'],
    [/cr\?tico/gi, 'cr\u00EDtico'],
    [/cr\?tica/gi, 'cr\u00EDtica'],
    [/t\?rminos/gi, 't\u00E9rminos'],
    [/t\?cnica/gi, 't\u00E9cnica'],
    [/t\?cnicas/gi, 't\u00E9cnicas'],
    [/t\?tulo/gi, 't\u00EDtulo'],
    [/subt\?tulo/gi, 'subt\u00EDtulo'],
    [/s\?ntesis/gi, 's\u00EDntesis'],
    [/an\?lisis/gi, 'an\u00E1lisis'],
    [/m\?todo/gi, 'm\u00E9todo'],
    [/m\?todos/gi, 'm\u00E9todos'],
    [/di\?logo/gi, 'di\u00E1logo'],
    [/g\?nero/gi, 'g\u00E9nero'],
    [/h\?bitos/gi, 'h\u00E1bitos'],
    [/empat\?a/gi, 'empat\u00EDa'],
    [/autonom\?a/gi, 'autonom\u00EDa'],
    [/investigaci\?n/gi, 'investigaci\u00F3n'],
    [/comprensi\?n/gi, 'comprensi\u00F3n'],
    [/curr\?culo/gi, 'curr\u00EDculo'],
    [/apreciaci\?n/gi, 'apreciaci\u00F3n'],
    [/comparaci\?n/gi, 'comparaci\u00F3n'],
    [/relaci\?n/gi, 'relaci\u00F3n'],
    [/caracter\?sticas/gi, 'caracter\u00EDsticas'],
    [/gr\?ficas/gi, 'gr\u00E1ficas'],
    [/qu\?mica/gi, 'qu\u00EDmica'],
    [/biolog\?a/gi, 'biolog\u00EDa'],
    [/geograf\?a/gi, 'geograf\u00EDa'],
    [/filosof\?a/gi, 'filosof\u00EDa'],
    [/estad\?stica/gi, 'estad\u00EDstica'],
    [/trigonometr\?a/gi, 'trigonometr\u00EDa'],
    [/ciudadan\?a/gi, 'ciudadan\u00EDa'],
    [/formaci\?n/gi, 'formaci\u00F3n'],
    [/art\?stica/gi, 'art\u00EDstica'],
    [/dise\?o/gi, 'dise\u00F1o'],
    [/se\?ora/gi, 'se\u00F1ora'],
    [/ma\?ana/gi, 'ma\u00F1ana'],
    [/mi\?rcoles/gi, 'mi\u00E9rcoles'],
    [/s\?bado/gi, 's\u00E1bado'],
    [/mod\?ulos/gi, 'm\u00F3dulos'],
    [/hip\?tesis/gi, 'hip\u00F3tesis'],
    [/prevenci\?n/gi, 'prevenci\u00F3n'],
  ];
  replacements.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });
  return fixed;
}
// Sustituye el glyph de reemplazo por letras válidas cuando el texto perdió el carácter original.
function fixReplacementGlyphCorruption(str) {
  if (typeof str !== 'string' || str.indexOf('\uFFFD') === -1) return str;
  const replacements = [
    [/t[\uFFFD]tulo/gi, 't\u00edtulo'],
    [/subt[\uFFFD]tulo/gi, 'subt\u00edtulo'],
    [/modificaci[\uFFFD]n/gi, 'modificaci\u00f3n'],
    [/secci[\uFFFD]n/gi, 'secci\u00f3n'],
    [/planificaci[\uFFFD]n/gi, 'planificaci\u00f3n'],
    [/did[\uFFFD]ctica/gi, 'did\u00e1ctica'],
    [/evaluaci[\uFFFD]n/gi, 'evaluaci\u00f3n'],
    [/dise[\uFFFD]o/gi, 'dise\u00f1o'],
    [/per[\uFFFD]odo/gi, 'per\u00edodo'],
    [/a[\uFFFD]o/gi, 'a\u00f1o'],
    [/d[\uFFFD]a/gi, 'd\u00eda'],
    [/a[\uFFFD]rea/gi, '\u00e1rea'],
    [/sub[\uFFFD]rea/gi, 'sub\u00e1rea'],
    [/espa[\uFFFD]ol/gi, 'espa\u00f1ol'],
    [/espa[\uFFFD]ola/gi, 'espa\u00f1ola'],
    [/matem[\uFFFD]tica/gi, 'matem\u00e1tica'],
    [/educaci[\uFFFD]n/gi, 'educaci\u00f3n'],
    [/f[\uFFFD]sica/gi, 'f\u00edsica'],
    [/l[\uFFFD]gico/gi, 'l\u00f3gico'],
    [/cr[\uFFFD]tico/gi, 'cr\u00edtico'],
    [/resoluci[\uFFFD]n/gi, 'resoluci\u00f3n'],
    [/cient[\uFFFD]fica/gi, 'cient\u00edfica'],
    [/tecnol[\uFFFD]gica/gi, 'tecnol\u00f3gica'],
    [/ciudadan[\uFFFD]a/gi, 'ciudadan\u00eda'],
    [/g[\uFFFD]nero/gi, 'g\u00e9nero'],
    [/ingl[\uFFFD]s/gi, 'ingl\u00e9s'],
    [/franc[\uFFFD]s/gi, 'franc\u00e9s'],
    [/art[\uFFFD]stica/gi, 'art\u00edstica'],
    [/formaci[\uFFFD]n/gi, 'formaci\u00f3n'],
    [/curr[\uFFFD]culo/gi, 'curr\u00edculo'],
    [/comprensi[\uFFFD]n/gi, 'comprensi\u00f3n'],
    [/producci[\uFFFD]n/gi, 'producci\u00f3n'],
    [/as[\uFFFD]/gi, 'as\u00ed'],
    [/m[\uFFFD]s/gi, 'm\u00e1s'],
    [/a[\uFFFD]n/gi, 'a\u00fan'],
    [/\b[\uFFFD]tica\b/gi, '\u00e9tica'],
    [/^\s*[\uFFFD]ltima/gi, '\u00daltima'],
  ];
  let fixed = str;
  replacements.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });
  if (hasMojibakeMarkers(fixed)) {
    const decoded = decodeCp1252Utf8(fixed);
    if (decoded && scoreMojibake(decoded) <= scoreMojibake(fixed)) fixed = decoded;
  }
  return fixed;
}
// Da una puntuación simple al texto roto para comparar cuál versión quedó menos dañada.
function scoreMojibake(str) {
  if (typeof str !== 'string') return 0;
  const markers = ['Ã','Â','â','ð','ï?½'];
  return markers.reduce((acc, m) => {
    const parts = str.split(m);
    return acc + (parts.length > 1 ? parts.length - 1 : 0);
  }, 0);
}
// Repara una cadena aislada aplicando primero decodificación y luego reemplazos directos de texto roto.
function fixMojibakeText(str) {
  if (!hasMojibakeMarkers(str) && !hasQuestionMarkWordCorruption(str)) return str;
  let best = str;
  if (hasMojibakeMarkers(best)) {
    for (let i = 0; i < 2; i++) {
      const candidate = decodeCp1252Utf8(best);
      if (!candidate || candidate === best) break;
      if (scoreMojibake(candidate) <= scoreMojibake(best)) best = candidate;
    }
  }
  const directReplacements = [
    [/\u00C3\u00A1/g, '\u00E1'],
    [/\u00C3\u00A9/g, '\u00E9'],
    [/\u00C3\u00AD/g, '\u00ED'],
    [/\u00C3\u00B3/g, '\u00F3'],
    [/\u00C3\u00BA/g, '\u00FA'],
    [/\u00C3\u00B1/g, '\u00F1'],
    [/\u00C3\u0081/g, '\u00C1'],
    [/\u00C3\u0089/g, '\u00C9'],
    [/\u00C3\u008D/g, '\u00CD'],
    [/\u00C3\u0093/g, '\u00D3'],
    [/\u00C3\u009A/g, '\u00DA'],
    [/\u00C3\u0091/g, '\u00D1'],
    [/\u00C3\u00BC/g, '\u00FC'],
    [/\u00C3\u009C/g, '\u00DC'],
    [/\u00C2\u00BF/g, '\u00BF'],
    [/\u00C2\u00A1/g, '\u00A1'],
    [/\u00C2\u00B0/g, '\u00B0'],
    [/\u00C2\u00BA/g, '\u00BA'],
    [/\u00C2\u00AA/g, '\u00AA'],
    [/\u00C2\u00A0/g, ' '],
  ];
  directReplacements.forEach(([pattern, replacement]) => {
    best = best.replace(pattern, replacement);
  });
  best = fixQuestionMarkCorruption(best);
  best = fixReplacementGlyphCorruption(best);
  return best;
}
// Recorre un árbol de estado o datos anidados y corrige todos los textos dañados que encuentre.
function sanitizeTextTree(root) {
  let changed = false;
  // Gestiona walk.
  const walk = (node) => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const curr = node[i];
        if (typeof curr === 'string') {
          const fixed = fixMojibakeText(curr);
          if (fixed !== curr) { node[i] = fixed; changed = true; }
        } else if (curr && typeof curr === 'object') {
          walk(curr);
        }
      }
      return node;
    }
    Object.keys(node).forEach((k) => {
      const curr = node[k];
      if (typeof curr === 'string') {
        const fixed = fixMojibakeText(curr);
        if (fixed !== curr) { node[k] = fixed; changed = true; }
      } else if (curr && typeof curr === 'object') {
        walk(curr);
      }
    });
    return node;
  };
  walk(root);
  return changed;
}
// Reescribe el estado actual con su versión saneada para que el almacenamiento local quede limpio.
function repairUtf8State(targetState) {
  if (!targetState || typeof targetState !== 'object') return false;
  let changed = false;
  if (sanitizeTextTree(targetState.profile || {})) changed = true;
  if (sanitizeTextTree(targetState.templates || [])) changed = true;
  if (sanitizeTextTree(targetState.blockCfg || {})) changed = true;
  if (sanitizeTextTree(targetState.groupConfigs || {})) changed = true;
  if (sanitizeTextTree(targetState.periodGroupConfigs || {})) changed = true;
  if (sanitizeTextTree(targetState.lessonPlans || [])) changed = true;
  if (sanitizeTextTree(targetState.lessonPlanUi || {})) changed = true;
  if (sanitizeTextTree(targetState.instruments || [])) changed = true;
  if (sanitizeTextTree(targetState.usuarios || [])) changed = true;
  if (sanitizeTextTree(targetState.studentDirectory || [])) changed = true;
  if (sanitizeTextTree(targetState.grades || [])) changed = true;
  if (sanitizeTextTree(targetState.secciones || [])) changed = true;
  return changed;
}
// Ejecuta la reparación global de texto del estado y avisa al usuario si la limpieza produjo cambios.
function repairUtf8Text(showToast = true) {
  const changed = repairUtf8State(S);
  if (changed) persist();
  refreshTop();
  go(currentPage);
  if (showToast) {
    toast(changed ? 'Texto reparado (UTF-8)' : 'No se detectó texto corrupto');
  }
}
// Recorre el DOM visible y repara textos ya pintados que todavía conserven corrupción de codificación.
function repairRenderedText(root = document.body) {
  if (!root) return;
  const candidateText = `${root.textContent || ''} ${(root.getAttribute?.('placeholder') || '')} ${(root.getAttribute?.('title') || '')} ${(root.getAttribute?.('aria-label') || '')}`;
  if (!hasMojibakeMarkers(candidateText) && !hasQuestionMarkWordCorruption(candidateText)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const fixed = fixMojibakeText(node.nodeValue);
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  });
  root.querySelectorAll('*').forEach((el) => {
    ['placeholder', 'title', 'aria-label'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      const fixed = fixMojibakeText(value);
      if (fixed !== value) el.setAttribute(attr, fixed);
    });
  });
}
// Marca qué inputs conviene tratar con asistencia de escritura sin tocar campos sensibles o irrelevantes.
function isWritingAssistEligibleField(el) {
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || '').toUpperCase();
  if (tag === 'TEXTAREA') return !el.readOnly && !el.disabled;
  if (tag !== 'INPUT') return false;
  const type = String(el.type || 'text').toLowerCase();
  if (['email', 'password', 'url', 'number', 'date', 'datetime-local', 'time', 'month', 'week', 'color', 'file', 'hidden', 'range', 'checkbox', 'radio'].includes(type)) return false;
  if (el.readOnly || el.disabled) return false;
  const idNameHint = `${el.id || ''} ${el.name || ''} ${el.getAttribute('data-format') || ''}`.toLowerCase();
  if (/(matricula|matrícula|cedula|c?dula|telefono|teléfono|correo|email|url|codigo|c?digo)/.test(idNameHint)) return false;
  return true;
}
// Vincula normalización en vivo a un campo concreto sin interferir con la posición del cursor.
function applyWritingAssistToField(el) {
  if (!isWritingAssistEligibleField(el)) return;
  el.setAttribute('lang', 'es-DO');
  el.setAttribute('spellcheck', 'true');
  if (!el.hasAttribute('autocapitalize')) el.setAttribute('autocapitalize', 'sentences');
  if (!el.hasAttribute('autocorrect') || String(el.getAttribute('autocorrect')).toLowerCase() === 'off') {
    el.setAttribute('autocorrect', 'on');
  }
}
// Activa la asistencia de escritura sobre una o varias raíces DOM para que el saneo ocurra en los paneles visibles.
function enableWritingAssist(...roots) {
  const targets = roots.filter(Boolean);
  if (!targets.length) return;
  targets.forEach((root) => {
    if (isWritingAssistEligibleField(root)) applyWritingAssistToField(root);
    root.querySelectorAll?.('input, textarea, [contenteditable="true"]').forEach((field) => {
      applyWritingAssistToField(field);
    });
  });
}
// Aplica la misma lógica de asistencia, pero enfocada en las celdas y campos del módulo de asistencia.
function enableAttendanceWritingAssist(root) {
  if (!root) return;
  root.querySelectorAll?.('.attendance-day-input, .attendance-day-reason-input').forEach((field) => {
    applyWritingAssistToField(field);
  });
}
// Normaliza texto en español preservando mayúsculas, tildes y abreviaturas comunes del editor.
function normalizeSpanishDraftText(value, options = {}) {
  if (value == null) return '';
  let next = fixMojibakeText(restoreSpanishQuestionCorruption(String(value)));
  const preserveCase = options.preserveCase === true;
  next = next.replace(/\s+/g, ' ');
  next = next.replace(/\s+([,.;:!?])/g, '$1');
  next = next.replace(/([,.;:!?])(?!\s|$)/g, '$1 ');
  // NOTE:
  // Do not split connector words inside tokens (e.g. "Presente" -> "Pres en te").
  // That heuristic produced visual spacing bugs across planning forms.
  next = next.trim();
  if (!preserveCase) {
    next = next.replace(/^([a-z\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F1])/u, (m) => m.toLocaleUpperCase('es-DO'));
  }
  return next;
}
// Reescribe el valor del input sin mover el cursor más de lo necesario.
function applyLiveNormalizedValue(input, nextValue) {
  if (!input) return nextValue;
  const currentValue = String(input.value || '');
  if (currentValue === nextValue) return nextValue;
  const selectionStart = typeof input.selectionStart === 'number' ? input.selectionStart : currentValue.length;
  const selectionEnd = typeof input.selectionEnd === 'number' ? input.selectionEnd : currentValue.length;
  const tail = currentValue.length - selectionEnd;
  input.value = nextValue;
  const nextCursor = Math.max(0, nextValue.length - tail);
  try {
    input.setSelectionRange(nextCursor, nextCursor);
  } catch (_) {}
  return nextValue;
}
// Normaliza el nombre de una actividad mientras se escribe para mantener el draft limpio.
function handleActNameInput(b, actId, input) {
  if (!input) return;
  const normalized = normalizeSpanishDraftText(input.value);
  const finalValue = applyLiveNormalizedValue(input, normalized);
  updateActName(b, actId, finalValue);
}
// Revalida el nombre de la actividad al salir del campo y consolida el texto final.
function handleActNameBlur(b, actId, input) {
  if (!input) return;
  const normalized = normalizeSpanishDraftText(input.value);
  const finalValue = applyLiveNormalizedValue(input, normalized);
  updateActName(b, actId, finalValue);
}
