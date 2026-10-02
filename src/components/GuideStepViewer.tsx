/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { EmergencyGuide, CountryPreset } from '../types';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../utils/speech';
import { rcpMetronome } from '../utils/metronome';
import { Illustration } from './Illustrations';
import { formatTelUri } from '../data/emergencyContacts';

interface GuideStepViewerProps {
  guide: EmergencyGuide;
  onBack: () => void;
  currentCountry: CountryPreset;
  onTogglePanicMode: () => void;
  isPanicMode: boolean;
}

export const GuideStepViewer: React.FC<GuideStepViewerProps> = ({
  guide,
  onBack,
  currentCountry,
  onTogglePanicMode,
  isPanicMode,
}) => {
  // Estado para la variante seleccionada (Adulto, Bebé, etc.)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const currentVariant = guide.variants[selectedVariantIndex] || guide.variants[0];

  // Paso actual (0-indexed)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = currentVariant.steps[currentStepIndex];
  const totalSteps = currentVariant.steps.length;

  // Estados de Asistencia por Voz
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousReading, setContinuousReading] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // Estados de Metrónomo RCP
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);

  // Ref para cancelar temporizadores al desmontar
  const advanceTimerRef = useRef<number | null>(null);

  // Suscripción al metrónomo para pulso visual a 110 BPM
  useEffect(() => {
    const unsubscribe = rcpMetronome.subscribe(() => {
      setBeatPulse((prev) => !prev);
    });
    return () => {
      unsubscribe();
      rcpMetronome.stop();
    };
  }, []);

  // Al desmontar o cambiar de guía, detenemos la voz y metrónomo
  useEffect(() => {
    return () => {
      stopSpeaking();
      rcpMetronome.stop();
      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // Reiniciar paso al cambiar de variante (ej. cambiar entre Adulto y Bebé)
  const handleSelectVariant = (index: number) => {
    stopSpeaking();
    setIsSpeaking(false);
    setContinuousReading(false);
    setSelectedVariantIndex(index);
    setCurrentStepIndex(0);
  };

  /**
   * PUNTO CRÍTICO DE ERROR: Manejo del flujo de lectura continua.
   * Si `continuousReading` está activo, tras terminar de hablar el paso actual,
   * programamos el avance automático al siguiente paso tras 3.5 segundos de pausa
   * para dar tiempo al usuario de ejecutar la maniobra.
   */
  const handleSpeakCurrentStep = (continuous: boolean = false) => {
    if (!isSpeechSynthesisSupported()) {
      setTtsError('Tu navegador no cuenta con soporte para lectura en voz alta. Puedes guiarte con las instrucciones y diagramas en pantalla.');
      return;
    }
    setTtsError(null);

    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
      setAutoAdvanceTimer(null);
    }

    setContinuousReading(continuous);
    setIsSpeaking(true);

    const textToSpeak = `${currentStep.title}. ${currentStep.instruction}. ${
      currentStep.vitalAdvice ? 'Atención: ' + currentStep.vitalAdvice : ''
    }`;

    speakText(textToSpeak, {
      rate: 0.95,
      onStart: () => {
        setIsSpeaking(true);
        setTtsError(null);
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (continuous) {
          // Si quedan más pasos, iniciamos cuenta para el siguiente
          if (currentStepIndex < totalSteps - 1) {
            let countdown = 3;
            setAutoAdvanceTimer(countdown);

            const interval = window.setInterval(() => {
              countdown -= 1;
              if (countdown <= 0) {
                window.clearInterval(interval);
                setAutoAdvanceTimer(null);
                setCurrentStepIndex((prev) => {
                  const nextIndex = prev + 1;
                  // Llamamos recursivamente la lectura del siguiente paso
                  window.setTimeout(() => {
                    handleSpeakStepIndex(nextIndex, true);
                  }, 100);
                  return nextIndex;
                });
              } else {
                setAutoAdvanceTimer(countdown);
              }
            }, 1000);

            advanceTimerRef.current = interval;
          } else {
            setContinuousReading(false);
          }
        }
      },
      onError: () => {
        setIsSpeaking(false);
        setContinuousReading(false);
        setTtsError('La locución fue interrumpida o el altavoz está en silencio. Continúa con la guía visual.');
      },
    });
  };

  const handleSpeakStepIndex = (stepIdx: number, continuous: boolean) => {
    const step = currentVariant.steps[stepIdx];
    if (!step) return;

    setIsSpeaking(true);
    const textToSpeak = `${step.title}. ${step.instruction}. ${
      step.vitalAdvice ? 'Atención: ' + step.vitalAdvice : ''
    }`;

    speakText(textToSpeak, {
      rate: 0.95,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        if (continuous && stepIdx < totalSteps - 1) {
          let countdown = 3;
          setAutoAdvanceTimer(countdown);
          const interval = window.setInterval(() => {
            countdown -= 1;
            if (countdown <= 0) {
              window.clearInterval(interval);
              setAutoAdvanceTimer(null);
              setCurrentStepIndex(stepIdx + 1);
              window.setTimeout(() => {
                handleSpeakStepIndex(stepIdx + 1, true);
              }, 100);
            } else {
              setAutoAdvanceTimer(countdown);
            }
          }, 1000);
          advanceTimerRef.current = interval;
        } else {
          setContinuousReading(false);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        setContinuousReading(false);
        setTtsError('La locución automática fue interrumpida. Puedes seguir con la lectura visual.');
      },
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setContinuousReading(false);
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setAutoAdvanceTimer(null);
  };

  const handleNextStep = () => {
    handleStopSpeaking();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    handleStopSpeaking();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      rcpMetronome.stop();
      setIsMetronomeActive(false);
    } else {
      rcpMetronome.start();
      setIsMetronomeActive(true);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Barra de navegación superior de la guía */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </button>

        <button
          onClick={onTogglePanicMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors ${
            isPanicMode
              ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
          title="Ver en letras gigantes y alto contraste"
        >
          <Eye className="w-4 h-4" />
          <span>{isPanicMode ? 'Modo Normal' : 'Modo Pánico'}</span>
        </button>
      </div>

      {/* Título de la Guía y Nivel de Urgencia */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-bold">
          <span
            className={
              guide.urgency === 'critica'
                ? 'text-red-600'
                : guide.urgency === 'alta'
                ? 'text-amber-600'
                : 'text-stone-600'
            }
          >
            {guide.urgency === 'critica'
              ? '● Emergencia Crítica con Riesgo Vital'
              : guide.urgency === 'alta'
              ? '● Urgencia Médica Alta'
              : '● Atención Moderada'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {guide.title}
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
          {guide.shortDescription}
        </p>

        {/* Selector de Variante (Adulto vs Bebé) */}
        {guide.variants.length > 1 && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Seleccionar quién necesita auxilio:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {guide.variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIndex;
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/80 text-red-950 font-bold shadow-xs ring-1 ring-red-500'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <div className="text-sm font-bold">{variant.name}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {variant.targetGroup}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notificación visual de contingencia / Fallback si falla Text-To-Speech */}
      {ttsError && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-2.5 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{ttsError}</span>
          </div>
          <button
            onClick={() => setTtsError(null)}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 px-2 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 shrink-0"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Controles de Asistencia por Voz y Metrónomo (Offline) */}
      <div className="bg-stone-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Guía Asistida por Voz</span>
              {isSpeaking && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-300">
              {autoAdvanceTimer !== null
                ? `Pausa. Siguiente paso en ${autoAdvanceTimer}s...`
                : isSpeaking
                ? 'Leyendo instrucción en voz alta...'
                : '100% nativa sin conexión'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Lectura Continua */}
          {!isSpeaking ? (
            <button
              onClick={() => handleSpeakCurrentStep(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm"
              title="Iniciar lectura de todos los pasos con pausas"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lectura Continua</span>
            </button>
          ) : (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
              title="Pausar o silenciar la voz"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pausar Voz</span>
            </button>
          )}

          {/* Botón para solo este paso */}
          {!isSpeaking && (
            <button
              onClick={() => handleSpeakCurrentStep(false)}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold"
              title="Escuchar solo el paso actual"
            >
              Solo este paso
            </button>
          )}
        </div>
      </div>

      {/* Metrónomo para RCP */}
      {guide.hasMetronome && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                isMetronomeActive && beatPulse
                  ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-300'
                  : 'bg-red-200 text-red-800 scale-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isMetronomeActive ? 'fill-current' : ''}`} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-red-950">Ritmo de Compresión (110 BPM)</p>
              <p className="text-xs text-red-800">
                {isMetronomeActive
                  ? 'Sigue el bip: presiona el pecho con cada golpe sonoro.'
                  : 'Activa el metrónomo para no perder el compás de reanimación.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleMetronome}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-transform active:scale-95 ${
              isMetronomeActive
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
            }`}
          >
            {isMetronomeActive ? 'Detener Ritmo' : 'Iniciar Ritmo'}
          </button>
        </div>
      )}

      {/* TARJETA DEL PASO ACTUAL (Foco Principal) */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm overflow-hidden">
        {/* Barra de progreso visual de pasos */}
        <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-extrabold text-stone-700 tracking-wide uppercase">
            Paso {currentStepIndex + 1} de {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {currentVariant.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleStopSpeaking();
                  setCurrentStepIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-7 bg-red-600'
                    : idx < currentStepIndex
                    ? 'w-3 bg-stone-400'
                    : 'w-3 bg-stone-300'
                }`}
                title={`Ir al paso ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Ilustración Vectorial Adaptada */}
        <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-center">
          <Illustration type={currentStep.illustrationType} isPanicMode={isPanicMode} />
        </div>

        {/* Contenido Textual del Paso en Gran Tamaño */}
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
            {currentStep.title}
          </h2>

          <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
            {currentStep.instruction}
          </p>

          {/* Consejo Vital (Vida o Muerte) */}
          {currentStep.vitalAdvice && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Indicación Crítica
                </p>
                <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-0.5 leading-snug">
                  {currentStep.vitalAdvice}
                </p>
              </div>
            </div>
          )}

          {/* Advertencia "Qué No Hacer" del paso */}
          {currentStep.warningWhatNotToDo && (
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900 uppercase tracking-wide">
                  Peligro / Qué NO hacer
                </p>
                <p className="text-xs sm:text-sm font-semibold text-red-950 mt-0.5">
                  {currentStep.warningWhatNotToDo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Navegación de Paso (Grandes y Ergonómicos para Pulgar) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className={`py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-400'
                : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 active:scale-98 shadow-xs'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Paso Anterior</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className={`py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md ${
              currentStepIndex === totalSteps - 1
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-red-600 text-white hover:bg-red-700 active:scale-98 shadow-red-200'
            }`}
          >
            <span>Siguiente Paso</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sección Informativa: Errores fatales y Cuándo llamar a la ambulancia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Qué NUNCA hacer */}
        <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200/80 space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Qué NUNCA debes hacer</span>
          </div>
          <ul className="space-y-1.5 text-xs text-red-950 font-medium">
            {guide.whatNotToDo.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-600 font-bold shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cuándo llamar a emergencias */}
        <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-800 font-extrabold text-xs uppercase tracking-wider">
            <PhoneCall className="w-4 h-4 text-stone-600" />
            <span>Cuándo llamar a la ambulancia</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700 font-medium">
            {guide.whenToCallAmbulance.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-stone-900 font-bold shrink-0">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barra Inferior Fija de Llamada de Emergencia (Siempre a mano sin tapar contenido) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-stone-900 truncate">
              ¿La víctima empeora o no responde?
            </p>
            <p className="text-[11px] text-stone-500 font-medium truncate">
              Pide a otra persona que llame o activa el altavoz de tu celular.
            </p>
          </div>

          <a
            href={formatTelUri(currentCountry.defaultEmergencyNumber)}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm shadow-lg shadow-red-200 transition-transform active:scale-95 animate-pulse"
            title={`Llamar a emergencias (${currentCountry.defaultEmergencyNumber})`}
          >
            <PhoneCall className="w-5 h-5" />
            <span>LLAMAR AL {currentCountry.defaultEmergencyNumber}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
