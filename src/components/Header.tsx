/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhoneCall, Eye, Phone, WifiOff } from 'lucide-react';
import { CountryPreset } from '../types';

interface HeaderProps {
  onOpenEmergencyModal: () => void;
  onTogglePanicMode: () => void;
  isPanicMode: boolean;
  currentCountry: CountryPreset;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onTogglePanicMode,
  isPanicMode,
  currentCountry,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-200 transition-colors shadow-xs">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 min-w-[320px]">
        {/* Logo & Marca (Área táctil mínima de 48px) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-xl p-1 -ml-1 transition-transform active:scale-95 min-h-[48px]"
          title="Ir a inicio de AuxilioApp"
          aria-label="AuxilioApp Inicio"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-2xl shadow-sm">
            +
          </div>
          <div className="hidden min-[360px]:block">
            <div className="flex items-center gap-1">
              <span className="font-black text-stone-950 tracking-tight text-lg leading-none">
                Auxilio<span className="text-red-600">App</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-stone-700 bg-stone-200 px-1.5 py-0.5 rounded">
                <WifiOff className="w-2.5 h-2.5 text-stone-600" />
                Offline
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-semibold mt-0.5">Salud Comunitaria</p>
          </div>
        </button>

        {/* Acciones de la cabecera: Zonas táctiles >= 48px */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón secundario: Selector de País / Configuración */}
          <button
            onClick={onOpenEmergencyModal}
            className="min-h-[48px] min-w-[48px] px-2.5 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl border border-stone-300 transition-colors"
            title="Ver números de emergencia y botiquín"
            aria-label="Directorio de emergencias"
          >
            <span className="text-lg leading-none">{currentCountry.flag}</span>
            <Phone className="w-4 h-4 text-stone-700 shrink-0" />
          </button>

          {/* Botón secundario: Modo Pánico / Alta Visibilidad */}
          <button
            onClick={onTogglePanicMode}
            className={`min-h-[48px] px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-black rounded-xl transition-all ${
              isPanicMode
                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-600 shadow-md'
                : 'bg-stone-900 text-white hover:bg-black'
            }`}
            title="Activar/desactivar modo de alta visibilidad para situaciones de pánico"
            aria-label="Modo Pánico Alta Visibilidad"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{isPanicMode ? 'Normal' : 'Pánico'}</span>
          </button>

          {/* Botón PRINCIPAL DESTACADO: Llamada SOS Directa */}
          <a
            href={`tel:${currentCountry.defaultEmergencyNumber}`}
            className="min-h-[48px] px-3.5 py-2 flex items-center justify-center gap-1.5 text-sm font-black text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md transition-all active:scale-95 animate-pulse"
            title={`Llamar de emergencia al ${currentCountry.defaultEmergencyNumber}`}
            aria-label={`Llamar a emergencias ${currentCountry.defaultEmergencyNumber}`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>SOS {currentCountry.defaultEmergencyNumber}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
