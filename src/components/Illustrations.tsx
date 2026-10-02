/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IllustrationProps {
  type: string;
  isPanicMode?: boolean;
}

export const Illustration: React.FC<IllustrationProps> = ({ type, isPanicMode = false }) => {
  const strokeColor = isPanicMode ? '#fef08a' : '#1c1917'; // Amarillo brillante en pánico o piedra oscuro
  const accentColor = isPanicMode ? '#ef4444' : '#dc2626'; // Rojo de atención médica
  const bodyFill = isPanicMode ? '#292524' : '#f5f5f4';
  const highlightFill = isPanicMode ? '#451a03' : '#fee2e2';

  switch (type) {
    case 'heimlich_adult':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Silueta víctima e inclinación */}
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Víctima inclinada */}
          <path d="M 120 70 Q 140 100 130 150" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <circle cx="110" cy="50" r="18" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          {/* Flecha de inclinación hacia adelante */}
          <path d="M 100 25 C 80 30 65 50 65 65" stroke={accentColor} strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
          <polygon points="65,70 60,60 70,60" fill={accentColor} />
          
          {/* Rescatador detrás */}
          <path d="M 175 60 Q 185 100 180 160" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <circle cx="190" cy="40" r="18" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Brazos rodeando y puño entre ombligo y esternón */}
          <path d="M 170 85 Q 145 95 125 105" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />
          <circle cx="125" cy="105" r="10" fill={highlightFill} stroke={accentColor} strokeWidth="4" />
          
          {/* Flecha de compresión "hacia adentro y hacia arriba" (en J) */}
          <path d="M 125 130 L 125 110 Q 125 100 135 90" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <polygon points="138,85 130,95 138,98" fill={accentColor} />

          {/* Rótulo explicativo */}
          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            PUÑO 2 DEDOS ARRIBA DEL OMBLIGO • HACIA ADENTRO Y ARRIBA
          </text>
        </svg>
      );

    case 'heimlich_baby':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Antebrazo del rescatador apoyado con inclinación descendente */}
          <path d="M 60 145 L 240 100" stroke={strokeColor} strokeWidth="12" strokeLinecap="round" />
          
          {/* Bebé boca abajo a lo largo del brazo */}
          <ellipse cx="140" cy="95" rx="45" ry="22" fill={bodyFill} stroke={strokeColor} strokeWidth="4" transform="rotate(-15 140 95)" />
          {/* Cabeza del bebé más baja */}
          <circle cx="80" cy="120" r="18" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Mano sujetando la mandíbula sin tapar boca */}
          <circle cx="65" cy="125" r="7" fill={highlightFill} stroke={accentColor} strokeWidth="3" />
          
          {/* 5 Golpes interescapulares */}
          <g>
            <path d="M 145 45 L 145 75" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
            <polygon points="145,82 140,72 150,72" fill={accentColor} />
            <path d="M 160 50 L 160 80" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <path d="M 130 50 L 130 80" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          </g>

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            5 PALMADAS EN ESPALDA CON CABEZA INCLINADA HACIA ABAJO
          </text>
        </svg>
      );

    case 'cpr_chest':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Víctima acostada sobre el suelo */}
          <path d="M 40 150 L 280 150" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          {/* Pecho / Esternón */}
          <ellipse cx="160" cy="140" rx="60" ry="25" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Brazos rectos a 90 grados */}
          <line x1="150" y1="40" x2="155" y2="120" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />
          <line x1="170" y1="40" x2="165" y2="120" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />
          
          {/* Manos entrelazadas en el centro */}
          <rect x="145" y="115" width="30" height="18" rx="6" fill={highlightFill} stroke={accentColor} strokeWidth="3" />
          
          {/* Flecha de compresión vertical (5-6 cm) */}
          <path d="M 195 70 L 195 125" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <polygon points="195,130 190,120 200,120" fill={accentColor} />
          
          {/* Hombros alineados arriba */}
          <circle cx="160" cy="30" r="14" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            BRAZOS RECTOS A 90° • HUNDIR 5 CM • 100-120 COMPRESIONES/MIN
          </text>
        </svg>
      );

    case 'cpr_baby':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Bebé acostado boca arriba sobre superficie plana */}
          <path d="M 60 140 L 260 140" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
          <circle cx="95" cy="120" r="18" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          <rect x="115" y="108" width="80" height="30" rx="10" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Dos dedos comprimiendo en el centro del pecho */}
          <line x1="150" y1="50" x2="150" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <line x1="160" y1="50" x2="160" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <circle cx="155" cy="112" r="6" fill={highlightFill} stroke={accentColor} strokeWidth="2" />
          
          <path d="M 185 65 L 185 105" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <polygon points="185,110 181,102 189,102" fill={accentColor} />

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            2 DEDOS EN EL CENTRO DEL PECHO • HUNDIR 4 CM
          </text>
        </svg>
      );

    case 'burn_cooling':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Canilla / Grifo de agua */}
          <path d="M 130 30 L 170 30 L 170 60 L 155 60 L 155 45 L 130 45 Z" fill={strokeColor} />
          
          {/* Chorro de agua corriente */}
          <path d="M 162 60 L 162 120" stroke="#0284c7" strokeWidth="6" strokeDasharray="8 4" strokeLinecap="round" />
          
          {/* Mano / Brazo bajo el agua corriente */}
          <path d="M 80 140 Q 150 130 240 125" stroke={strokeColor} strokeWidth="12" strokeLinecap="round" />
          
          {/* Zona enrojecida de la quemadura */}
          <circle cx="165" cy="128" r="14" fill={highlightFill} stroke={accentColor} strokeWidth="3" />
          
          {/* Símbolo de PROHIBIDO hielo */}
          <g transform="translate(240, 35)">
            <circle cx="15" cy="15" r="16" stroke={accentColor} strokeWidth="3" fill="none" />
            <line x1="4" y1="4" x2="26" y2="26" stroke={accentColor} strokeWidth="3" />
            <text x="15" y="19" textAnchor="middle" fill={accentColor} fontSize="10" fontWeight="bold">HIELO</text>
          </g>

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            AGUA CORRIENTE 15-20 MIN • NUNCA HIELO NI POMADAS CASERAS
          </text>
        </svg>
      );

    case 'wound_pressure':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Extremidad sangrante */}
          <path d="M 60 135 L 260 135" stroke={strokeColor} strokeWidth="14" strokeLinecap="round" />
          
          {/* Paño / Gasa doblada sobre la herida */}
          <rect x="130" y="112" width="60" height="22" rx="4" fill="#ffffff" stroke={strokeColor} strokeWidth="3" />
          
          {/* Manos presionando fuertemente encima */}
          <rect x="140" y="85" width="40" height="28" rx="6" fill={highlightFill} stroke={accentColor} strokeWidth="4" />
          
          {/* Flechas de fuerza continua hacia abajo */}
          <path d="M 160 40 L 160 75" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          <polygon points="160,82 154,72 166,72" fill={accentColor} />

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            PRESIÓN DIRECTA SIN LEVANTAR DURANTE 10 MINUTOS
          </text>
        </svg>
      );

    case 'recovery_position':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Persona de costado (PLS) */}
          <path d="M 90 140 L 230 140" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Cabeza reclinada hacia atrás para abrir vía aérea */}
          <circle cx="85" cy="115" r="18" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Brazo doblado bajo la mejilla */}
          <path d="M 105 125 L 85 130" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          
          {/* Pierna superior flexionada en ángulo recto para estabilizar */}
          <path d="M 180 135 L 205 110 L 210 140" stroke={accentColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            POSICIÓN LATERAL DE SEGURIDAD (PLS) • VÍA AÉREA DESPEJADA
          </text>
        </svg>
      );

    case 'seizure_safe':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          
          {/* Almohadón bajo la cabeza */}
          <ellipse cx="90" cy="130" rx="28" ry="12" fill={highlightFill} stroke={accentColor} strokeWidth="3" />
          <circle cx="90" cy="115" r="16" fill={bodyFill} stroke={strokeColor} strokeWidth="4" />
          
          {/* Cuerpo en el suelo libre de obstáculos */}
          <path d="M 110 125 L 240 135" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          
          {/* Objeto alejado (mesa con flecha de apartar) */}
          <rect x="235" y="45" width="50" height="35" rx="3" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" fill="none" />
          <path d="M 230 65 L 210 65" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />

          {/* Símbolo de NO meter nada en la boca */}
          <g transform="translate(145, 35)">
            <circle cx="15" cy="15" r="16" stroke={accentColor} strokeWidth="3" fill="none" />
            <line x1="4" y1="4" x2="26" y2="26" stroke={accentColor} strokeWidth="3" />
            <text x="15" y="19" textAnchor="middle" fill={accentColor} fontSize="9" fontWeight="bold">OBJETO EN BOCA</text>
          </g>

          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            PROTEGER CABEZA CON ALGO BLANDO • NUNCA METER NADA EN LA BOCA
          </text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 320 200" className="w-full h-44 sm:h-52 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="200" rx="12" fill={isPanicMode ? '#1c1917' : '#fafaf9'} />
          <circle cx="160" cy="95" r="36" fill={highlightFill} stroke={accentColor} strokeWidth="4" />
          <path d="M 160 75 L 160 100" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          <circle cx="160" cy="115" r="3" fill={accentColor} />
          <text x="160" y="185" textAnchor="middle" fill={isPanicMode ? '#fef08a' : '#78716c'} fontSize="12" fontWeight="700">
            MANTÉN LA CALMA Y SIGUE CADA INSTRUCCIÓN
          </text>
        </svg>
      );
  }
};
