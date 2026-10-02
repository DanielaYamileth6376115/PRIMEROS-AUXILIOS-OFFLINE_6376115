/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  WifiOff,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { CountryPreset } from '../types';
import {
  TriageEvaluationResponse,
  evaluarEmergenciaConGemini,
  MOCK_TRIAGE_RESPONSE,
} from '../services/geminiService';
import { formatTelUri } from '../data/emergencyContacts';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry: CountryPreset;
  onOpenGuide: (guideId: string) => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  currentCountry,
  onOpenGuide,
}) => {
  const [symptomText, setSymptomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageEvaluationResponse | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async (textToEvaluate?: string) => {
    const text = (textToEvaluate || symptomText).trim();
    if (!text) return;

    setIsLoading(true);
    try {
      const evaluation = await evaluarEmergenciaConGemini(text);
      setResult(evaluation);
    } catch {
      // En caso de fallo imprevisto, siempre tenemos el mock/fallback
      setResult(MOCK_TRIAGE_RESPONSE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPresetExample = (example: string) => {
    setSymptomText(example);
    handleEvaluate(example);
  };

  const handleLaunchSuggestedGuide = (guideId: string) => {
    onClose();
    onOpenGuide(guideId);
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Crítico':
        return 'bg-red-700 text-white border-red-800 ring-2 ring-red-400';
      case 'Alto':
        return 'bg-amber-600 text-white border-amber-700';
      case 'Medio':
        return 'bg-stone-800 text-white border-stone-900';
      default:
        return 'bg-emerald-700 text-white border-emerald-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-stone-300 overflow-hidden flex flex-col max-h-[92vh] min-w-[320px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="triage-title"
      >
        {/* Encabezado con sello de IA */}
        <div className="p-4 bg-gradient-to-r from-red-700 via-red-800 to-stone-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="triage-title" className="text-base sm:text-lg font-black tracking-tight">
                  Triage Inteligente de Emergencias
                </h2>
                <span className="text-[10px] font-black uppercase bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded">
                  IA + Offline
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium">
                Evaluación rápida de riesgo con Google Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            title="Cerrar ventana de evaluación"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Asistente */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Campo de descripción con etiqueta permanente */}
          <div>
            <label
              htmlFor="triage-symptoms-input"
              className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-1.5"
            >
              Describí los síntomas o lo que está ocurriendo:
            </label>
            <textarea
              id="triage-symptoms-input"
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="Ej: Mi abuela siente una opresión muy fuerte en el pecho y está sudando frío..."
              rows={3}
              className="w-full text-base p-3.5 bg-stone-50 text-stone-950 rounded-2xl border-2 border-stone-300 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 transition-all font-medium placeholder:text-stone-400 shadow-xs"
            />
          </div>

          {/* Botón Principal de Evaluación (Área táctil de 48px) */}
          <button
            onClick={() => handleEvaluate()}
            disabled={isLoading || !symptomText.trim()}
            className={`w-full min-h-[52px] px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              isLoading || !symptomText.trim()
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-red-200'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analizando gravedad clínica...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Evaluar Riesgo y Prioridades</span>
              </>
            )}
          </button>

          {/* Ejemplos de prueba rápida */}
          {!result && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                O prueba con un escenario típico:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  'Dolor opresivo en el pecho irradiado al brazo izquierdo con sudor frío',
                  'Bebé atragantado con un trozo de comida que no puede toser',
                  'Corte profundo en el antebrazo con sangrado abundante que empapa la tela',
                ].map((ejemplo, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPresetExample(ejemplo)}
                    className="min-h-[48px] text-left p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors border border-stone-200 flex items-center justify-between"
                  >
                    <span className="line-clamp-1">{ejemplo}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTADO ESTRUCTURADO DEL TRIAGE */}
          {result && (
            <div className="space-y-3.5 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Badge de Origen (Gemini vs Motor Local Offline) */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
                <span className="flex items-center gap-1.5">
                  {result.esOfflineFallback ? (
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span>{result.mensajeOrigen}</span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${getRiskBadgeColor(
                    result.nivelRiesgo
                  )}`}
                >
                  Riesgo {result.nivelRiesgo}
                </span>
              </div>

              {/* Alerta Urgente: Requiere llamada inmediata */}
              {result.alertaUrgente && (
                <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-black text-red-950 uppercase tracking-wide">
                        Llamada médica urgente requerida
                      </p>
                      <p className="text-[11px] font-semibold text-red-800">
                        Hay riesgo vital. Contacta con la ambulancia ya.
                      </p>
                    </div>
                  </div>

                  <a
                    href={formatTelUri(currentCountry.defaultEmergencyNumber)}
                    className="min-h-[48px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Llamar {currentCountry.defaultEmergencyNumber}</span>
                  </a>
                </div>
              )}

              {/* Acción Inmediata de Alto Impacto */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-1 shadow-md">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  Acción Inmediata (Primeros 10 segundos)
                </span>
                <p className="text-base sm:text-lg font-black leading-snug">
                  {result.accionInmediata}
                </p>
              </div>

              {/* Pasos Priorizados de Evaluación */}
              <div className="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl space-y-2">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                  Pasos de evaluación y control:
                </span>
                <ol className="space-y-1.5">
                  {result.pasosEvaluacion.map((paso, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-stone-900">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Botón de acceso directo a la guía sugerida */}
              {result.guiaSugerida && result.guiaSugerida !== 'general' && (
                <button
                  onClick={() => handleLaunchSuggestedGuide(result.guiaSugerida)}
                  className="w-full min-h-[52px] p-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-md shadow-red-200 transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-red-200" />
                    <span>Abrir Guía Paso a Paso Recomendada</span>
                  </div>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pie informativo */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-500 font-medium">
          AuxilioApp Triage no reemplaza el juicio de profesionales de la salud. En caso de duda, llama al servicio médico.
        </div>
      </div>
    </div>
  );
};
