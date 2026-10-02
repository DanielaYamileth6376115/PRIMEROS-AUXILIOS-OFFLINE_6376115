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
