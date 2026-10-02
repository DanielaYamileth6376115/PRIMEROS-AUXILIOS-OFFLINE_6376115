/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UrgencyLevel = 'critica' | 'alta' | 'moderada';

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  vitalAdvice?: string; // Consejo de vida o muerte (ej. "NO dar golpes en la espalda si la persona tose con fuerza")
  audioText: string;    // Frase concisa y clara optimizada para el sintetizador de voz
  illustrationType: 'heimlich_adult' | 'heimlich_baby' | 'cpr_chest' | 'cpr_baby' | 'burn_cooling' | 'wound_pressure' | 'recovery_position' | 'seizure_safe' | 'general';
  warningWhatNotToDo?: string;
  durationSeconds?: number;
}

export interface GuideVariant {
  id: string;
  name: string;        // ej. "Adultos y Niños (>1 año)" o "Bebés / Lactantes (<1 año)"
  targetGroup: string; // Resumen breve de cuándo aplica
  steps: GuideStep[];
}

export interface EmergencyGuide {
  id: string;
  title: string;
  shortDescription: string;
  urgency: UrgencyLevel;
  iconName: string;
  keywords: string[];
  variants: GuideVariant[];
  whatNotToDo: string[];         // Errores fatales comunes
  whenToCallAmbulance: string[]; // Cuándo llamar inmediatamente al 911 / ambulancia
  hasMetronome?: boolean;        // Si incluye metrónomo de RCP (100-120 BPM)
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: 'ambulancia' | 'bomberos' | 'policia' | 'toxicologia' | 'personal';
  description?: string;
  isCustom?: boolean;
}

export interface CountryPreset {
  id: string;
  name: string;
  flag: string;
  defaultEmergencyNumber: string;
  contacts: EmergencyContact[];
}
