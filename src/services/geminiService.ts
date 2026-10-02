/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, Schema } from '@google/genai';

/**
 * ESQUEMA DE DATOS ESTRUCTURADOS DEL TRIAGE DE EMERGENCIA
 * ---------------------------------------------------------------------
 * La respuesta de Gemini se restringe estrictamente a este esquema mediante
 * responseMimeType: "application/json" y responseSchema.
 */
export interface TriageEvaluationResponse {
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  accionInmediata: string;
  pasosEvaluacion: string[];
  guiaSugerida: string; // 'atragantamiento' | 'rcp' | 'infarto' | 'cortes' | 'quemaduras' | 'fracturas_expuestas' | 'picaduras_venenosas' | 'convulsiones' | 'desmayos' | 'intoxicaciones' | 'general'
  alertaUrgente: boolean;
  esOfflineFallback?: boolean;
  mensajeOrigen?: string;
}

/**
 * Definición técnica del esquema para el SDK de Google Gemini (@google/genai)
 */
export const triageResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    nivelRiesgo: {
      type: Type.STRING,
      enum: ['Bajo', 'Medio', 'Alto', 'Crítico'],
      description: 'Nivel de gravedad prehospitalaria según síntomas descritos.',
    },
    accionInmediata: {
      type: Type.STRING,
      description: 'Acción crítica de máximo impacto que el rescatador debe realizar en los primeros 10 segundos.',
    },
    pasosEvaluacion: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Lista priorizada de 3 a 4 acciones secuenciales claras y directas.',
    },
    guiaSugerida: {
      type: Type.STRING,
      description: 'Identificador exacto de la guía offline de AuxilioApp que debe activarse: atragantamiento, rcp, infarto, cortes, quemaduras, fracturas_expuestas, picaduras_venenosas, convulsiones, desmayos, intoxicaciones, o general.',
    },
    alertaUrgente: {
      type: Type.BOOLEAN,
      description: 'Verdadero si existe riesgo inminente de muerte o secuela grave y requiere llamar al 911 / ambulancia de inmediato.',
    },
  },
  required: ['nivelRiesgo', 'accionInmediata', 'pasosEvaluacion', 'guiaSugerida', 'alertaUrgente'],
};

/**
 * MOCK DE RESPUESTA PARA DESARROLLO, PRUEBAS Y MODO OFFLINE
 * Útil para maquetar la interfaz sin consumir cuota de la API.
 */
export const MOCK_TRIAGE_RESPONSE: TriageEvaluationResponse = {
  nivelRiesgo: 'Crítico',
  accionInmediata: 'Llama de inmediato a la ambulancia y sienta a la persona reclinada a 45 grados en reposo total.',
  pasosEvaluacion: [
    'Verifica que la persona no haga ningún esfuerzo físico ni camine.',
    'Afloja prendas apretadas en cuello y cintura para facilitar la respiración.',
    'Ten a mano el teléfono en altavoz con el servicio de ambulancias.',
    'Si pierde el conocimiento y deja de respirar, inicia compresiones de RCP.',
  ],
  guiaSugerida: 'infarto',
  alertaUrgente: true,
  esOfflineFallback: false,
  mensajeOrigen: 'Evaluación inteligente con Gemini (Modo Prueba Mock)',
};

/**
 * MOTOR DE DECISIÓN LOCAL POR PALABRAS CLAVE (Fallback Offline / Failover)
 * ---------------------------------------------------------------------
 * Si el usuario no tiene conexión de red, si la API de Gemini tiene timeout
 * o si la respuesta falla, este algoritmo garantiza que la app sugiera
 * la guía adecuada en menos de 10 milisegundos sin bloquear la interfaz.
 */
export function evaluarEmergenciaOfflineFallback(texto: string): TriageEvaluationResponse {
  const query = texto.toLowerCase();

  // 1. Detección de Paro Cardíaco / Inconsciencia
  if (
    query.includes('no respira') ||
    query.includes('paro') ||
    (query.includes('inconsciente') && (query.includes('respira') || query.includes('muerto') || query.includes('pulso')))
  ) {
    return {
      nivelRiesgo: 'Crítico',
      accionInmediata: 'Comprueba consciencia y respiración. Si no responde ni respira, inicia RCP de inmediato.',
      pasosEvaluacion: [
        'Llama a emergencias médicas de inmediato o pide a alguien que llame.',
        'Coloca a la víctima boca arriba en suelo firme.',
        'Inicia 30 compresiones en el centro del pecho con ritmo constante (110 BPM).',
        'No detengas las compresiones hasta que llegue auxilio médico.',
      ],
      guiaSugerida: 'rcp',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 2. Detección de Asfixia / Atragantamiento
  if (
    query.includes('atragant') ||
    query.includes('ahog') ||
    query.includes('asfix') ||
    query.includes('trago') ||
    query.includes('moneda') ||
    query.includes('obstruc')
  ) {
    return {
      nivelRiesgo: 'Crítico',
      accionInmediata: 'Determina si puede toser. Si no emite sonido y se lleva las manos al cuello, aplica maniobra de Heimlich.',
      pasosEvaluacion: [
        'Si tose con fuerza, anímala a seguir tosiendo; no le des golpes en la espalda.',
        'Si no puede toser ni respirar, ponte detrás y realiza compresiones abdominales hacia adentro y arriba.',
        'En lactantes menores de 1 año, alterna 5 golpes en la espalda y 5 compresiones en el pecho.',
        'Si pierde el conocimiento, recuéstala e inicia compresiones de RCP.',
      ],
      guiaSugerida: 'atragantamiento',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 3. Detección de Sospecha de Infarto / Ataque Cardíaco
  if (
    query.includes('infarto') ||
    query.includes('corazon') ||
    query.includes('pecho') ||
    query.includes('brazo izquierdo') ||
    query.includes('opresion')
  ) {
    return {
      nivelRiesgo: 'Crítico',
      accionInmediata: 'Reposo absoluto inmediato. Sienta a la víctima reclinada a 45 grados y llama a la ambulancia.',
      pasosEvaluacion: [
        'Llama a emergencias indicando sospecha de infarto cardíaco.',
        'No permitas que la persona camine, suba escaleras ni conduzca.',
        'Afloja la ropa ajustada y mantén ventilado el ambiente.',
        'Monitorea respiración continua por si requiere RCP.',
      ],
      guiaSugerida: 'infarto',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 4. Detección de Sangrado / Hemorragia / Cortes
  if (
    query.includes('sangre') ||
    query.includes('corte') ||
    query.includes('hemorragia') ||
    query.includes('herida profunda')
  ) {
    return {
      nivelRiesgo: 'Alto',
      accionInmediata: 'Presión directa firme y continua sobre el sitio de la herida con tela limpia o gasa.',
      pasosEvaluacion: [
        'Presiona con fuerza constante sin levantar la tela para mirar.',
        'Si se empapa de sangre, coloca más paños encima sin retirar el primero.',
        'Si la sangre brota a chorros pulsátiles y no cede, aplica torniquete 5 cm sobre la herida.',
        'Llama a la ambulancia si el sangrado no se detiene en 10 minutos.',
      ],
      guiaSugerida: 'cortes',
      alertaUrgente: query.includes('chorro') || query.includes('mucha sangre'),
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 5. Detección de Quemaduras
  if (
    query.includes('quemadur') ||
    query.includes('quemo') ||
    query.includes('fuego') ||
    query.includes('agua caliente') ||
    query.includes('aceite')
  ) {
    return {
      nivelRiesgo: 'Alto',
      accionInmediata: 'Enfría la zona quemada bajo agua corriente fresca (no helada) durante 15 a 20 minutos ininterrumpidos.',
      pasosEvaluacion: [
        'Aplica solo agua limpia. NUNCA uses hielo, dentífrico, manteca ni remedios caseros.',
        'No revientes las ampollas intactas.',
        'Retira anillos y pulseras antes de que comience la hinchazón.',
        'Cubre la quemadura suavemente con film plástico o gasa sin apretar.',
      ],
      guiaSugerida: 'quemaduras',
      alertaUrgente: query.includes('quimico') || query.includes('cara') || query.includes('bebe'),
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 6. Detección de Fracturas Expuestas
  if (
    query.includes('fractura') ||
    query.includes('hueso') ||
    query.includes('deform') ||
    query.includes('quebro')
  ) {
    return {
      nivelRiesgo: 'Alto',
      accionInmediata: 'No muevas la extremidad ni intentes recolocar el hueso. Inmoviliza tal como se encuentra.',
      pasosEvaluacion: [
        'Llama a la ambulancia de inmediato.',
        'Cubre el hueso o la herida abierta con una gasa limpia humedecida.',
        'Si hay hemorragia, presiona en los bordes sin tocar el hueso.',
        'Inmoviliza a los lados con almohadas o toallas enrolladas.',
      ],
      guiaSugerida: 'fracturas_expuestas',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 7. Detección de Mordeduras y Picaduras Venenosas
  if (
    query.includes('serpiente') ||
    query.includes('vibora') ||
    query.includes('arana') ||
    query.includes('alacran') ||
    query.includes('picadura') ||
    query.includes('veneno')
  ) {
    return {
      nivelRiesgo: 'Alto',
      accionInmediata: 'Reposo absoluto e inmovilización de la extremidad. NUNCA cortes la piel ni succiones con la boca.',
      pasosEvaluacion: [
        'Tranquiliza a la persona; el pánico acelera la circulación del veneno.',
        'Quita anillos, pulseras y calzado antes de la inflamación.',
        'Lava suavemente con agua y jabón corriente.',
        'Traslada al centro médico de inmediato con foto del animal si fue posible.',
      ],
      guiaSugerida: 'picaduras_venenosas',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 8. Detección de Convulsiones / Epilepsia
  if (
    query.includes('convulsion') ||
    query.includes('epilep') ||
    query.includes('tiembla') ||
    query.includes('ataque')
  ) {
    return {
      nivelRiesgo: 'Alto',
      accionInmediata: 'Protege la cabeza con algo blando y aparta objetos peligrosos. NUNCA metas nada en su boca.',
      pasosEvaluacion: [
        'Acompaña la convulsión sin sujetar a la persona por la fuerza.',
        'Toma el tiempo exacto de duración de la crisis.',
        'Cuando termine la crisis motora, colócala de costado en Posición Lateral de Seguridad.',
        'Llama a la ambulancia si dura más de 5 minutos o es su primera crisis.',
      ],
      guiaSugerida: 'convulsiones',
      alertaUrgente: true,
      esOfflineFallback: true,
      mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
    };
  }

  // 9. Fallback general para síntomas difusos
  return {
    nivelRiesgo: 'Medio',
    accionInmediata: 'Mantén la calma, evalúa si la persona está consciente y responde a tu voz.',
    pasosEvaluacion: [
      'Pregúntale su nombre y dónde se encuentra para verificar lucidez.',
      'Revisa si respira con normalidad y sin dificultad audible.',
      'Si presenta dolor agudo, desmayo o sangrado, recurre al directorio de emergencias.',
      'Selecciona una guía específica del catálogo de AuxilioApp.',
    ],
    guiaSugerida: 'general',
    alertaUrgente: false,
    esOfflineFallback: true,
    mensajeOrigen: 'Evaluación local activa (Sin conexión a la IA)',
  };
}

/**
 * SERVICIO PRINCIPAL DE EVALUACIÓN Y TRIAGE INTELIGENTE
 * ---------------------------------------------------------------------
 * Llama a la API de Gemini con salida estructurada JSON y cuenta con
 * failover automático al motor de decisión local si no hay internet.
 */
export async function evaluarEmergenciaConGemini(
  descripcionSintomas: string,
  timeoutMs: number = 4500
): Promise<TriageEvaluationResponse> {
  const textoLimpio = descripcionSintomas.trim();
  if (!textoLimpio) {
    return evaluarEmergenciaOfflineFallback('');
  }

  // Si el navegador reporta estar desconectado, activa el failover local de inmediato
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.info('[AuxilioApp AI] Dispositivo offline: activando motor local de triage.');
    return evaluarEmergenciaOfflineFallback(textoLimpio);
  }

  // Lectura segura de la clave de API desde variables de entorno
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
    // @ts-ignore
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    '';

  // Si no hay API Key configurada, failover transparente sin crashear la app
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('[AuxilioApp AI] GEMINI_API_KEY no detectada. Usando motor offline de triage.');
    return evaluarEmergenciaOfflineFallback(textoLimpio);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Promesa con timeout estricto para evitar bloqueos en emergencias reales
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), timeoutMs)
    );

    const apiCallPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Actúa como un médico especialista en triage prehospitalario de urgencias para AuxilioApp (primeros auxilios comunitarios).
Evalúa la siguiente situación de emergencia reportada por una persona en el hogar:
"${textoLimpio}"

Determina con precisión clínica:
1. Nivel de riesgo ('Bajo', 'Medio', 'Alto', 'Crítico').
2. Acción inmediata prioritaria en los primeros 10 segundos.
3. Lista de 3 o 4 pasos concisos de evaluación.
4. Identificador de guía offline más adecuada ('atragantamiento', 'rcp', 'infarto', 'cortes', 'quemaduras', 'fracturas_expuestas', 'picaduras_venenosas', 'convulsiones', 'desmayos', 'intoxicaciones', 'general').
5. Si requiere llamada de auxilio médico urgente (alertaUrgente = true/false).`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: triageResponseSchema,
        temperature: 0.1, // Determinismo y precisión clínica
      },
    });

    const response = (await Promise.race([apiCallPromise, timeoutPromise])) as any;

    if (!response || !response.text) {
      throw new Error('RESPUESTA_VACIA');
    }

    const jsonParsed = JSON.parse(response.text) as TriageEvaluationResponse;

    // Validación básica de integridad del objeto devuelto
    if (!jsonParsed.nivelRiesgo || !jsonParsed.accionInmediata || !Array.isArray(jsonParsed.pasosEvaluacion)) {
      throw new Error('ESQUEMA_INCOMPLETO');
    }

    return {
      ...jsonParsed,
      esOfflineFallback: false,
      mensajeOrigen: 'Evaluación inteligente procesada por Google Gemini',
    };
  } catch (error) {
    console.warn('[AuxilioApp AI] Error en llamada a Gemini. Activando failover offline:', error);
    // FAILOVER RESILIENTE: Si la IA falla, la vida del paciente sigue protegida con el motor local
    return evaluarEmergenciaOfflineFallback(textoLimpio);
  }
}
