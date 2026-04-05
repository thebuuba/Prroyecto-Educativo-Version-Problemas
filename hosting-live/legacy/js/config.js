(function initEduGestConfig(global) {
  // Gestiona make id.
  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  const BLOCKS = ['B1', 'B2', 'B3', 'B4'];
  const BNAME = {
    B1: 'Comunicativa',
    B2: 'Pensamiento logico, creativo y critico / Resolucion de problemas',
    B3: 'Etica y ciudadana / Desarrollo personal y espiritual',
    B4: 'Cientifica y tecnologica / Ambiental y de la salud',
  };
  const BICON = { B1: '🗣', B2: '🔢', B3: '🤝', B4: '🔬' };
  const BCOLOR = { B1: 'var(--com)', B2: 'var(--res)', B3: 'var(--eth)', B4: 'var(--cyt)' };
  const BASIC_INSTRUMENT_TYPES = ['rubrica_analitica', 'lista_cotejo_a', 'lista_cotejo_b', 'escala_estimativa'];
  const BASIC_INSTRUMENT_META = {
    rubrica_analitica: { title: 'Rubrica', desc: 'Criterios por niveles (4/3/2/1).', icon: '📐' },
    lista_cotejo_a: { title: 'Lista de cotejo', desc: 'Cumple / No cumple por criterio.', icon: '✅' },
    lista_cotejo_b: { title: 'Lista ponderada', desc: 'Checklist con peso por criterio.', icon: '🧮' },
    escala_estimativa: { title: 'Escala estimativa', desc: 'Nunca, A veces, Casi siempre, Siempre.', icon: '📊' },
  };
  const DEFAULT_PERIODS = [
    { id: 'P1', name: 'Periodo 1', order: 1 },
    { id: 'P2', name: 'Periodo 2', order: 2 },
    { id: 'P3', name: 'Periodo 3', order: 3 },
    { id: 'P4', name: 'Periodo 4', order: 4 },
  ];
  const DEFAULT_ACADEMIC_CALENDAR = {
    country: 'DO',
    activeMonths: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5],
    periods: [
      { id: 'P1', name: 'Periodo 1', order: 1, months: [8, 9, 10] },
      { id: 'P2', name: 'Periodo 2', order: 2, months: [11, 12, 1] },
      { id: 'P3', name: 'Periodo 3', order: 3, months: [2, 3] },
      { id: 'P4', name: 'Periodo 4', order: 4, months: [4, 5] },
    ],
  };
  const AVPAL = ['#00c2b8', '#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6', '#06b6d4'];
  const DEFAULT_SCHOOLS = [
    'Colegio Catolico Cardenal Beras',
    'Jorge Ruben Bonilla Castelle',
    'Euugenio Maria de Hostos',
    'Cristino Pitta',
    'La Hoja',
  ];
  const STORAGE_KEY = 'eg_v3';

  // Gestiona default block cfg.
  function defaultBlockCfg() {
    return {
      activities: [
        { id: makeId(), name: 'Actividad 1', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
        { id: makeId(), name: 'Actividad 2', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
        { id: makeId(), name: 'Actividad 3', pts: 20, tipo: '', fecha: '', desc: '', producto: '', instrumentId: null, instrumentIds: [], instrumentHistory: [] },
      ],
      meta: 100,
      normalize: true,
    };
  }

  // Gestiona empty block cfg.
  function emptyBlockCfg() {
    return { activities: [], meta: 100, normalize: true };
  }

  // Gestiona empty grupo cfg.
  function emptyGroupCfg() {
    return {
      B1: emptyBlockCfg(),
      B2: emptyBlockCfg(),
      B3: emptyBlockCfg(),
      B4: emptyBlockCfg(),
    };
  }

  // Crea crear initial estado.
  function createInitialState() {
    return {
      profile: null,
      grades: [],
      secciones: [],
      estudiantes: [],
      studentDirectory: [],
      actividades: [],
      notas: {},
      blockCfg: {
        B1: defaultBlockCfg(),
        B2: defaultBlockCfg(),
        B3: defaultBlockCfg(),
        B4: defaultBlockCfg(),
      },
      groupConfigs: {},
      templates: [],
      instruments: [],
      evaluations: [],
      usuarios: [],
      authUsers: [],
      sessionUserId: null,
      sessionUserName: null,
      sessionStartedAt: null,
      sessionExpiresAt: null,
      cloudOwnerUid: null,
      schools: [...DEFAULT_SCHOOLS],
      schoolYear: { id: '2025-2026', name: '2025-2026' },
      academicCalendar: JSON.parse(JSON.stringify(DEFAULT_ACADEMIC_CALENDAR)),
      periods: JSON.parse(JSON.stringify(DEFAULT_PERIODS)),
      activePeriodId: 'P1',
      periodGroupConfigs: {},
      notasByPeriod: {},
      attendance: {
        monthKey: '',
        records: {},
      },
      teacherPlanner: {
        monthKey: '',
        customEvents: [],
        weeklySchedule: [],
      },
      activeGroupId: null,
      activeCourseId: null,
      currentPage: 'dashboard',
      activityViewMode: 'blocks',
      aiChatHistory: [],
    };
  }

  global.EduGestConfig = {
    AVPAL,
    BASIC_INSTRUMENT_META,
    BASIC_INSTRUMENT_TYPES,
    BCOLOR,
    BICON,
    BLOCKS,
    BNAME,
    DEFAULT_ACADEMIC_CALENDAR,
    DEFAULT_PERIODS,
    DEFAULT_SCHOOLS,
    STORAGE_KEY,
    createInitialState,
    defaultBlockCfg,
    emptyBlockCfg,
    emptyGroupCfg,
  };
})(window);
