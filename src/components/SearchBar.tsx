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
      {/* Campo de búsqueda con icono y botón de limpiar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar emergencia: Atragantamiento, RCP, Sangrado, Bebé..."
          className="w-full pl-11 pr-10 py-3.5 bg-white text-stone-900 placeholder:text-stone-400 rounded-2xl border-2 border-stone-200 focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all font-medium text-base shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
            title="Borrar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selector de filtro por gravedad (Segmented control interactivo, no pills estáticos) */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => onUrgencyChange('todas')}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-center transition-all ${
            selectedUrgency === 'todas'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => onUrgencyChange('critica')}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-center transition-all ${
            selectedUrgency === 'critica'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-red-700'
          }`}
        >
          Críticas (Riesgo Vital)
        </button>
        <button
          onClick={() => onUrgencyChange('alta')}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-center transition-all ${
            selectedUrgency === 'alta'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-amber-700'
          }`}
        >
          Graves / Altas
        </button>
        <button
          onClick={() => onUrgencyChange('moderada')}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-center transition-all ${
            selectedUrgency === 'moderada'
              ? 'bg-stone-800 text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Moderadas
        </button>
      </div>
    </div>
  );
};
