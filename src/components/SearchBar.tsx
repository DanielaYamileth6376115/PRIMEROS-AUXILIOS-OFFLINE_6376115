/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { UrgencyLevel } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUrgency: UrgencyLevel | 'todas';
  onUrgencyChange: (urgency: UrgencyLevel | 'todas') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedUrgency,
  onUrgencyChange,
}) => {
  return (
    <div className="space-y-3">
      {/* Campo de búsqueda con etiqueta visible permanente (Requisito UX) */}
      <div>
        <label
          htmlFor="emergency-search-input"
          className="block text-sm font-black text-stone-900 mb-1.5 uppercase tracking-wider"
        >
          Buscar Guía o Síntoma
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-600">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="emergency-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ej: Atragantamiento, RCP, Quemadura, Infarto..."
            className="w-full pl-11 pr-12 min-h-[48px] bg-white text-stone-950 placeholder:text-stone-500 rounded-2xl border-2 border-stone-300 focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all font-semibold text-base shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 min-w-[48px] min-h-[48px] flex items-center justify-center text-stone-600 hover:text-stone-950 active:scale-95"
              title="Borrar búsqueda"
              aria-label="Borrar texto de búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de filtro por gravedad: Zonas táctiles amplias (mínimo 48px) para pulgar */}
      <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
          Filtrar por Urgencia Médica
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-stone-200/80 rounded-2xl">
          <button
            onClick={() => onUrgencyChange('todas')}
            className={`min-h-[48px] px-3 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center ${
              selectedUrgency === 'todas'
                ? 'bg-stone-950 text-white shadow-sm ring-2 ring-stone-900'
                : 'bg-white/80 text-stone-800 hover:bg-white active:bg-stone-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => onUrgencyChange('critica')}
            className={`min-h-[48px] px-2 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center ${
              selectedUrgency === 'critica'
                ? 'bg-red-700 text-white shadow-sm ring-2 ring-red-800 font-extrabold'
                : 'bg-white/80 text-red-900 hover:bg-white active:bg-stone-100'
            }`}
          >
            Críticas (Vida)
          </button>
          <button
            onClick={() => onUrgencyChange('alta')}
            className={`min-h-[48px] px-2 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center ${
              selectedUrgency === 'alta'
                ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-800 font-extrabold'
                : 'bg-white/80 text-amber-950 hover:bg-white active:bg-stone-100'
            }`}
          >
            Graves
          </button>
          <button
            onClick={() => onUrgencyChange('moderada')}
            className={`min-h-[48px] px-2 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center ${
              selectedUrgency === 'moderada'
                ? 'bg-stone-800 text-white shadow-sm ring-2 ring-stone-900 font-extrabold'
                : 'bg-white/80 text-stone-800 hover:bg-white active:bg-stone-100'
            }`}
          >
            Moderadas
          </button>
        </div>
      </div>
    </div>
  );
};
