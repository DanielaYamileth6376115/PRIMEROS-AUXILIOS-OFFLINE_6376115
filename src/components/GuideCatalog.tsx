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
  AlertCircle: <AlertCircle className="w-6 h-6 text-red-600" />,
  HeartPulse: <HeartPulse className="w-6 h-6 text-red-600" />,
  Flame: <Flame className="w-6 h-6 text-amber-600" />,
  Droplet: <Droplet className="w-6 h-6 text-red-600" />,
  Activity: <Activity className="w-6 h-6 text-amber-600" />,
  UserX: <UserX className="w-6 h-6 text-stone-600" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-amber-600" />,
};

export const GuideCatalog: React.FC<GuideCatalogProps> = ({
  guides,
  onSelectGuide,
  onClearFilters,
}) => {
  if (guides.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-3xl border border-stone-200">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg">No encontramos esa emergencia</h3>
        <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1">
          Intenta buscar por síntomas como "ahogo", "bebé", "fuego", "sangre", "corazón" o limpia los filtros.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
        >
          Ver todas las guías
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Guías Paso a Paso ({guides.length})
        </h2>
        <span className="text-[11px] text-stone-400 font-medium">Disponibles 100% offline</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {guides.map((guide) => {
          const isCritical = guide.urgency === 'critica';
          const icon = ICON_MAP[guide.iconName] || <AlertCircle className="w-6 h-6 text-red-600" />;

          return (
            <button
              key={guide.id}
              onClick={() => onSelectGuide(guide.id)}
              className={`group text-left p-4 rounded-2xl bg-white border transition-all relative overflow-hidden flex flex-col justify-between hover:shadow-md active:scale-[0.99] ${
                isCritical
                  ? 'border-red-200 hover:border-red-400'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Franja de acento para emergencias críticas */}
              {isCritical && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
              )}

              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-red-50' : 'bg-stone-100'
                    }`}
                  >
                    {icon}
                  </div>

                  {/* Metadata limpia sin pills redundantes */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                    <span
                      className={
                        isCritical
                          ? 'text-red-600'
                          : guide.urgency === 'alta'
                          ? 'text-amber-600'
                          : 'text-stone-600'
                      }
                    >
                      {isCritical ? 'Emergencia Crítica' : guide.urgency === 'alta' ? 'Urgencia Alta' : 'Atención Moderada'}
                    </span>
                    {guide.hasMetronome && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700 flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Metrónomo
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-stone-900 text-lg leading-snug group-hover:text-red-600 transition-colors">
                  {guide.title}
                </h3>

                <p className="text-stone-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {guide.shortDescription}
                </p>
              </div>

              {/* Pie de tarjeta con variantes y llamada a la acción */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">
                  {guide.variants.length > 1
                    ? `${guide.variants.map((v) => v.name.split(' ')[0]).join(' / ')}`
                    : 'Protocolo completo'}
                </span>
                <span className="font-bold text-red-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Ver guía
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
