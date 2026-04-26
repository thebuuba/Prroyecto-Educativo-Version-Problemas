/**
 * Motor de Inteligencia de EduGest AI V3 (Gemini Agent).
 * --------------------------------------------------------------------------
 * Utiliza el SDK de Google Generative AI para proporcionar razonamiento real
 * y ejecución autónoma de acciones (Tool Calling).
 */

import { AI_CONFIG } from './config-ai.js';
import { go, toggleDarkMode } from './domain-utils.js';
import { registerStudentSilently } from './student-logic.js';

/** Acciones disponibles para la IA (Definidas para Gemini) */
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'navigate_to',
        description: 'Navega a una sección específica del sistema EduGest.',
        parameters: {
          type: 'OBJECT',
          properties: {
            page: {
              type: 'STRING',
              enum: ['tablero', 'estudiantes', 'grados', 'materias', 'configuracion', 'asistencia', 'reportes'],
              description: 'El nombre de la página a la que se desea viajar.'
            }
          },
          required: ['page']
        }
      },
      {
        name: 'create_student',
        description: 'Registra un nuevo estudiante en la base de datos del sistema.',
        parameters: {
          type: 'OBJECT',
          properties: {
            nombre: { type: 'STRING', description: 'Nombre de pila del estudiante.' },
            apellido: { type: 'STRING', description: 'Apellido(s) del estudiante.' }
          },
          required: ['nombre', 'apellido']
        }
      },
      {
        name: 'toggle_dark_mode',
        description: 'Cambia el tema visual entre modo claro y modo oscuro.',
        parameters: { type: 'OBJECT', properties: {} }
      }
    ]
  }
];

export const AIEngine = {
  _model: null,
  _chat: null,

  /**
   * Inicializa el cliente de Gemini con mayor robustez.
   */
  async _ensureInitialized() {
    if (this._model) return true;
    
    if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY.includes('TU_API_KEY')) {
      throw new Error('API_KEY_MISSING');
    }

    try {
      // Intentamos cargar desde un CDN alternativo por si es un bloqueo de dominio
      const { GoogleGenerativeAI } = await import('https://unpkg.com/@google/generative-ai@0.11.0/dist/index.mjs');
      const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI_API_KEY);
      
      this._model = genAI.getGenerativeModel({
        // Usamos gemini-pro por ser el más compatible globalmente y evitar errores 404
        model: "gemini-pro", 
        systemInstruction: "Eres 'EduGest AI Copilot'. Ayuda al usuario brevemente y en español.",
        tools: TOOLS
      });

      this._chat = this._model.startChat({ history: [] });
      return true;
    } catch (e) {
      console.error('[EduGest][AI] Full Init Error:', e);
      throw new Error(`SDK_FAIL: ${e.name} - ${e.message}`);
    }
  },

  async processRequest(text) {
    try {
      await this._ensureInitialized();
      
      const result = await this._chat.sendMessage(text);
      const response = await result.response;
      
      const call = response.functionCalls()?.[0];
      if (call) return await this._handleToolCall(call);

      return { success: true, text: response.text() };

    } catch (error) {
      const msg = error.message || '';
      console.error('[EduGest][AI] Full Runtime Error:', error);

      if (msg.includes('API_KEY_MISSING')) {
        return { success: false, text: '⚠️ Falta la API Key.' };
      }

      // Si es un error de red puro (CORS / Bloqueo)
      if (msg.includes('fetch') || msg.includes('NetworkError') || error.name === 'TypeError') {
        return { 
          success: false, 
          text: `❌ **Bloqueo de Red detectado**: \n` +
                `Detalle: ${msg} \n\n` +
                `Esto suele ser porque tu Navegador o Antivirus bloquea la conexión a Google Gemini. \n` +
                `**Tip**: Abre la consola (F12) para ver el error en rojo.`
        };
      }

      return { success: false, text: `🔧 **Error Técnico**: ${error.name}: ${msg.slice(0, 150)}` };
    }
  },

  /**
   * Ejecuta la orden técnica generada por la IA.
   */
  async _handleToolCall(call) {
    const { name, args } = call;
    let feedbackText = 'He procesado tu comando.';

    try {
      if (name === 'navigate_to') {
        go(args.page);
        feedbackText = `¡Dicho y hecho! Te he llevado a la sección de **${args.page}**.`;
      } 
      else if (name === 'create_student') {
        const res = await registerStudentSilently(args.nombre, args.apellido);
        feedbackText = res.success 
          ? `¡Listo! He registrado a **${args.nombre} ${args.apellido}** en la base de datos con éxito.`
          : `No pude registrar al estudiante: ${res.message}`;
      }
      else if (name === 'toggle_dark_mode') {
        toggleDarkMode();
        const theme = document.body.classList.contains('dark-mode') ? 'Oscuro' : 'Claro';
        feedbackText = `Excelente. He activado el **Modo ${theme}** para ti.`;
      }

      // Enviar de vuelta a Gemini para que genere la respuesta final conversacional
      return { success: true, text: feedbackText };
      
    } catch (e) {
      return { success: false, text: 'Intenté realizar la acción pero algo falló en el sistema.' };
    }
  }
};
