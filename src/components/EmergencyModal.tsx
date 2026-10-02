/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Phone, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import { CountryPreset, EmergencyContact } from '../types';
import { COUNTRY_PRESETS, formatTelUri } from '../data/emergencyContacts';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry: CountryPreset;
  onSelectCountry: (countryId: string) => void;
  customContacts: EmergencyContact[];
  onAddCustomContact: (contact: EmergencyContact) => void;
  onDeleteCustomContact: (contactId: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentCountry,
  onSelectCountry,
  customContacts,
  onAddCustomContact,
  onDeleteCustomContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newDescription, setNewDescription] = useState('');

  if (!isOpen) return null;

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    const contact: EmergencyContact = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      number: newNumber.trim(),
      type: 'personal',
      description: newDescription.trim() || 'Contacto local comunitario',
      isCustom: true,
    };

    onAddCustomContact(contact);
    setNewName('');
    setNewNumber('');
    setNewDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        {/* Encabezado del modal */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-lg font-extrabold tracking-tight">
                Números de Emergencia
              </h2>
              <p className="text-xs text-red-100 font-medium">Marcado rápido directo sin conexión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* Selector de País */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              País / Región de Emergencia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {COUNTRY_PRESETS.map((preset) => {
                const isSelected = preset.id === currentCountry.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectCountry(preset.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-500 font-bold'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-base">{preset.flag}</span>
                    <span className="truncate flex-1">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de números oficiales preseteados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Líneas Oficiales en {currentCountry.name}
              </h3>
            </div>
            <div className="space-y-2">
              {currentCountry.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all shadow-xs"
                >
                  <div className="pr-2 min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">{contact.name}</p>
                    {contact.description && (
                      <p className="text-xs text-stone-500 truncate">{contact.description}</p>
                    )}
                  </div>
                  {/*
                    PUNTO CRÍTICO DE ERROR: No usar window.open ni Javascript onclick para llamadas
                    telefónicas en móviles, ya que puede ser bloqueado por el bloqueador de popups.
                    Usar directamente <a href="tel:..."> con sanitización previa.
                  */}
                  <a
                    href={formatTelUri(contact.number)}
                    className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm shadow-sm transition-transform active:scale-95"
                    title={`Llamar a ${contact.name}`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contactos locales o comunitarios personalizados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Contactos Locales y del Hogar
              </h3>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 p-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar número</span>
                </button>
              )}
            </div>

            {/* Formulario para agregar contacto nuevo */}
            {showAddForm && (
              <form onSubmit={handleCreateContact} className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2.5 mb-3">
                <p className="text-xs font-bold text-stone-800">Nuevo contacto local (ej. Centro Barrial, Médico de cabecera)</p>
                <div>
                  <input
                    type="text"
                    placeholder="Nombre (ej. Dispensario Santa Rosa)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono (ej. 011 4455-6677)"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Detalle o referencia (opcional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Guardar contacto
                  </button>
                </div>
              </form>
            )}

            {customContacts.length === 0 && !showAddForm ? (
              <div className="text-center py-4 px-3 border border-dashed border-stone-200 rounded-xl text-stone-500 text-xs">
                <p>No tienes números locales añadidos todavía.</p>
                <p className="mt-1 text-[11px] text-stone-400">Puedes guardar el teléfono del centro de salud de tu barrio o familiares.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all shadow-xs"
                  >
                    <div className="pr-2 min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">{contact.name}</p>
                      {contact.description && (
                        <p className="text-xs text-stone-500 truncate">{contact.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={formatTelUri(contact.number)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{contact.number}</span>
                      </a>
                      <button
                        onClick={() => onDeleteCustomContact(contact.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Eliminar contacto personalizado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pie con advertencia comunitaria */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center gap-2 text-stone-600 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Los datos se guardan en este dispositivo y están disponibles sin internet.
          </span>
        </div>
      </div>
    </div>
  );
};
