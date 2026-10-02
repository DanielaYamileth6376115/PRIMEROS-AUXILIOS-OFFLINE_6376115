/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { EmergencyGuide, CountryPreset } from '../types';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../utils/speech';
import { Illustration } from './Illustrations';
import { formatTelUri } from '../data/emergencyContacts';

interface PanicModeViewProps {
  guide: EmergencyGuide;
  onExitPanicMode: () => void;
  currentCountry: CountryPreset;
}

export const PanicModeView: React.FC<PanicModeViewProps> = ({
  guide,
  onExitPanicMode,
  currentCountry,
}) => {
  const [variantIndex, setVariantIndex] = useState(0);
  const currentVariant = guide.variants[variantIndex] || guide.variants[0];

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = currentVariant.steps[stepIndex];
  const totalSteps = currentVariant.steps.length;

  const [autoSpeakOnStepChange, setAutoSpeakOnStepChange] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  // Reproducir voz al cambiar de paso si el usuario tiene autoSpeak activado
  useEffect(() => {
    if (!isSpeechSynthesisSupported()) {
      setTtsNotice('Audio no disponible en este dispositivo. Guíate con el texto gigante.');
      return;
    }

    if (autoSpeakOnStepChange) {
      handleSpeakStep();
    }
    return () => {
      stopSpeaking();
    };
  }, [stepIndex, variantIndex]);

  const handleSpeakStep = () => {
    if (!isSpeechSynthesisSupported()) {
      setTtsNotice('Tu navegador no soporta lectura por voz.');
      return;
    }

    stopSpeaking();
    setIsSpeaking(true);
    setTtsNotice(null);
    const text = `${currentStep.title}. ${currentStep.instruction}. ${
      currentStep.vitalAdvice ? 'Atención: ' + currentStep.vitalAdvice : ''
    }`;

    speakText(text, {
      rate: 0.9,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setTtsNotice('Lectura pausada o altavoz silenciado.');
      },
    });
  };

  const handleNext = () => {
    stopSpeaking();
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 select-none font-sans">
      {/* Barra de control superior para pánico */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping inline-block" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400">
            MODO PÁNICO • ALTA VISIBILIDAD
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de narración en voz alta */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
                setIsSpeaking(false);
              } else {
                handleSpeakStep();
              }
            }}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-stone-950 font-black'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
            title="Leer paso en voz alta"
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden xs:inline">{isSpeaking ? 'Hablando' : 'Voz'}</span>
          </button>

          {/* Salir de modo pánico */}
          <button
            onClick={() => {
              stopSpeaking();
              onExitPanicMode();
            }}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold text-xs flex items-center gap-1.5"
            title="Volver al modo normal"
          >
            <X className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Aviso de contingencia si el audio no está disponible */}
      {ttsNotice && (
        <div className="mt-2 py-2 px-3 bg-amber-400/20 border border-amber-400/50 rounded-xl text-amber-300 text-xs font-semibold flex items-center justify-between gap-2 max-w-2xl mx-auto w-full">
          <span>⚠️ {ttsNotice}</span>
          <button
            onClick={() => setTtsNotice(null)}
            className="text-[11px] font-bold text-amber-400 underline shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Contenido principal en letras masivas */}
      <div className="py-4 space-y-4 max-w-2xl mx-auto w-full my-auto">
        {/* Selector de Variante en botones gigantes si hay más de una */}
        {guide.variants.length > 1 && (
          <div className="grid grid-cols-2 gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800">
            {guide.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => {
                  setVariantIndex(idx);
                  setStepIndex(0);
                }}
                className={`py-3 px-2 rounded-xl text-center font-black text-sm tracking-wide transition-all ${
                  idx === variantIndex
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Indicador de Paso Gigante */}
        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-black text-base uppercase tracking-wider">
            {guide.title}
          </span>
          <span className="bg-stone-800 px-3 py-1 rounded-xl text-stone-200 font-black text-sm">
            PASO {stepIndex + 1} DE {totalSteps}
          </span>
        </div>

        {/* Ilustración de alto contraste */}
        <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800 flex items-center justify-center">
          <Illustration type={currentStep.illustrationType} isPanicMode={true} />
        </div>

        {/* Título de instrucción masivo */}
        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          {currentStep.title}
        </h2>

        {/* Explicación en tamaño extra-grande para lectura a distancia */}
        <p className="text-xl sm:text-2xl font-bold text-stone-100 leading-snug tracking-wide">
          {currentStep.instruction}
        </p>

        {/* Advertencia Crítica */}
        {currentStep.vitalAdvice && (
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-red-400 uppercase tracking-widest">
                ¡IMPORTANTE!
              </p>
              <p className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                {currentStep.vitalAdvice}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción táctiles gigantes (Min height 72px para manos temblorosas) */}
      <div className="pt-3 max-w-2xl mx-auto w-full space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className={`min-h-[68px] sm:min-h-[76px] rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-transform active:scale-95 ${
              stepIndex === 0
                ? 'opacity-20 border-stone-800 text-stone-600 cursor-not-allowed'
                : 'border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800'
            }`}
          >
            <ChevronLeft className="w-7 h-7" />
            <span>ANTERIOR</span>
          </button>

          <button
            onClick={handleNext}
            disabled={stepIndex === totalSteps - 1}
            className={`min-h-[68px] sm:min-h-[76px] rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl ${
              stepIndex === totalSteps - 1
                ? 'opacity-40 bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
            }`}
          >
            <span>SIGUIENTE</span>
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Botón de Emergencia SOS Inmediato de 1 toque */}
        <a
          href={formatTelUri(currentCountry.defaultEmergencyNumber)}
          className="w-full min-h-[60px] rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-950 transition-transform active:scale-95"
        >
          <PhoneCall className="w-6 h-6 animate-pulse" />
          <span>LLAMAR AHORA AL {currentCountry.defaultEmergencyNumber}</span>
        </a>
      </div>
    </div>
  );
};
