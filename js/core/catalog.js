import { SECONDARY_CURRICULUM_GRADE_KEYS } from './constants.js';

export const LESSON_PLAN_RESOURCE_PRESETS = [
  'Pizarra', 'Cuaderno', 'Lápiz', 'Marcadores', 'Borrador', 'Libro de texto',
  'Guía impresa', 'Imágenes', 'Diapositivas', 'Video', 'Simulador',
  'Computadora', 'Televisor', 'Internet',
];

export const LESSON_PLAN_TRANSVERSAL_AXES = [
  { value: 'Educación ambiental y desarrollo sostenible', description: 'Promueve el cuidado del medio ambiente y el uso responsable de los recursos.' },
  { value: 'Educación en valores y ciudadanía', description: 'Fomenta el respeto, la responsabilidad y la convivencia.' },
  { value: 'Educación para la democracia y la convivencia', description: 'Promueve el diálogo, la participación y la resolución pacífica de conflictos.' },
  { value: 'Educación para la salud y el bienestar', description: 'Favorece hábitos de vida saludable y cuidado integral de la persona.' },
  { value: 'Educación para el trabajo y la productividad', description: 'Desarrolla responsabilidad, compromiso y valoración del trabajo.' },
  { value: 'Educación en igualdad y equidad de género', description: 'Promueve el respeto, la inclusión y la equidad entre las personas.' },
];

export const LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS = [
  'Competencia comunicativa',
  'Competencia de pensamiento lógico, creativo y crítico',
  'Competencia de resolución de problemas',
  'Competencia ética y ciudadana',
  'Competencia científica y tecnológica',
  'Competencia ambiental y de la salud',
  'Competencia de desarrollo personal y espiritual',
];

export const LESSON_PLAN_ACTIVITY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'grupal', label: 'Grupal' },
  { value: 'plenario', label: 'Plenario' },
];

export const LESSON_PLAN_CLASS_DURATION_OPTIONS = [
  { value: '1', label: '1 hora de clase' },
  { value: '2', label: '2 horas de clase' },
];

export const LESSON_PLAN_TECHNIQUE_OPTIONS = [
  'Observación directa', 'Producción escrita', 'Exposición', 'Resolución de ejercicios',
  'Debate guiado', 'Práctica de laboratorio', 'Mapa conceptual', 'Cuadro comparativo',
];

export const LESSON_PLAN_BLOCK_LABELS = {
  B1: 'Comunicativa',
  B2: 'Pensamiento lógico, creativo y crítico / Resolución de problemas',
  B3: 'Ética y ciudadanía / Desarrollo personal y espiritual',
  B4: 'Científica y tecnológica / Ambiental y de la salud',
};

export const LENGUA_ESPANOLA_SECONDARY_SPECIFIC_COMPETENCIES = {
  '1ro': {
    'Competencia comunicativa': 'Se comunica con claridad en diferentes contextos, siguiendo los procesos de comprensión y producción oral y escrita, con creatividad, al emplear adecuadamente un tipo de texto (funcional o literario), las TIC, así como otros recursos y medios.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Utiliza secuencias argumentativas (hechos, ejemplos, analogías, argumentos y contra argumentos), en discursos orales y escritos, creando nuevos conocimientos a partir de procesos de comprensión y producción de textos orales y escritos abordados con temas y problemas sociales de su realidad.',
    'Competencia de resolución de problemas': 'Identifica problemas de su vida estudiantil o cotidiana a través de un tipo de texto específico y apropiado, como punto de partida para su estudio y solución.',
    'Competencia ética y ciudadana': 'Analiza textos variados de manera oral o escrita que ponen de relieve hechos y tradiciones históricas relevantes, identificando nuevas relaciones sociales al reconocer y valorar el patrimonio natural y sociocultural dominicano.',
    'Competencia científica y tecnológica': 'Demuestra conocimiento de procesos investigativos científicos sencillos y del uso de tecnología de acuerdo con su grado, a través de textos científicos y especialmente los de secuencia expositivo-explicativa.',
    'Competencia ambiental y de la salud': 'Explica con claridad situaciones sobre salud, medioambiente y la comunidad, mediante textos de diferentes secuencias y géneros, a través de herramientas tecnológicas y otros medios y recursos.',
    'Competencia de desarrollo personal y espiritual': 'Demuestra conocimiento y comprensión de sí mismo y de los demás al expresar su percepción del mundo, a partir de un tipo de texto favorable a las situaciones y a las personas.',
  },
  '2do': {
    'Competencia comunicativa': 'Comunica sus ideas y experiencias en diferentes situaciones, mediante un género textual (funcional o literario) abordado desde la comprensión y producción oral y escrita, mostrando creatividad y destrezas en el uso de la lengua, utilizando medios y recursos tecnológicos y de otros tipos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Produce textos orales y escritos variados a partir de inferencias de comprensión y producción textual, demostrando un pensamiento estructurado, derivando en conclusiones razonables y lógicas.',
    'Competencia de resolución de problemas': 'Utiliza textos específicos variados (orales y escritos) que apoyan el desarrollo de una investigación de carácter científico, seleccionando información con criterios de relevancia, pertinencia, validez y confiabilidad.',
    'Competencia ética y ciudadana': 'Usa textos variados de secuencia argumentativa, con los que conoce y cuestiona prácticas sociales de ciudadanía en el entorno local, nacional e internacional, confrontándolas con los valores universales en discursos analíticos y propositivos.',
    'Competencia científica y tecnológica': 'Utiliza textos de secuencia expositiva-explicativa de manera oral y escrita, en la divulgación de hallazgos científicos y sociales, así como de los avances tecnológicos a lo largo del tiempo, haciendo uso de variadas herramientas que proporcionan las tecnologías de la información y la comunicación (TIC).',
    'Competencia ambiental y de la salud': 'Usa textos diversos en la divulgación y promoción de situaciones de salud y ambiente, abordando temas y problemas de actualidad, mediante el uso de herramientas tecnológicas, entre otras.',
    'Competencia de desarrollo personal y espiritual': 'Utiliza textos literarios como manifestación de la lengua y recurso para promover valores universales y fortalecer la dimensión humanista.',
  },
  '3ro': {
    'Competencia comunicativa': 'Demuestra dominio, desenvolvimiento y creatividad al comunicarse eficazmente de manera personal y colectiva en su entorno familiar, escolar y de la comunidad, utilizando un género textual (funcional o literario), a partir de la comprensión y producción oral y escrita, la utilización responsable de las TIC y demás medios.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Demuestra la validez de las informaciones sostenidas en los juicios, puntos de vista, conclusiones, acciones y pensamientos que construye, usando un género textual que respete la diversidad de opiniones.',
    'Competencia de resolución de problemas': 'Presenta resultados de investigaciones a través de textos específicos, orales y escritos, como ensayos o informes, que evidencian la solución de problemas en contextos determinados, con una postura de criticidad, valoración y respeto a los datos citados.',
    'Competencia ética y ciudadana': 'Produce textos en la elaboración de proyectos encaminados a la construcción de una ciudadanía responsable, abierta e inclusiva que busca soluciones colectivas a los problemas sociales.',
    'Competencia científica y tecnológica': 'Expone investigaciones científicas sencillas que realiza, apoyándose en el uso de textos de secuencia expositiva-explicativa y en actos de intercomunicación que se desarrollan en la escuela y otros contextos, tomando en cuenta su conocimiento en la utilización de variadas herramientas tecnológicas con que cuenta.',
    'Competencia ambiental y de la salud': 'Promueve comportamientos y valores sobre la conservación de la salud, de la naturaleza y sus ecosistemas, mediante el uso de textos variados y a través del desarrollo de actividades de intercomunicación en diferentes contextos de la comunidad.',
    'Competencia de desarrollo personal y espiritual': 'Valora y promueve el uso de la lengua oral y escrita al realizar lecturas y escrituras reflexivas, canalizando emociones y sentimientos, hacia el fortalecimiento de las relaciones humanas y el respeto a la dignidad.',
  },
  '4to': {
    'Competencia comunicativa': 'Emplea adecuadamente un género textual, siguiendo los procesos de comprensión y producción oral y escrita con creatividad, así como el uso de las TIC y otros recursos y medios, al comunicarse en diferentes contextos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Usa secuencias argumentativas (hechos, ejemplos, analogías, argumentos y contraargumentos), en discursos orales y escritos, abordados con temas sociales de su realidad y fuera de esta.',
    'Competencia de resolución de problemas': 'Describe problemas de su vida estudiantil, familiar y social, utilizando un tipo de texto como el informe de investigación, en el punto de partida para su estudio y aporte de posibles soluciones.',
    'Competencia ética y ciudadana': 'Sintetiza a través de textos variados relaciones socioculturales de entornos diversos, valorando las propiedades naturales que ponen de relieve hechos y tradiciones históricas.',
    'Competencia científica y tecnológica': 'Explica conocimientos de procesos investigativos científicos y del uso de tecnología, a través de textos de secuencia expositiva-explicativa, acorde con su grado y las necesidades contextuales.',
    'Competencia ambiental y de la salud': 'Manifiesta conocimientos y experiencia sobre situaciones relacionadas con salud, medioambiente y la comunidad, mediante textos de secuencias y géneros variados, a través de herramientas tecnológicas y otros medios y recursos.',
    'Competencia de desarrollo personal y espiritual': 'Evidencia conocimiento y comprensión de sí mismo y de los demás, expresando su percepción del mundo, mediante un tipo de texto adecuado a las situaciones personales y sociales.',
  },
  '5to': {
    'Competencia comunicativa': 'Muestra destrezas lingüísticas al exponer ideas y experiencias en diferentes situaciones de comunicación social, mediante un tipo de texto (funcional o literario) conveniente desde la comprensión y producción oral y escrita, usando medios y recursos diversos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Analiza textos variados a partir de inferencias, demostrando un pensamiento estructurado que le lleva a conclusiones razonables y lógicas en diferentes contextos.',
    'Competencia de resolución de problemas': 'Selecciona textos específicos que apoyan el desarrollo de una investigación científica, siguiendo criterios de relevancia, pertinencia, validez y confiabilidad para la solución de problemas.',
    'Competencia ética y ciudadana': 'Emplea diversidad de textos de secuencia argumentativa, con los que conoce y cuestiona las prácticas sociales de ciudadanía en el entorno local y nacional, confrontándolas con valores universales.',
    'Competencia científica y tecnológica': 'Divulga a través de textos de secuencia expositiva-explicativa hallazgos científicos, sociales y tecnológicos a lo largo del tiempo, para aportar soluciones a problemas de diferentes contextos.',
    'Competencia ambiental y de la salud': 'Publica informaciones sobre temas relacionados con salud y medio ambiente, a través de textos como catálogo, receta, artículos de opinión e instructivos, en el ámbito escolar y comunitario, haciendo uso de herramientas tecnológicas, entre otras.',
    'Competencia de desarrollo personal y espiritual': 'Utiliza textos literarios y de otros tipos, para manifestar sus sentimientos, emociones e inquietudes en la promoción de valores universales y fortalecer la dimensión humanista.',
  },
  '6to': {
    'Competencia comunicativa': 'Exhibe desenvolvimiento y creatividad al comunicarse eficazmente de manera personal y colectiva, utilizando un modelo textual, a partir de la comprensión y producción, con uso ético y responsable de plataformas tecnológicas y diferentes medios y recursos.',
    'Competencia de pensamiento lógico, creativo y crítico': 'Expone la validez de informaciones diversas sostenidas en juicios, puntos de vista, conclusiones y acciones, usando un género textual conveniente, respetando las demás opiniones.',
    'Competencia de resolución de problemas': 'Presenta resultados de investigaciones a través de textos convenientes que evidencian soluciones de problemas, tomando en cuenta la audiencia y manifestando postura crítica, valorativa y de respeto frente a lo que se lee, escucha y escribe.',
    'Competencia ética y ciudadana': 'Usa textos de secuencia argumentativa en la elaboración de proyectos como elemento clave, hacia la construcción de una ciudadanía responsable y dinámica que busca solución de problemas colectivos.',
    'Competencia científica y tecnológica': 'Explica resultados de investigaciones que realiza, apoyándose en el uso de textos de secuencia expositiva-explicativa, en actos de intercomunicación que se desarrollan en la escuela y otro contexto, utilizando herramientas tecnológicas y otros recursos.',
    'Competencia ambiental y de la salud': 'Utiliza sus conocimientos en la promoción y divulgación de comportamientos y valores sobre la conservación de la salud, la naturaleza y sus ecosistemas, mediante el uso de textos y a través de actividades de intercomunicación en diferentes contextos de la comunidad, apoyados en recursos variados.',
    'Competencia de desarrollo personal y espiritual': 'Canaliza emociones y sentimientos en lecturas y escrituras reflexivas, a través de un tipo de texto conveniente, fortaleciendo las relaciones humanas y el respeto a la dignidad propia y de otras personas.',
  },
};

export const OFFICIAL_CURRICULUM_SPECIFIC_COMPETENCY_REGISTRY = {
  Secundaria: SECONDARY_CURRICULUM_GRADE_KEYS.reduce((acc, gradeKey) => {
    acc[gradeKey] = {
      'Lengua Española': {
        'Lengua Española': { ...(LENGUA_ESPANOLA_SECONDARY_SPECIFIC_COMPETENCIES[gradeKey] || {}) },
      },
    };
    return acc;
  }, {}),
};

export const LESSON_PLAN_CURRICULUM_PRESETS = {
  fundamentalCompetencies: LESSON_PLAN_FUNDAMENTAL_COMPETENCY_OPTIONS,
  specificCompetencies: ['Explica fenómenos', 'Argumenta con evidencia', 'Aplica procedimientos', 'Trabaja de forma colaborativa'],
  conceptualContents: ['Conceptos clave del tema', 'Definiciones básicas', 'Características principales', 'Relación entre conceptos'],
  proceduralContents: ['Observación guiada', 'Análisis de casos', 'Resolución de ejercicios', 'Socialización de hallazgos'],
  attitudinalContents: ['Respeto por las ideas', 'Responsabilidad', 'Trabajo en equipo', 'Cuidado del entorno'],
  indicators: ['Identifica conceptos esenciales', 'Explica con sus palabras', 'Aplica lo aprendido en una actividad', 'Participa activamente'],
};

export const LESSON_PLAN_CONCEPTUAL_CATALOG = {
  'Lengua Española': {
    '1ro': [
      { topic: 'La noticia', subtopics: ['Función y estructura', 'Interrogantes', 'Elementos que hacen que un hecho sea noticia', 'Conectores de orden y temporales', 'Modo y tiempos verbales', 'Sinónimos', 'La puntuación', 'Siglas, abreviaturas y acrónimos', 'Elementos paratextuales'] },
      { topic: 'La guía turística', subtopics: ['Estructura', 'Estructura (portada, información, imágenes y cierre)', 'Características: apariencia, estímulos, atractivos y contenido', 'Sustantivos abstractos (alegría, laboriosidad, servicio, etc.)', 'Sustantivos propios y comunes de lugares', 'Adjetivos calificativos y determinativos', 'Vocabulario atractivo y persuasivo', 'Verbos en presente de indicativo', 'Oraciones exclamativas', 'Oraciones interrogativas', 'Sintagma nominal (núcleo, modificador directo y modificador indirecto)', 'Información gráfica (mapas, gráficos, dibujos, fotografías)'] },
      { topic: 'El informe de lectura', subtopics: ['Función', 'Estructura (título del informe, introducción, desarrollo, conclusión)', 'El resumen como estrategia', 'Pasos para realizar un resumen', 'Adjetivos', 'Verbos en presente y en pasado de indicativo', 'Conectores de ejemplificación'] },
      { topic: 'El afiche', subtopics: ['Función y estructura', 'El afiche como texto argumentativo', 'Situación comunicativa', 'Recursos poéticos: metáforas, pleonasmos, elipsis, exageración', 'Argumentos para convencer', 'El imperativo', 'Lo connotativo expresivo', 'Palabras y frases de prevención o alerta', 'Verbos y perífrasis de obligación o posibilidad'] },
      { topic: 'El cuento policíaco y detectivesco', subtopics: ['Función y estructura', 'Características: el ambiente, la trama y los personajes', 'El narrador', 'Recursos lingüísticos y literarios', 'Los actantes', 'Verbo en pretérito indefinido y en pretérito imperfecto del indicativo', 'Adverbios de tiempo y espacio', 'Adjetivos', 'Conectores, coordinantes y de consecuencia'] },
      { topic: 'El caligrama', subtopics: ['Función y estructura', 'La tipografía, caligrafía', 'Imagen visual', 'El tema del poema', 'El verso libre', 'Figuras literarias: epíteto, anáfora, comparación, personificación y metáfora', 'Sustantivos', 'Adjetivos', 'Descripciones'] },
    ],
    '2do': [
      { topic: 'La noticia', subtopics: ['Función y estructura', 'Interrogantes en la noticia', 'Características de la noticia', 'Elementos que hacen un hecho sea noticia', 'Oraciones coordinadas y subordinadas', 'Elementos paratextuales', 'Sinónimos', 'Tiempos verbales: pretérito perfecto simple y pretérito pluscuamperfecto', 'Las oraciones, los párrafos en el texto'] },
      { topic: 'La guía turística', subtopics: ['Función y estructura', 'Características: apariencia, estímulos, atractivo y contenido', 'Sustantivos propios, comunes, abstractos', 'Verbos en presente de indicativo', 'Oraciones exclamativas, interrogativas', 'Conectores espaciales', 'Adjetivos: calificativos y determinativos', 'Vocabulario adecuado', 'Atractivo y persuasivo', 'Información gráfica', 'Los signos auxiliares'] },
      { topic: 'El artículo expositivo', subtopics: ['Función y estructura', 'Modo de organización problema-solución', 'Verbos en presente del modo indicativo', 'Oraciones interrogativas', 'El párrafo', 'Idea principal y secundaria', 'El adjetivo', 'La concordancia', 'Pronombres demostrativos', 'Conectores de causa, efecto, finalidad y contraste', 'Construcciones comparativas'] },
      { topic: 'El informe de lectura', subtopics: ['Función y estructura', 'El resumen como estrategia de comprensión', 'El párrafo', 'Estructura y características', 'La oración temática', 'Verbos en presente, pretérito perfecto simple, pretérito imperfecto del modo indicativo', 'Resumen del texto literario'] },
      { topic: 'El cuento de amor y amistad', subtopics: ['Función y estructura', 'Autores de cuentos de amor: Emilia Pardo Bazán, Oscar Wilde, Rafael Altamira, Horacio Quiroga, Borja Rodríguez Gutiérrez, Juan Ruiz', 'Arcipreste de Hita, y otros', 'Elementos del cuento', 'El tiempo presente y el pretérito imperfecto del modo indicativo', 'El tiempo presente y el pretérito imperfecto del modo subjuntivo', 'Recursos literarios: comparación, metáfora, epíteto', 'Adjetivos', 'El diálogo de estilo directo e indirecto'] },
      { topic: 'La décima espinela', subtopics: ['Función y estructura', 'Verso octosílabo', 'Figuras literarias', 'Interjecciones y exclamaciones'] },
    ],
    '3ro': [
      { topic: 'La entrevista', subtopics: ['Función y estructura', 'Roles de los/as participantes', 'Tipos de entrevista: según el objetivo y la modalidad', 'Oraciones interrogativas', 'Los pronombres interrogativos y exclamativos', 'El registro formal e informal', 'Sustantivos abstractos', 'Formas verbales en primera persona'] },
      { topic: 'La crónica', subtopics: ['Función y estructura narrativa', 'Características de la crónica', 'Conectores de secuenciación temporal', 'Adverbios de modo', 'Sinónimos y expresiones sinónimas', 'Preposiciones y locuciones preposicionales', 'Modificadores circunstanciales', 'Pronombres personales, demostrativos e indefinidos', 'Oraciones coordinadas, yuxtapuestas y subordinadas'] },
      { topic: 'El catálogo', subtopics: ['Función y estructura', 'Elementos paratextuales del editor y del autor', 'Palabras compuestas', 'Hipónimos', 'Términos en latín', 'Adjetivos', 'El gerundio', 'Números y viñetas', 'Vocabulario', 'Información gráfica'] },
      { topic: 'El informe de experimento', subtopics: ['Función y estructura', 'Verbos impersonales', 'Perífrasis verbales', 'Conectores de secuenciación, causalidad', 'Adverbios de modo', 'Frases incidentales', 'Vocabulario temático', 'Palabras compuestas', 'Gráficas, tablas, diagramas y dibujos', 'Mapas conceptuales'], note: 'Debido a que el informe de experimento es un texto de naturaleza eminentemente escrita, las competencias de comprensión y producciones orales se incorporarán como procedimientos de la comprensión y producciones escritas.' },
      { topic: 'El artículo de opinión', subtopics: ['Función y estructura', 'La tesis', 'Argumentos de ejemplificación y de analogía', 'Modalizadores', 'Conectores de ejemplificación y de comparación', 'La pregunta retórica', 'El subrayado como técnica'] },
      { topic: 'El cuento social, político, cultural', subtopics: ['Función y estructura', 'Tipos', 'Elementos del cuento', 'La forma narrativa', 'Tipos de narrador', 'Los actantes', 'Recursos lingüísticos y literarios', 'El diálogo directo e indirecto', 'El verbo: modo indicativo y subjuntivo, tiempos: pretérito indefinido, pretérito imperfecto y pretérito compuesto', 'El adverbio de tiempo y espacio', 'Conectores coordinantes y subordinantes', 'Variantes lingüísticas'] },
      { topic: 'El madrigal', subtopics: ['Función y estructura', 'El verso endecasílabo', 'La rima', 'Figuras literarias', 'Vocabulario'] },
    ],
    '4to': [
      { topic: 'La crónica', subtopics: ['Función y estructura', 'Características', 'Tipos de crónicas', 'Conectores de secuenciación temporal', 'Adverbios de modo', 'El adjetivo', 'Sinónimos y expresiones sinónimas', 'Modificadores circunstanciales', 'Pronombres personales, demostrativos e indefinidos', 'Verbos en voz pasiva', 'Oraciones coordinadas'] },
      { topic: 'El instructivo', subtopics: ['Función y estructura', 'El "se" impersonal', 'El infinitivo', 'Conectores de orden, finalidad', 'Adverbios o construcciones adverbiales', 'Léxico técnico o especializado', 'Ilustraciones, gráficas y dibujos', 'Números y/o viñetas'] },
      { topic: 'El informe de investigación', subtopics: ['Función', 'Estructura', 'Composición de argumentos', 'Formas impersonales del verbo', 'Vocabulario temático', 'Oraciones compuestas', 'Verbos en infinitivo', 'Conectores de contraste, adición, cierre, ejemplificación, finalidad', 'Adverbios de frecuencia, de modo', 'Referencias bibliográficas', 'Mecanismos de citación', 'Esquemas de contenido: organizadores gráficos'] },
      { topic: 'El artículo de opinión', subtopics: ['Función y estructura argumentativa', 'Contraargumentos', 'Conectores de adición, recapitulación y cierre', 'Expresiones para precisar la tesis o punto de vista', 'Verbos de opinión', 'Las citas textuales: directas o indirectas', 'Los datos estadísticos', 'La pregunta retórica', 'Vocabulario temático'], note: 'Debido a que el artículo de opinión es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita.' },
      { topic: 'El discurso oral de agradecimiento', subtopics: ['Función y estructura', 'Características', 'Roles de los participantes', 'Referencias léxicas', 'La autorreferencia en los deícticos', 'Conectores de apertura, de cierre, de causa-efecto', 'Marcas de agradecimiento, de cortesía', 'Organizadores para introducir otras voces intratextuales', 'La secuencia argumentativa', 'Elementos paralingüísticos'] },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Componentes', 'Secuencias narrativas, descriptivas y dialogadas', 'Conectores temporales, causales y consecutivos', 'Organizadores discursivos', 'Verbos en pasado', 'Adjetivos', 'Narrador y personajes', 'Temas de la novela', 'Los personajes'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'El soneto', subtopics: ['Función y estructura', 'Licencias métricas', 'Los versos', 'La rima', 'Imágenes visuales, auditivas, olfativas, táctiles y gustativas', 'Figuras literarias', 'Campo de los sentimientos'] },
    ],
    '5to': [
      { topic: 'La carta de autopresentación', subtopics: ['Función y estructura', 'Fórmulas de cortesía', 'Verbo en presente del indicativo', 'El condicional en las formas verbales', 'El pretérito perfecto', 'Adjetivos', 'Conectores de finalidad, de causa-efecto, de adición', 'El vocabulario temático', 'El motivo de la carta'], note: 'Debido a que la carta es eminentemente un texto escrito, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita, sobre todo, aquellos relacionados con la producción oral del cuerpo de la carta.' },
      { topic: 'La reseña', subtopics: ['Función y estructura', 'Verbos en presente de indicativo, en pretérito perfecto, en futuro', 'Conectores de cierre, de adición', 'Adjetivos calificativos', 'Adverbios de modo', 'Vocabulario temático', 'Mecanismos de citación'], note: 'En este tipo de texto y para este grado, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la producción escrita.' },
      { topic: 'El ensayo argumentativo', subtopics: ['Función y estructura', 'La tesis', 'Tipos de argumentos: de autoridad, por datos estadísticos, por hechos, por causa-efecto, por teorías o generalizaciones, por ejemplos, por comparaciones, por analogías', 'Argumentos y contraargumentos', 'Conectores de orden, digresión, adición, consecuencia, contraste'], note: 'Debido a que el ensayo argumentativo es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la comprensión y producción escrita.' },
      { topic: 'El discurso oral de recibimiento y despedida', subtopics: ['Función y estructura', 'Características', 'Roles de los participantes: orador y público', 'Referencias léxicas de personas', 'La autorreferencia en los deícticos', 'Las personas gramaticales', 'Conectores de apertura, cierre', 'Marcas de recibimiento y despedida, de causa-efecto', 'Marcas de cortesía', 'El registro formal', 'Expresiones de certeza positiva', 'Expresiones de postura del orador', 'Organizadores de otras voces', 'Citas textuales', 'Organizadores intratextuales', 'Secuencia argumentativa', 'Reglas para hablar en público', 'Los signos de puntuación'] },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Secuencias: narrativas, descriptivas, dialogadas', 'Conectores temporales, causales y consecutivos', 'Marcadores espaciales', 'Marcas textuales y paratextuales', 'Organizadores discursivos de orden', 'Verbos en pasado y presente', 'Los adjetivos', 'Tipos de narrador', 'Los personajes', 'Temas de la novela', 'Los actantes', 'Orden de la narración'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'La poesía social', subtopics: ['Función y estructura', 'Verso libre y rimado', 'Recursos estilísticos: imágenes, figuras, tropos', 'Exclamaciones'] },
      { topic: 'El monólogo', subtopics: ['Definición de monólogo', 'Tipos de monólogos: el unipersonal, la comedia de pie', 'Estrategias discursivas monologales: el soliloquio, el recital', 'Elementos del monólogo teatral', 'Términos técnicos propios del teatro', 'Secuencias textuales', 'Los adjetivos y los adverbios'] },
    ],
    '6to': [
      { topic: 'El informe de investigación', subtopics: ['Función y estructura', 'Los procedimientos de composición de argumentos', 'Formas impersonales del verbo', 'Vocabulario temático', 'Conectores de concesión, de transición, de precisión', 'Locuciones adverbiales', 'Expresiones modalizadoras', 'Adverbios de frecuencia, de cantidad, de modo', 'Referencias bibliográficas', 'Citación', 'Organizadores gráficos', 'Recursos paratextuales'] },
      { topic: 'El reportaje', subtopics: ['Función y estructura', 'Características', 'La secuencia expositiva, descriptiva, narrativa', 'Formas impersonales del verbo', 'Las oraciones subordinadas sustantivas (especificativas y explicativas) y sus conectores', 'Las oraciones coordinadas yuxtapuestas', 'El adjetivo', 'Elementos paratextuales'] },
      { topic: 'El ensayo argumentativo', subtopics: ['Función y estructura', 'La tesis para expresar la postura', 'Los tipos de argumentos: de autoridad, por datos estadísticos, por hechos, por causa-efecto, por teorías o generalizaciones, por ejemplos, por comparaciones, por analogías', 'Contraargumentos', 'Las falacias argumentativas', 'Conectores explicativos y de rectificación, de distanciamiento, recapitulativos, de refuerzo'], note: 'Debido a que el ensayo argumentativo es un texto de naturaleza esencialmente escrita, la competencia de producción oral servirá solo para desarrollar procedimientos que fortalezcan y complementen la comprensión y producción escrita.' },
      { topic: 'El discurso oral de graduación', subtopics: ['Función y estructura', 'Referencias léxicas', 'La autorreferencia en los deícticos', 'Conectores de apertura, temporales, de cierre, de causa-efecto', 'Marcas de cortesía', 'Registro formal', 'Oraciones según la actitud del hablante', 'Secuencia narrativa, argumentativa', 'Elementos paralingüísticos'], note: 'Aunque este tipo de texto es eminentemente oral, la producción escrita sirve como estrategia para su posterior oralización.' },
      { topic: 'La novela', subtopics: ['Función y estructura', 'Secuencias narrativas, descriptivas y dialogadas', 'Conectores temporales, causales y consecutivos', 'Marcadores espaciales', 'Marcas textuales y paratextuales', 'Organizadores discursivos de orden', 'Verbos en pasado and presente', 'Los adjetivos', 'Tipos de narrador', 'Los personajes', 'Temas de la novela', 'Los actantes', 'Orden de la narración'], note: 'Para este tipo de texto se priorizará la comprensión tanto oral como escrita.' },
      { topic: 'Poesía social', subtopics: ['Función y estructura', 'Verso libre y rimado', 'Recursos estilísticos: imágenes, figuras, tropos', 'Exclamaciones'] },
    ],
  },
};

export const LESSON_PLAN_PROCEDURAL_CATALOG = {
  "Lengua Española": {
    "1ro": [
      {
        "topic": "La noticia",
        "proceduralItems": [
          { "id": "comprension_oral", "title": "Comprensión oral", "text": "Escucha atenta de noticias de interés mundial... (completo en el monolito)" },
          { "id": "produccion_oral", "title": "Producción oral", "text": "Escogencia de una noticia de interés mundial... (completo en el monolito)" }
        ]
      },
      // ... más bloques migrados
    ]
  }
};

export const DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_BLOCKS = [
  {
    area: 'Lengua Española',
    cycle: 'Secundaria - Primer ciclo',
    gradeKeys: ['1ro', '2do', '3ro'],
    source: 'official-seed',
    competencies: {
      'Competencia comunicativa': [
        'Comprende textos orales y escritos adecuados a distintas intenciones comunicativas del entorno escolar y social.',
        'Produce textos orales y escritos con coherencia, cohesión y corrección para comunicar ideas y opiniones.',
        'Participa en intercambios comunicativos respetando turnos, propósitos y normas de convivencia.',
      ],
      // ... resto de competencias
    },
  },
  // ... resto de bloques
];

export const DOMINICAN_SECONDARY_SPECIFIC_COMPETENCY_FALLBACKS = {
  General: {
    'Competencia comunicativa': ['Comunica ideas, procesos y conclusiones con claridad en situaciones propias del área.'],
    'Competencia de pensamiento lógico, creativo y crítico': ['Analiza información del área y formula ideas propias con sentido crítico.'],
    'Competencia de resolución de problemas': ['Aplica saberes del área para resolver situaciones del contexto escolar y social.'],
    'Competencia ética y ciudadana': ['Actúa con responsabilidad, respeto y compromiso en actividades propias del área.'],
    'Competencia científica y tecnológica': ['Utiliza recursos, procedimientos y herramientas del área para investigar y aprender.'],
    'Competencia ambiental y de la salud': ['Relaciona los aprendizajes del área con el cuidado del ambiente y la salud.'],
    'Competencia de desarrollo personal y espiritual': ['Fortalece su autonomía, autoestima y crecimiento personal a través de experiencias del área.'],
  },
};
