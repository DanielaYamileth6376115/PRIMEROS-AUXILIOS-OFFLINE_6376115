/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuxilioAppState } from '../types';

/**
 * SERVICIO DE PERSISTENCIA Y RESPALDO LOCAL (100% Offline)
 * -----------------------------------------------------------------
 * Este módulo centraliza la interacción con el almacenamiento local del dispositivo (localStorage).
 * Garantiza que la configuración regional, números de emergencia editados y notas del botiquín
 * sobrevivan al cerrar la app o reiniciar el teléfono.
 */

export const STORAGE_KEY = 'auxilio_app_master_data_v1';

/**
 * Datos por defecto cuando la app se abre por primera vez o tras restablecer.
 */
export const DEFAULT_APP_STATE: AuxilioAppState = {
  version: 1,
  selectedCountryId: 'sv', // Predeterminado El Salvador
  customContacts: [
    {
      id: 'custom-dispensario',
      name: 'Unidad de Salud / Dispensario Local',
      number: '22001122',
      type: 'personal',
      description: 'Centro de atención primaria de la comunidad',
      isCustom: true,
    },
    {
      id: 'custom-familiar',
      name: 'Contacto Familiar de Auxilio',
      number: '70112233',
      type: 'personal',
      description: 'Hermano / Vecino de confianza para emergencias',
      isCustom: true,
    },
  ],
  botiquinNotes: 'Botiquín ubicado en el mueble alto del pasillo principal, lejos del alcance de los niños. Incluye termómetro, gasas estériles, vendas, alcohol al 70%, agua oxigenada y solución antiséptica.',
  botiquinItems: [
    { id: 'item-1', name: 'Gasas estériles y vendas elásticas', location: 'Cajón superior botiquín' },
    { id: 'item-2', name: 'Termómetro digital', location: 'Estuche plástico lateral' },
    { id: 'item-3', name: 'Tijeras de punta roma y guantes de látex', location: 'Bolsillo interno' },
  ],
  lastUpdated: new Date().toISOString(),
};

/**
 * Carga los datos almacenados en el dispositivo.
 * Si es la primera vez que se abre o si hay datos corruptos, devuelve el estado por defecto.
 */
export function cargarDatos(): AuxilioAppState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_APP_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Primera apertura: inicializamos con datos por defecto
      guardarDatos(DEFAULT_APP_STATE);
      return DEFAULT_APP_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<AuxilioAppState>;

    // Validamos integridad básica del esquema para evitar caídas
    return {
      version: parsed.version || 1,
      selectedCountryId: parsed.selectedCountryId || DEFAULT_APP_STATE.selectedCountryId,
      customContacts: Array.isArray(parsed.customContacts) ? parsed.customContacts : DEFAULT_APP_STATE.customContacts,
      botiquinNotes: typeof parsed.botiquinNotes === 'string' ? parsed.botiquinNotes : DEFAULT_APP_STATE.botiquinNotes,
      botiquinItems: Array.isArray(parsed.botiquinItems) ? parsed.botiquinItems : DEFAULT_APP_STATE.botiquinItems,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[AuxilioApp] Error al leer localStorage. Restaurando predeterminados:', err);
    return DEFAULT_APP_STATE;
  }
}

/**
 * Guarda el estado actual en el localStorage del navegador/dispositivo.
 */
export function guardarDatos(nuevoEstado: Partial<AuxilioAppState>): AuxilioAppState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_APP_STATE;
  }

  try {
    const estadoActual = cargarDatos();
    const estadoActualizado: AuxilioAppState = {
      ...estadoActual,
      ...nuevoEstado,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoActualizado));
    return estadoActualizado;
  } catch (err) {
    console.error('[AuxilioApp] Error al escribir en localStorage (almacenamiento lleno o deshabilitado):', err);
    return DEFAULT_APP_STATE;
  }
}

/**
 * Restablece la aplicación a la configuración de fábrica (borra personalizaciones).
 */
export function restablecerDatos(): AuxilioAppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return guardarDatos(DEFAULT_APP_STATE);
  } catch (err) {
    console.warn('[AuxilioApp] Error al limpiar localStorage:', err);
    return DEFAULT_APP_STATE;
  }
}

/**
 * Exporta la configuración, números y notas a un archivo .json descargable.
 * PUNTO CRÍTICO: No usamos window.open() para evitar bloqueos en celulares e iframes;
 * usamos la creación de un elemento ancla con URL de objeto Blob y trigger click().
 */
export function exportarJSON(state: AuxilioAppState): void {
  try {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const fechaHoy = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `auxilioapp_respaldo_${fechaHoy}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Limpieza de memoria
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error('[AuxilioApp] Error al exportar archivo JSON:', err);
    throw new Error('No se pudo generar el archivo de respaldo.');
  }
}

/**
 * Importa y valida un archivo .json de respaldo provisto por el usuario.
 */
export function importarJSON(file: File): Promise<AuxilioAppState> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se seleccionó ningún archivo.'));
      return;
    }

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('El archivo seleccionado no tiene formato .json válido.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const contenido = event.target?.result as string;
        const parsed = JSON.parse(contenido);

        // Validación de estructura mínima
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Formato de datos no reconocido.');
        }

        const estadoValidado: AuxilioAppState = {
          version: parsed.version || 1,
          selectedCountryId: parsed.selectedCountryId || 'sv',
          customContacts: Array.isArray(parsed.customContacts) ? parsed.customContacts : [],
          botiquinNotes: typeof parsed.botiquinNotes === 'string' ? parsed.botiquinNotes : '',
          botiquinItems: Array.isArray(parsed.botiquinItems) ? parsed.botiquinItems : [],
          lastUpdated: new Date().toISOString(),
        };

        // Guardamos inmediatamente en localStorage
        guardarDatos(estadoValidado);
        resolve(estadoValidado);
      } catch (err) {
        console.error('[AuxilioApp] Error al parsear JSON importado:', err);
        reject(new Error('El archivo JSON está dañado o no corresponde a AuxilioApp.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo en el dispositivo.'));
    };

    reader.readAsText(file);
  });
}
