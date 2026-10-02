# AuxilioApp - Primeros Auxilios Offline

Aplicación web móvil de primeros auxilios y salud comunitaria para el hogar, diseñada para operar al 100% sin conexión a internet ni dependencias en servidores.

## Arquitectura de Persistencia Local

La aplicación utiliza la API nativa `localStorage` del navegador para persistir:
1. **País y región de emergencia seleccionada** (ej. El Salvador 🇸🇻).
2. **Contactos y números locales personalizados** (ej. dispensario barrial, médico de cabecera, familiares).
3. **Notas y ubicación del botiquín del hogar**.

### Funciones de Respaldo y Portabilidad
- **Exportar Respaldo (.json):** Genera y descarga un archivo estructurado con todos los datos locales.
- **Importar Respaldo (.json):** Restaura la configuración en cualquier dispositivo compatible mediante selección de archivo.
- **Restablecer:** Devuelve la app al estado de fábrica sin dejar datos residuales.

---

## Limitaciones del Almacenamiento Local (Para el Usuario y Desarrolladores)

1. **Aislamiento por Origen y Navegador (Sandbox del Dispositivo):**
   - Los datos guardados en `localStorage` están estrictamente confinados al navegador y protocolo/dominio específico (`origin`). Si el usuario abre la aplicación en Chrome y luego la abre en Safari o Firefox en el mismo celular, los datos no se compartirán automáticamente entre navegadores.

2. **Borrado Manual de Caché y Datos de Navegación:**
   - Si el usuario ejecuta la acción del sistema *"Borrar datos de navegación"*, *"Limpiar almacenamiento del sitio"* o usa herramientas de limpieza profunda del sistema operativo (ej. limpiadores de archivos de Android o iOS), los registros de `localStorage` se eliminarán permanentemente.
   - **Mitigación recomendada:** Utilizar la opción *"Exportar Respaldo (.json)"* y almacenar dicho archivo en la carpeta de Documentos, Google Drive o compartirlo por mensajería al núcleo familiar.

3. **Modo Incógnito / Navegación Privada:**
   - En ventanas privadas o de incógnito, los navegadores aíslan el almacenamiento y lo destruyen automáticamente al cerrar la sesión privada. Se recomienda utilizar AuxilioApp en la ventana estándar o instalada como PWA en la pantalla de inicio del teléfono.

4. **Cambio o Pérdida del Dispositivo:**
   - Al no existir una base de datos central en la nube (respetando la privacidad y la disponibilidad offline), si el usuario cambia de celular o pierde su teléfono, la única manera de recuperar sus números personalizados y notas de botiquín es mediante el archivo de respaldo `.json` previamente exportado.

5. **Límite de Capacidad:**
   - `localStorage` ofrece aproximadamente 5MB de cuota por origen. AuxilioApp consume menos de 15KB para todas sus notas y contactos, por lo que nunca saturará el almacenamiento del usuario; sin embargo, no está diseñado para adjuntar archivos binarios pesados (como videos o fotos en alta resolución).

---

## Tabla de Control de Calidad y Pruebas de Estrés (QA)

| ID Caso de Prueba | Escenario / Intento de Rotura | Entrada / Acción del Tester | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **QA-STRESS-01** | Envío de formulario con campos vacíos o solo espacios | Abrir formulario de contacto, presionar barra espaciadora en "Nombre" y pulsar "Guardar". | El sistema bloquea el guardado, resalta el campo con borde de alerta y muestra: *"El nombre debe tener al menos 2 caracteres válidos."* | **PASA** |
| **QA-STRESS-02** | Entrada de texto alfabético o símbolos en campo de teléfono | Escribir `"ambulancia-roja#?"` en el campo telefónico y pulsar "Guardar". | Se rechaza la entrada, impidiendo números inválidos que rompan el marcado telefónico `tel:`, mostrando: *"Ingresa un número telefónico válido (solo dígitos o +)"*. | **PASA** |
| **QA-STRESS-03** | Inyección de texto masivo (+600 caracteres) | Pegar un texto de 800 caracteres en la nota del botiquín o en el nombre del contacto. | La interfaz trunca o restringe la entrada a los límites seguros (`maxLength`), aplica `break-words` y no desborda la pantalla ni rompe el layout en 320 px. | **PASA** |
| **QA-STRESS-04** | Multitouch / Doble clic rápido en "Llamar" o "Reproducir Audio" | Tocar repetidas veces (5 toques por segundo) sobre el botón de lectura por voz o el metrónomo de RCP. | El sistema cancela locuciones pendientes (`speechSynthesis.cancel()`), previene solapamiento de audio o bloqueos en la cola del sintetizador y no genera llamadas duplicadas. | **PASA** |
| **QA-STRESS-05** | Carga de archivo de respaldo corrupto o malicioso | Intentar importar un archivo `.json` con sintaxis rota, vacío o con scripts inyectados (`<script>alert(1)</script>`). | `importarJSON()` captura el error en el bloque `try/catch`, descarta los datos maliciosos, mantiene el estado local intacto y muestra un mensaje amigable: *"El archivo no corresponde a un respaldo válido"*. | **PASA** |

---

## Integración de IA: Triage y Clasificación de Riesgo (Google Gemini)

AuxilioApp incorpora un **Asistente de Triage Inteligente** impulsado por Google Gemini (`gemini-2.5-flash`), diseñado específicamente para clasificar la gravedad prehospitalaria según los síntomas descritos por el usuario en lenguaje natural.

### Resiliencia ante Pérdida de Conexión (Failover Offline)

En una situación de riesgo vital, el usuario no puede depender exclusivamente de la cobertura de datos móviles o de la latencia de un servidor en la nube. Por ello, la arquitectura de AuxilioApp implementa una estrategia de **failover dual**:

1. **Detección Automática de Conectividad (`navigator.onLine`):** Si el teléfono se encuentra en modo avión, sin saldo o en zona rural sin señal, el servicio no intenta peticiones de red inútiles y conmuta instantáneamente al motor de evaluación local.
2. **Timeout Preventivo Estricto (4.5 segundos):** Si la red es inestable o la API de Gemini sufre demoras, la promesa se cancela mediante `Promise.race()` para no congelar la pantalla.
3. **Motor Local por Reglas Clínicas de Decisión (Fallback Offline):** Analiza términos y semántica de emergencia (ej. *"ahogo"*, *"no respira"*, *"pecho"*, *"fuego"*, *"sangre"*, *"veneno"*) y genera exactamente la misma estructura JSON estandarizada con un mensaje honesto: `Evaluación local activa (Sin conexión a la IA)`.
4. **Vínculo Directo a Guías 100% Offline:** Tanto en modo IA como en modo local, el triage identifica la guía paso a paso adecuada y ofrece un botón de un solo toque para iniciar el protocolo sin requerir conexión.

