/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryPreset, EmergencyContact } from '../types';

/**
 * Presets de números de emergencia para países hispanohablantes e internacional.
 * NOTA: Cada país tiene números unificados o específicos (Ambulancia, Bomberos, Policía).
 * AuxilioApp permite cambiar de país rápidamente y añadir contactos comunitarios/locales.
 */
export const COUNTRY_PRESETS: CountryPreset[] = [
  {
    id: 'ar',
    name: 'Argentina',
    flag: '🇦🇷',
    defaultEmergencyNumber: '107',
    contacts: [
      { id: 'ar-same', name: 'Ambulancia (SAME / Salud)', number: '107', type: 'ambulancia', description: 'Emergencias médicas en vía pública y hogar' },
      { id: 'ar-911', name: 'Emergencias Unificadas', number: '911', type: 'policia', description: 'Central nacional de emergencias' },
      { id: 'ar-bomberos', name: 'Bomberos', number: '100', type: 'bomberos', description: 'Incendios, rescates y materiales peligrosos' },
      { id: 'ar-toxi', name: 'Centro Toxicológico Posadas', number: '08003330160', type: 'toxicologia', description: 'Atención médica telefónica 24hs por venenos o químicos' },
    ],
  },
  {
    id: 'es',
    name: 'España',
    flag: '🇪🇸',
    defaultEmergencyNumber: '112',
    contacts: [
      { id: 'es-112', name: 'Emergencias General', number: '112', type: 'ambulancia', description: 'Servicio único europeo de urgencias' },
      { id: 'es-salud', name: 'Urgencias Sanitarias', number: '061', type: 'ambulancia', description: 'Atención médica urgente según Comunidad' },
      { id: 'es-bomberos', name: 'Bomberos', number: '080', type: 'bomberos', description: 'Incendios y salvamento urbano' },
      { id: 'es-toxi', name: 'Toxicología Nacional', number: '915620420', type: 'toxicologia', description: 'Instituto Nacional de Toxicología y Ciencias Forenses' },
    ],
  },
  {
    id: 'mx',
    name: 'México',
    flag: '🇲🇽',
    defaultEmergencyNumber: '911',
    contacts: [
      { id: 'mx-911', name: 'Emergencias 911', number: '911', type: 'ambulancia', description: 'Línea única nacional para ambulancia, bomberos y policía' },
      { id: 'mx-cruzroja', name: 'Cruz Roja Mexicana', number: '065', type: 'ambulancia', description: 'Socorro y ambulancias médicas' },
      { id: 'mx-bomberos', name: 'Bomberos', number: '911', type: 'bomberos', description: 'Vía central 911 o estación local' },
      { id: 'mx-toxi', name: 'Centro Toxicológico Nacional', number: '8000092800', type: 'toxicologia', description: 'Asistencia inmediata en envenenamientos' },
    ],
  },
  {
    id: 'co',
    name: 'Colombia',
    flag: '🇨🇴',
    defaultEmergencyNumber: '123',
    contacts: [
      { id: 'co-123', name: 'Línea de Emergencias', number: '123', type: 'ambulancia', description: 'Despacho central de ambulancias, bomberos y policía' },
      { id: 'co-cruzroja', name: 'Cruz Roja Colombiana', number: '132', type: 'ambulancia', description: 'Atención médica prehospitalaria' },
      { id: 'co-bomberos', name: 'Bomberos', number: '119', type: 'bomberos', description: 'Control de fuegos y rescate' },
      { id: 'co-toxi', name: 'Toxicología MinSalud', number: '018000916012', type: 'toxicologia', description: 'Línea nacional de asesoría toxicológica' },
    ],
  },
  {
    id: 'cl',
    name: 'Chile',
    flag: '🇨🇱',
    defaultEmergencyNumber: '131',
    contacts: [
      { id: 'cl-samu', name: 'SAMU Ambulancia', number: '131', type: 'ambulancia', description: 'Atención médica de urgencia' },
      { id: 'cl-bomberos', name: 'Bomberos', number: '132', type: 'bomberos', description: 'Rescate e incendios' },
      { id: 'cl-carabineros', name: 'Carabineros (Policía)', number: '133', type: 'policia', description: 'Seguridad y auxilio' },
      { id: 'cl-cituc', name: 'CITUC Toxicología UC', number: '226353800', type: 'toxicologia', description: 'Información toxicológica y farmacológica 24hs' },
    ],
  },
  {
    id: 'pe',
    name: 'Perú',
    flag: '🇵🇪',
    defaultEmergencyNumber: '106',
    contacts: [
      { id: 'pe-samu', name: 'SAMU Ambulancia', number: '106', type: 'ambulancia', description: 'Atención móvil de urgencias' },
      { id: 'pe-bomberos', name: 'Bomberos Voluntarios', number: '116', type: 'bomberos', description: 'Central de emergencias bomberiles' },
      { id: 'pe-policia', name: 'Policía Nacional', number: '105', type: 'policia', description: 'Central de radiopatrullas' },
    ],
  },
  {
    id: 'intl',
    name: 'Internacional / Universal',
    flag: '🌐',
    defaultEmergencyNumber: '112',
    contacts: [
      { id: 'intl-112', name: 'Emergencias GSM Universal', number: '112', type: 'ambulancia', description: 'Funciona en casi cualquier red celular del mundo' },
      { id: 'intl-911', name: 'Emergencias 911', number: '911', type: 'ambulancia', description: 'Estándar en América del Norte y compatible globalmente' },
    ],
  },
];

const STORAGE_KEYS = {
  SELECTED_COUNTRY: 'auxilio_selected_country_id',
  CUSTOM_CONTACTS: 'auxilio_custom_contacts',
};

/**
 * Obtiene el país seleccionado por el usuario, o detecta España/Argentina/Universal por defecto.
 * PUNTO CRÍTICO DE ERROR: No asumir que localStorage siempre está disponible (ej. modo incógnito
 * estricto de Safari puede arrojar SecurityError). Manejar siempre con try/catch.
 */
export function getSavedCountryId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRY);
    if (saved && COUNTRY_PRESETS.some((p) => p.id === saved)) {
      return saved;
    }
  } catch (err) {
    console.warn('[AuxilioApp] No se pudo leer localStorage:', err);
  }
  return 'ar'; // Por defecto Argentina (o el primero de la lista)
}

export function saveCountryId(countryId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_COUNTRY, countryId);
  } catch (err) {
    console.warn('[AuxilioApp] No se pudo guardar país en localStorage:', err);
  }
}

/**
 * Obtiene contactos personalizados (guardados por la familia, centro barrial, etc.)
 */
export function getSavedCustomContacts(): EmergencyContact[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CONTACTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[AuxilioApp] Error al deserializar contactos personalizados:', err);
  }
  return [];
}

export function saveCustomContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTACTS, JSON.stringify(contacts));
  } catch (err) {
    console.warn('[AuxilioApp] Error al guardar contactos en localStorage:', err);
  }
}

/**
 * PUNTO CRÍTICO DE ERROR AL LLAMAR: Los números telefónicos deben estar limpios
 * para el enlace `tel:`. Si tienen espacios o guiones ("0800-333-0160"), algunos navegadores
 * móviles o apps de llamadas fallan al interpretar el URI. Esta función los normaliza.
 */
export function formatTelUri(phone: string): string {
  const cleanNumber = phone.replace(/[^\d+]/g, '');
  return `tel:${cleanNumber}`;
}
