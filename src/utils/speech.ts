/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SERVICIO DE SÍNTESIS DE VOZ OFFLINE (Web Speech API)
 * -------------------------------------------------------------
 * Utiliza exclusivamente las capacidades nativas del navegador (window.speechSynthesis).
 * NO requiere internet, NO usa tokens ni librerías externas de pago.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Chromium GC Bug: Si la instancia `SpeechSynthesisUtterance` no se guarda en una
 *    variable de ámbito superior, el Garbage Collector de V8 la destruye a mitad de la locución,
 *    dejando `speechSynthesis.speaking === true` congelado.
 * 2. Carga asíncrona de voces: `speechSynthesis.getVoices()` devuelve un array vacío []
 *    en el primer ciclo de render en Chrome y Safari. Es obligatorio escuchar `onvoiceschanged`.
 * 3. Bloqueo de cola: Si una locución anterior quedó en pausa o trabada, cualquier llamada
 *    futura a `.speak()` queda ignorada. Por eso siempre llamamos a `.cancel()` antes de una nueva.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let preferredSpanishVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Verifica compatibilidad en el dispositivo del usuario
export function isSpeechSynthesisSupported(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window &&
      Boolean(window.speechSynthesis)
    );
  } catch {
    return false;
  }
}

/**
 * Diagnóstico completo del estado de síntesis de voz en el navegador.
 * Evita fallos silenciosos y permite mostrar advertencias preventivas.
 */
export function getTTSDiagnostics(): {
  isSupported: boolean;
  voicesAvailable: boolean;
  voiceName: string;
  errorMessage?: string;
} {
  const supported = isSpeechSynthesisSupported();
  if (!supported) {
    return {
      isSupported: false,
      voicesAvailable: false,
      voiceName: '',
      errorMessage: 'Este navegador o dispositivo no cuenta con soporte nativo para lectura en voz alta (Web Speech API).',
    };
  }

  const voices = window.speechSynthesis.getVoices();
  return {
    isSupported: true,
    voicesAvailable: voices.length > 0,
    voiceName: preferredSpanishVoice?.name || (voices.length > 0 ? voices[0].name : 'Voz estándar del sistema'),
  };
}

/**
 * Inicializa y busca la mejor voz en español disponible en el sistema operativo del teléfono.
 */
function initializeVoices(): void {
  if (!isSpeechSynthesisSupported()) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
    // Priorizamos voces en español nativas de alta calidad del sistema
    preferredSpanishVoice =
      voices.find((v) => v.lang === 'es-ES' && v.localService) ||
      voices.find((v) => v.lang.startsWith('es') && v.localService) ||
      voices.find((v) => v.lang.startsWith('es')) ||
      null;
  }
}

// Escuchamos el evento cuando el navegador termine de cargar la lista de voces
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initializeVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    initializeVoices();
  };
}

export interface SpeechOptions {
  rate?: number;  // Velocidad de lectura (1.0 = normal, 0.95 = un poco más calmado y claro para pánico)
  pitch?: number; // Tono (1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Reproduce un texto en español de manera clara.
 */
export function speakText(text: string, options?: SpeechOptions): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[AuxilioApp] Web Speech API no soportada en este navegador.');
    options?.onError?.('No soportado');
    return;
  }

  // Cancelamos cualquier audio o paso previo para no encimar locuciones
  stopSpeaking();

  if (!voicesLoaded) {
    initializeVoices();
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance; // EVITA el Garbage Collection anticipado

    utterance.lang = 'es-ES';
    if (preferredSpanishVoice) {
      utterance.voice = preferredSpanishVoice;
    }

    // Ritmo claro y pausado (0.95x para situaciones de nerviosismo)
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.0;

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      // Si el usuario canceló deliberadamente, no lo tratamos como error fatal
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('[AuxilioApp] Error en síntesis de voz:', event);
        options?.onError?.(event);
      }
      activeUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('[AuxilioApp] Falló speakText:', error);
    activeUtterance = null;
    options?.onError?.(error);
  }
}

/**
 * Detiene inmediatamente la locución.
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch {
      // Ignorar error al cancelar
    }
  }
}

/**
 * Consulta si el sintetizador está actualmente leyendo.
 */
export function isCurrentlySpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
}
