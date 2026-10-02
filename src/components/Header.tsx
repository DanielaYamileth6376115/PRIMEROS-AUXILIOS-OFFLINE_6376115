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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo & Marca con retorno a inicio */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          title="Ir a inicio de AuxilioApp"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-red-200">
            +
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-stone-900 tracking-tight text-lg leading-tight">
                Auxilio<span className="text-red-600">App</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                <WifiOff className="w-3 h-3 text-stone-400" />
                Offline
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">Primeros Auxilios en Casa</p>
          </div>
        </button>

        {/* Acciones principales rápidas */}
        <div className="flex items-center gap-2">
          {/* Botón selector/directorio de emergencias */}
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl transition-colors border border-stone-200/80"
            title="Ver y configurar números de emergencia"
          >
            <span className="text-base leading-none">{currentCountry.flag}</span>
            <span className="hidden sm:inline">{currentCountry.name}</span>
            <Phone className="w-3.5 h-3.5 text-stone-600" />
          </button>

          {/* Botón de Modo Pánico / Alta Visibilidad */}
          <button
            onClick={onTogglePanicMode}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              isPanicMode
                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500 shadow-sm'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
            title="Activar/desactivar modo de alta visibilidad para situaciones de pánico"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xs:inline">{isPanicMode ? 'Modo Normal' : 'Modo Pánico'}</span>
          </button>

          {/* Botón de Llamada Rápida SOS al número principal */}
          <a
            href={`tel:${currentCountry.defaultEmergencyNumber}`}
            className="flex items-center gap-1 px-3 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md shadow-red-200 transition-all active:scale-95 animate-pulse"
            title={`Llamar a emergencias (${currentCountry.defaultEmergencyNumber})`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>SOS {currentCountry.defaultEmergencyNumber}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
