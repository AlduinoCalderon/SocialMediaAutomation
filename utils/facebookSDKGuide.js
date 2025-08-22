/**
 * GUÍA DE INTEGRACIÓN FACEBOOK SDK
 * ================================
 * 
 * Esta guía documenta la implementación correcta del Facebook SDK
 * siguiendo las mejores prácticas oficiales de Meta/Facebook.
 * 
 * ARCHIVOS MODIFICADOS:
 * - index.html: Configuración principal del SDK
 * - script.js: Funciones de manejo de widgets
 * - styles.css: Estilos para widgets
 * 
 * CONFIGURACIÓN PRINCIPAL (index.html):
 * ------------------------------------
 * 1. Elemento fb-root: <div id="fb-root"></div>
 * 2. Script de inicialización con FB.init()
 * 3. Script de carga del SDK
 * 
 * PARÁMETROS IMPORTANTES:
 * ----------------------
 * - appId: 'TU_APP_ID' (reemplazar con tu App ID real)
 * - cookie: true (para autenticación)
 * - xfbml: true (para procesar plugins XFBML)
 * - version: 'v19.0' (versión estable más reciente)
 * 
 * WIDGET DE PUBLICACIÓN:
 * ---------------------
 * Estructura HTML según documentación oficial:
 * <div class="fb-post" 
 *      data-href="URL_DE_LA_PUBLICACION"
 *      data-width="500"
 *      data-show-text="true">
 *   <!-- Contenido de respaldo -->
 * </div>
 * 
 * FUNCIONES JAVASCRIPT PRINCIPALES:
 * ---------------------------------
 * - processPendingFacebookWidgets(): Procesa widgets pendientes
 * - loadFacebookWidget(): Carga widget dinámicamente
 * - FB.XFBML.parse(): Re-procesa elementos XFBML
 * 
 * BUENAS PRÁCTICAS:
 * ----------------
 * 1. ✅ Usar FB.XFBML.parse() después de insertar widgets dinámicamente
 * 2. ✅ Incluir contenido de respaldo en el HTML
 * 3. ✅ Verificar que el SDK esté listo antes de usar
 * 4. ✅ Solo verificar presencia del iframe, no su contenido (CORS)
 * 5. ✅ Manejar estados de carga pendientes
 * 
 * EVITAR:
 * -------
 * 1. ❌ Acceder al contenido interno del iframe (violación CORS)
 * 2. ❌ No incluir el App ID en producción
 * 3. ❌ Usar versiones obsoletas del SDK
 * 4. ❌ No manejar estados de error
 * 
 * LIMITACIONES EN LOCALHOST:
 * -------------------------
 * - Los widgets pueden no cargar en 127.0.0.1
 * - Para pruebas locales, usar herramientas como ngrok
 * - En producción funcionará correctamente
 * 
 * REFERENCIAS OFICIALES:
 * ---------------------
 * - JavaScript SDK: https://developers.facebook.com/docs/javascript
 * - Post Plugin: https://developers.facebook.com/docs/plugins/post/
 * - Configuración App: https://developers.facebook.com/apps/
 * 
 * PROBLEMAS COMUNES Y SOLUCIONES:
 * ------------------------------
 * 1. Widget no carga: Verificar App ID y dominio en configuración
 * 2. Error CORS: Normal, no intentar acceder al contenido del iframe
 * 3. SDK no se inicializa: Verificar orden de scripts y fbAsyncInit
 * 4. Widgets pendientes: Usar processPendingFacebookWidgets()
 * 
 * DEBUGGING:
 * ----------
 * - Abrir consola del navegador para ver logs detallados
 * - Verificar que el SDK se haya inicializado correctamente
 * - Comprobar que FB.XFBML.parse() se ejecute sin errores
 * 
 * EJEMPLO DE USO DINÁMICO:
 * -----------------------
 * // Insertar widget dinámicamente
 * container.innerHTML = '<div class="fb-post" data-href="URL"></div>';
 * 
 * // Procesar con el SDK
 * if (window.FB && window.FB.XFBML) {
 *     FB.XFBML.parse(container);
 * }
 * 
 * CONFIGURACIÓN DE DOMINIO:
 * ------------------------
 * En el panel de Facebook Developers:
 * 1. Ir a Configuración > Básica
 * 2. Agregar dominios permitidos
 * 3. Configurar URLs de redirección OAuth válidas
 * 
 * NOTAS DE SEGURIDAD:
 * ------------------
 * - Nunca exponer secretos de la app en el frontend
 * - App ID es público y seguro de usar en cliente
 * - Validar permisos en el backend para operaciones sensibles
 */

// Función de utilidad para verificar el estado del SDK
function checkFacebookSDKStatus() {
    return {
        sdkLoaded: typeof FB !== 'undefined',
        sdkReady: window.appState?.facebookSDKReady || false,
        xfbmlAvailable: !!(window.FB && window.FB.XFBML),
        fbRoot: !!document.getElementById('fb-root')
    };
}

// Función de utilidad para debugging
function debugFacebookIntegration() {
    const status = checkFacebookSDKStatus();
    console.log('🔍 [FB DEBUG] Estado de integración:', status);
    
    if (!status.fbRoot) {
        console.error('❌ [FB DEBUG] Falta elemento fb-root en el DOM');
    }
    
    if (!status.sdkLoaded) {
        console.error('❌ [FB DEBUG] SDK de Facebook no cargado');
    }
    
    if (!status.sdkReady) {
        console.warn('⚠️ [FB DEBUG] SDK no inicializado completamente');
    }
    
    return status;
}

// Exportar funciones de utilidad si se usan modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkFacebookSDKStatus,
        debugFacebookIntegration
    };
}
