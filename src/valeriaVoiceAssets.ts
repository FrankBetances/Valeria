// ============================================================================
// Valeria+ · Mapa id → asset de voz neuronal — ARCHIVO GENERADO (Fase 2)
// Lo escribe la tubería de build-time del plan ILENIA/Nós a partir de
// voice-corpus.json: una entrada `[id]: require('../assets/voice/<id>.m4a')`
// por locución sintetizada. Metro exige require() estáticos, por eso este
// mapa se genera como código y no se construye en runtime.
//
// Mientras esté vacío (Fase 1), toda locución cae al motor del sistema
// (expo-speech) exactamente igual que antes: cero cambio de comportamiento.
// NO editar a mano salvo para vaciarlo; regenerar con la tubería de Fase 2.
// ============================================================================

// Versión del lote de audio empaquetado ('none' = sin audio pre-generado).
export const VOICE_ASSETS_VERSION = 'none';

// id de corpus (valeriaVoiceCorpus.voiceCorpusId) → módulo de asset de Metro.
export const VOICE_ASSETS: Record<string, number> = {};
