/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertCircle,
  HeartPulse,
  Flame,
  Droplet,
  Activity,
  UserX,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EmergencyGuide } from '../types';

interface GuideCatalogProps {
  guides: EmergencyGuide[];
  onSelectGuide: (guideId: string) => void;
  onClearFilters: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  AlertCircle: <AlertCircle className="w-7 h-7 text-red-700" />,
  HeartPulse: <HeartPulse className="w-7 h-7 text-red-700" />,
  Flame: <Flame className="w-7 h-7 text-amber-700" />,
  Droplet: <Droplet className="w-7 h-7 text-red-700" />,
  Activity: <Activity className="w-7 h-7 text-amber-700" />,
  UserX: <UserX className="w-7 h-7 text-stone-700" />,
  ShieldAlert: <ShieldAlert className="w-7 h-7 text-amber-700" />,
};

export const GuideCatalog: React.FC<GuideCatalogProps> = ({
  guides,
  onSelectGuide,
  onClearFilters,
}) => {
  if (guides.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-3xl border-2 border-stone-300 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-black text-stone-950 text-xl">No encontramos esa emergencia</h3>
        <p className="text-stone-800 text-base max-w-sm mx-auto mt-2 leading-relaxed">
          Intenta buscar por síntomas como "ahogo", "bebé", "fuego", "sangre", "corazón" o restablece los filtros.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-5 min-h-[48px] px-6 py-2.5 bg-stone-950 text-white rounded-xl text-sm font-black hover:bg-black transition-transform active:scale-95"
        >
          Ver todas las guías
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-stone-700 uppercase tracking-widest">
          Guías de Primeros Auxilios ({guides.length})
        </h2>
        <span className="text-xs text-stone-600 font-bold">100% Offline</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guides.map((guide) => {
          const isCritical = guide.urgency === 'critica';
          const icon = ICON_MAP[guide.iconName] || <AlertCircle className="w-7 h-7 text-red-700" />;

          return (
            <button
              key={guide.id}
              onClick={() => onSelectGuide(guide.id)}
              className={`group text-left p-4 sm:p-5 rounded-2xl bg-white border-2 transition-all relative overflow-hidden flex flex-col justify-between hover:shadow-lg active:scale-[0.99] min-h-[140px] focus:outline-none focus:ring-4 focus:ring-red-100 ${
                isCritical
                  ? 'border-red-400 hover:border-red-600 bg-red-50/20'
                  : 'border-stone-300 hover:border-stone-400'
              }`}
              aria-label={`Abrir guía de ${guide.title}`}
            >
              {/* Franja de acento superior para emergencias críticas */}
              {isCritical && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
              )}

              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-red-100' : 'bg-stone-100'
                    }`}
                  >
                    {icon}
                  </div>

                  {/* Metadata de urgencia de alto contraste */}
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span
                      className={
                        isCritical
                          ? 'text-red-700'
                          : guide.urgency === 'alta'
                          ? 'text-amber-800'
                          : 'text-stone-700'
                      }
                    >
                      {isCritical ? '● Riesgo Vital' : guide.urgency === 'alta' ? '● Urgencia Alta' : '● Moderada'}
                    </span>
                    {guide.hasMetronome && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-800 flex items-center gap-0.5">
                          <Sparkles className="w-3.5 h-3.5" /> Metrónomo
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Título de guía >= 20px (Requisito UX) */}
                <h3 className="font-black text-stone-950 text-xl sm:text-2xl leading-tight group-hover:text-red-700 transition-colors">
                  {guide.title}
                </h3>

                {/* Descripción >= 16px (Requisito UX) con alto contraste para sol */}
                <p className="text-stone-800 text-base mt-2 line-clamp-2 leading-normal font-medium">
                  {guide.shortDescription}
                </p>
              </div>

              {/* Botón táctil inferior de la tarjeta >= 48px */}
              <div className="mt-4 pt-3 border-t-2 border-stone-200 flex items-center justify-between min-h-[48px]">
                <span className="text-xs font-bold text-stone-600">
                  {guide.variants.length > 1
                    ? `${guide.variants.map((v) => v.name.split(' ')[0]).join(' / ')}`
                    : 'Protocolo completo'}
                </span>
                <span className="font-black text-sm text-red-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver guía
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
