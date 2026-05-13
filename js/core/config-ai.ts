/**
 * Configuración de Inteligencia Artificial para EduGest.
 * --------------------------------------------------------------------------
 * Este archivo contiene la llave de API y la configuración del modelo Gemini.
 * INSTRUCCIONES: Reemplaza 'TU_API_KEY_AQUÍ' con tu llave de Google AI Studio.
 */

export const AI_CONFIG = {
  // Pega tu API Key de Google Cloud Console / AI Studio aquí
  GEMINI_API_KEY: 'AIzaSyDBa3CXMz6-pT2rqGu_6wMHXcTElFqK9Fo',

  // Modelo a utilizar: 'gemini-1.5-flash' (rápido) o 'gemini-1.5-pro' (más inteligente)
  MODEL_NAME: 'gemini-1.5-flash',

  // Configuración de la IA
  TEMPERATURE: 0.7,
  MAX_TOKENS: 500,
};
