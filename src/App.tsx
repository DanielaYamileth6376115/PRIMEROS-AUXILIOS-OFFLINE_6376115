/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { GuideCatalog } from './components/GuideCatalog';
import { GuideStepViewer } from './components/GuideStepViewer';
import { PanicModeView } from './components/PanicModeView';
import { EmergencyModal } from './components/EmergencyModal';
import { EMERGENCY_GUIDES } from './data/emergencyGuides';
import {
  COUNTRY_PRESETS,
  getSavedCountryId,
  saveCountryId,
  getSavedCustomContacts,
  saveCustomContacts,
} from './data/emergencyContacts';
import { UrgencyLevel, EmergencyContact } from './types';
import { AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  // País actual seleccionado para números de auxilio
  const [selectedCountryId, setSelectedCountryId] = useState<string>(() => getSavedCountryId());
  
  // Contactos personalizados guardados localmente
  const [customContacts, setCustomContacts] = useState<EmergencyContact[]>(() =>
    getSavedCustomContacts()
  );

  // Estados de navegación y catálogo
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'todas'>('todas');

  // Modales y Modos especiales
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isPanicMode, setIsPanicMode] = useState<boolean>(false);

  // Guardar cambios de país en localStorage
  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    saveCountryId(countryId);
  };

  // Manejo de contactos personalizados
  const handleAddCustomContact = (contact: EmergencyContact) => {
    const updated = [contact, ...customContacts];
    setCustomContacts(updated);
    saveCustomContacts(updated);
  };

  const handleDeleteCustomContact = (contactId: string) => {
    const updated = customContacts.filter((c) => c.id !== contactId);
    setCustomContacts(updated);
    saveCustomContacts(updated);
  };

  // País seleccionado actual
  const currentCountry = useMemo(() => {
    return (
      COUNTRY_PRESETS.find((c) => c.id === selectedCountryId) ||
      COUNTRY_PRESETS[0]
    );
  }, [selectedCountryId]);

  // Guía activa (si el usuario abrió alguna)
  const activeGuide = useMemo(() => {
    if (!activeGuideId) return null;
    return EMERGENCY_GUIDES.find((g) => g.id === activeGuideId) || null;
  }, [activeGuideId]);

  // Filtrado reactivo en memoria (100% offline) de guías
  const filteredGuides = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return EMERGENCY_GUIDES.filter((guide) => {
      // Filtro de urgencia
      if (selectedUrgency !== 'todas' && guide.urgency !== selectedUrgency) {
        return false;
      }
      // Búsqueda por texto (título, descripción, palabras clave o variantes)
      if (!query) return true;

      const titleMatch = guide.title.toLowerCase().includes(query);
      const descMatch = guide.shortDescription.toLowerCase().includes(query);
      const keywordMatch = guide.keywords.some((kw) => kw.toLowerCase().includes(query));
      const stepMatch = guide.variants.some((v) =>
        v.steps.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.instruction.toLowerCase().includes(query)
        )
      );

      return titleMatch || descMatch || keywordMatch || stepMatch;
    });
  }, [searchQuery, selectedUrgency]);

  // Alternar modo pánico
  const handleTogglePanicMode = () => {
    // Si no hay ninguna guía abierta y el usuario pulsa pánico, abrimos la primera guía crítica (Atragantamiento)
    if (!activeGuideId && !isPanicMode) {
      setActiveGuideId('atragantamiento');
    }
    setIsPanicMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Barra de cabecera con acceso rápido a llamadas y configuración */}
      <Header
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onTogglePanicMode={handleTogglePanicMode}
        isPanicMode={isPanicMode}
        currentCountry={currentCountry}
        onGoHome={() => {
          setActiveGuideId(null);
          setIsPanicMode(false);
        }}
      />

      {/* Contenedor principal responsive mobile-first */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6">
        {/*
          MODO PÁNICO / ALTA VISIBILIDAD
          Si el usuario activó el modo pánico y hay una guía abierta, se renderiza a pantalla completa
        */}
        {isPanicMode && activeGuide ? (
          <PanicModeView
            guide={activeGuide}
            onExitPanicMode={() => setIsPanicMode(false)}
            currentCountry={currentCountry}
          />
        ) : activeGuide ? (
          /* VISTA DETALLADA PASO A PASO DE LA GUÍA SELECCIONADA */
          <GuideStepViewer
            guide={activeGuide}
            onBack={() => setActiveGuideId(null)}
            currentCountry={currentCountry}
            onTogglePanicMode={handleTogglePanicMode}
            isPanicMode={isPanicMode}
          />
        ) : (
          /* VISTA DE CATÁLOGO Y BÚSQUEDA OFFLINE */
          <div className="space-y-5">
            {/* Aviso de salud comunitaria */}
            <div className="p-3.5 bg-red-600 text-white rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-5 h-5 shrink-0 text-white" />
                <p className="text-xs sm:text-sm font-bold leading-tight">
                  Guías de emergencia para el hogar. No requieren conexión ni datos móviles.
                </p>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="shrink-0 px-2.5 py-1.5 bg-white text-red-700 text-xs font-black rounded-xl hover:bg-red-50 transition-colors"
              >
                Números {currentCountry.flag}
              </button>
            </div>

            {/* Buscador y filtro */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
            />

            {/* Acceso Rápido a Emergencias Más Frecuentes */}
            {!searchQuery && selectedUrgency === 'todas' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                  Acceso Inmediato a Situaciones de Pánico
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setActiveGuideId('atragantamiento')}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white text-left shadow-md shadow-red-200 hover:shadow-lg transition-all active:scale-98"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wider text-red-200">
                      Asfixia / Heimlich
                    </div>
                    <div className="text-base font-black mt-0.5">Atragantamiento</div>
                    <div className="text-[11px] text-red-100 mt-1 font-medium">
                      Adultos, Niños y Bebés
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveGuideId('rcp')}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white text-left shadow-md hover:shadow-lg transition-all active:scale-98"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      Paro Cardíaco
                    </div>
                    <div className="text-base font-black mt-0.5">RCP con Metrónomo</div>
                    <div className="text-[11px] text-stone-300 mt-1 font-medium">
                      Compresiones a 110 BPM
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Catálogo Completo */}
            <GuideCatalog
              guides={filteredGuides}
              onSelectGuide={(id) => setActiveGuideId(id)}
              onClearFilters={() => {
                setSearchQuery('');
                setSelectedUrgency('todas');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer discreto */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4 px-4 text-center text-xs text-stone-500">
        <p className="font-semibold text-stone-700">
          AuxilioApp • Primeros Auxilios Offline para la Comunidad
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Esta aplicación provee orientación inicial ante emergencias y no reemplaza la atención de personal médico profesional.
        </p>
      </footer>

      {/* Modal de Directorio de Números de Emergencia */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentCountry={currentCountry}
        onSelectCountry={handleSelectCountry}
        customContacts={customContacts}
        onAddCustomContact={handleAddCustomContact}
        onDeleteCustomContact={handleDeleteCustomContact}
      />
    </div>
  );
}
