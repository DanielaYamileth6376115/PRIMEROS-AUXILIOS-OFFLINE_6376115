/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { GuideCatalog } from './components/GuideCatalog';
import { GuideStepViewer } from './components/GuideStepViewer';
import { PanicModeView } from './components/PanicModeView';
import { EmergencyModal } from './components/EmergencyModal';
import { TriageModal } from './components/TriageModal';
import { EMERGENCY_GUIDES } from './data/emergencyGuides';
import { COUNTRY_PRESETS } from './data/emergencyContacts';
import {
  cargarDatos,
  guardarDatos,
  restablecerDatos,
  exportarJSON,
  importarJSON,
} from './utils/storage';
import { UrgencyLevel, EmergencyContact, AuxilioAppState } from './types';
import { HeartHandshake, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Estado maestro persistido en localStorage
  const [appState, setAppState] = useState<AuxilioAppState>(() => cargarDatos());

  // Estados de navegación y catálogo
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'todas'>('todas');

  // Modales y Modos especiales
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState<boolean>(false);
  const [isPanicMode, setIsPanicMode] = useState<boolean>(false);

  // Retroalimentación humana: Notificación flotante temporal
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  // Guardar cambios de país en localStorage
  const handleSelectCountry = (countryId: string) => {
    const updated = guardarDatos({ selectedCountryId: countryId });
    setAppState(updated);
    showToast('País y números de auxilio actualizados.', 'success');
  };

  // Manejo de contactos personalizados
  const handleAddCustomContact = (contact: EmergencyContact) => {
    const updatedContacts = [contact, ...appState.customContacts];
    const updated = guardarDatos({ customContacts: updatedContacts });
    setAppState(updated);
    showToast('Contacto guardado correctamente en tu teléfono.', 'success');
  };

  const handleDeleteCustomContact = (contactId: string) => {
    const updatedContacts = appState.customContacts.filter((c) => c.id !== contactId);
    const updated = guardarDatos({ customContacts: updatedContacts });
    setAppState(updated);
    showToast('Contacto eliminado de tu lista local.', 'info');
  };

  // Manejo de notas del botiquín
  const handleUpdateBotiquinNotes = (notes: string) => {
    const updated = guardarDatos({ botiquinNotes: notes });
    setAppState(updated);
    showToast('Notas del botiquín guardadas correctamente.', 'success');
  };

  // Restablecer a valores de fábrica
  const handleResetDefaults = () => {
    const resetState = restablecerDatos();
    setAppState(resetState);
    showToast('Configuración restablecida a valores por defecto.', 'info');
  };

  // Exportar copia de seguridad en JSON
  const handleExportBackup = () => {
    try {
      exportarJSON(appState);
      showToast('Copia de respaldo descargada en tu celular.', 'success');
    } catch {
      showToast('No se pudo generar el archivo de respaldo.', 'error');
    }
  };

  // Importar copia de seguridad desde archivo JSON
  const handleImportBackup = async (file: File) => {
    try {
      const imported = await importarJSON(file);
      setAppState(imported);
      showToast('Copia de respaldo importada con éxito.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo leer el archivo de respaldo.', 'error');
    }
  };

  // País seleccionado actual
  const currentCountry = useMemo(() => {
    return (
      COUNTRY_PRESETS.find((c) => c.id === appState.selectedCountryId) ||
      COUNTRY_PRESETS.find((c) => c.id === 'sv') ||
      COUNTRY_PRESETS[0]
    );
  }, [appState.selectedCountryId]);

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
    if (!activeGuideId && !isPanicMode) {
      setActiveGuideId('atragantamiento');
    }
    setIsPanicMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 flex flex-col font-sans min-w-[320px]">
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

      {/* Contenedor principal responsive mobile-first adaptado desde 320px */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
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
            {/* Estado Vacío / Bienvenida clara (Requisito UX) */}
            <div className="p-4 sm:p-5 bg-white border-2 border-stone-300 rounded-3xl shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-emerald-800" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-stone-950 leading-tight">
                    Tu botiquín y guías están listos para usar sin internet.
                  </h1>
                  <p className="text-sm font-semibold text-stone-700 mt-0.5">
                    Seleccioná una emergencia para comenzar la asistencia inmediata.
                  </p>
                </div>
              </div>
            </div>

            {/* Aviso informativo de salud comunitaria */}
            <div className="p-3.5 bg-red-700 text-white rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-6 h-6 shrink-0 text-white" />
                <p className="text-xs sm:text-sm font-bold leading-tight">
                  Emergencias del hogar. 100% disponible sin datos móviles ni saldo.
                </p>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="shrink-0 min-h-[48px] px-3.5 py-2 bg-white text-red-900 text-xs font-black rounded-xl hover:bg-stone-100 transition-colors shadow-xs"
              >
                Números {currentCountry.flag}
              </button>
            </div>

            {/* Buscador y filtro con etiquetas y zonas táctiles de 48px */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
            />

            {/* Asistente de Triage Inteligente (Sello de IA + Failover Offline) */}
            <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl border-2 border-stone-800 shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Evaluación Inteligente
                    </span>
                    <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded">
                      Gemini + Offline
                    </span>
                  </div>
                  <p className="text-sm font-black text-white mt-0.5">
                    ¿No sabés qué emergencia es?
                  </p>
                  <p className="text-xs text-stone-300">
                    Describí lo que pasa y la IA determinará la gravedad y guía.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTriageModalOpen(true)}
                className="shrink-0 min-h-[48px] px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 text-xs font-black rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span>Hacer Triage</span>
              </button>
            </div>

            {/* Acceso Rápido a Emergencias Más Frecuentes (Zonas táctiles masivas) */}
            {!searchQuery && selectedUrgency === 'todas' && (
              <div className="space-y-2">
                <p className="text-xs font-black text-stone-800 uppercase tracking-wider px-1">
                  Acceso Rápido a Situaciones Críticas
                </p>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveGuideId('atragantamiento')}
                    className="min-h-[72px] p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white text-left shadow-md hover:shadow-lg transition-all active:scale-98 border-2 border-red-800 flex flex-col justify-between"
                  >
                    <div className="text-xs font-black uppercase tracking-wider text-red-200">
                      Asfixia / Heimlich
                    </div>
                    <div className="text-xl font-black mt-1">Atragantamiento</div>
                    <div className="text-xs text-red-100 mt-1 font-semibold">
                      Adultos, Niños y Lactantes
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveGuideId('rcp')}
                    className="min-h-[72px] p-4 rounded-2xl bg-stone-950 text-white text-left shadow-md hover:shadow-lg transition-all active:scale-98 border-2 border-stone-800 flex flex-col justify-between"
                  >
                    <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Paro Cardíaco
                    </div>
                    <div className="text-xl font-black mt-1">RCP con Metrónomo</div>
                    <div className="text-xs text-stone-300 mt-1 font-semibold">
                      Compresiones a 110 BPM
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Catálogo Completo con fuentes en >= 16px y títulos en >= 20px */}
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

      {/* Retroalimentación humana flotante (Toast temporal) */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none animate-in slide-in-from-bottom duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 text-sm font-black pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-900 border-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-950 border-red-500 text-white'
                : 'bg-stone-900 border-stone-700 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.text}</span>
          </div>
        </div>
      )}

      {/* Footer accesible */}
      <footer className="mt-auto border-t-2 border-stone-200 bg-white py-4 px-4 text-center text-xs text-stone-600">
        <p className="font-bold text-stone-900">
          AuxilioApp • Primeros Auxilios Offline para el Hogar y la Comunidad
        </p>
        <p className="text-[11px] text-stone-500 mt-1">
          Guías orientativas estandarizadas. En caso de riesgo vital, llama de inmediato a emergencias.
        </p>
      </footer>

      {/* Modal de Directorio de Números de Emergencia */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentCountry={currentCountry}
        onSelectCountry={handleSelectCountry}
        customContacts={appState.customContacts}
        onAddCustomContact={handleAddCustomContact}
        onDeleteCustomContact={handleDeleteCustomContact}
        botiquinNotes={appState.botiquinNotes}
        onUpdateBotiquinNotes={handleUpdateBotiquinNotes}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDefaults={handleResetDefaults}
      />

      {/* Modal de Triage y Clasificación con Inteligencia Artificial */}
      <TriageModal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        currentCountry={currentCountry}
        onOpenGuide={(guideId) => {
          setActiveGuideId(guideId);
        }}
      />
    </div>
  );
}
