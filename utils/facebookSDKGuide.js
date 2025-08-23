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
 * CONFIGURACIÓN PARA APP PUBLICADA:
 * --------------------------------
 * ⚠️ IMPORTANTE: Si tu app ya está PUBLICADA, verifica estos pasos:
 * 
 * 1. DOMINIOS DE LA APP:
 *    - Ir a Configuración > Básica
 *    - En "Dominios de la app" agregar: alduinocalderon.github.io
 *    - En "URL del sitio" agregar: https://alduinocalderon.github.io/SocialMediaAutomation/
 * 
 * 2. CONFIGURACIÓN DE PRODUCTOS:
 *    - Verificar que "JavaScript SDK" esté habilitado
 *    - En "Login de Facebook" > Configuración:
 *      * URI de redirección OAuth válidos: https://alduinocalderon.github.io/SocialMediaAutomation/
 *      * Dominios permitidos: alduinocalderon.github.io
 * 
 * 3. REVISIÓN DE LA APP:
 *    - Si la app está "En revisión" o "Restringida", puede afectar el tracking
 *    - Verificar en Panel > Revisión de la app
 *    - Apps en modo "Desarrollo" solo funcionan para administradores
 * 
 * 4. PERMISOS Y FUNCIONES:
 *    - Verificar que los "Plugins sociales" estén aprobados
 *    - En "Productos" verificar que estén activos:
 *      * JavaScript SDK
 *      * Plugins sociales
 * 
 * 5. CONFIGURACIÓN DE ANÁLISIS:
 *    - Ir a "Análisis" > "Configuración"
 *    - Verificar que el tracking esté habilitado
 *    - Puede tardar 24-48 horas en mostrar datos
 * 
 * 6. MODO DE LA APP:
 *    - En Configuración > Básica, verificar "Modo de la app"
 *    - Si está en "Desarrollo": Solo administradores ven widgets
 *    - Si está "Público": Todos los usuarios ven widgets
 * 
 * SOLUCIÓN DE PROBLEMAS ESPECÍFICOS:
 * ----------------------------------
 * 
 * ❌ "Esta publicación de Facebook ya no está disponible":
 *    - La app puede estar en modo desarrollo
 *    - Verificar que la app esté en modo "Público"
 *    - Verificar que el dominio esté autorizado
 * 
 * ❌ "0% del límite usado" en Analytics:
 *    - Normal en apps nuevas o con poco tráfico
 *    - Verificar configuración de análisis
 *    - Puede tardar hasta 48 horas en actualizar
 * 
 * ❌ Widgets no cargan:
 *    - Verificar dominios autorizados
 *    - Verificar que la app esté pública
 *    - Verificar URLs de redirección
 * 
 * CHECKLIST PARA APP PUBLICADA:
 * -----------------------------
 * □ App en modo "Público" (no Desarrollo)
 * □ Dominio github.io agregado en "Dominios de la app"
 * □ URL completa en "URL del sitio"
 * □ JavaScript SDK habilitado
 * □ Plugins sociales aprobados
 * □ URIs de redirección configuradas
 * □ Análisis habilitado
 * □ Sin restricciones geográficas
 * 
 * TIEMPO DE PROPAGACIÓN:
 * ---------------------
 * - Cambios de configuración: 5-15 minutos
 * - Datos de análisis: 24-48 horas
 * - Aprobación de funciones: 1-7 días
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

// Función específica para diagnosticar problemas de app publicada
function diagnoseFacebookAppIssues() {
    console.log('🔍 [FB DIAGNOSIS] === DIAGNÓSTICO PARA APP PUBLICADA ===');
    
    const currentDomain = window.location.hostname;
    const isGitHubPages = currentDomain.includes('github.io');
    const isLocalhost = currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1');
    
    console.log('🌐 [FB DIAGNOSIS] Información del dominio:');
    console.log('  - Dominio actual:', currentDomain);
    console.log('  - Es GitHub Pages:', isGitHubPages ? '✅' : '❌');
    console.log('  - Es localhost:', isLocalhost ? '⚠️' : '✅');
    
    // Verificar configuración del SDK
    if (window.FB) {
        const appId = window.FB.getAppId();
        console.log('📱 [FB DIAGNOSIS] Configuración del SDK:');
        console.log('  - App ID configurado:', appId || 'NO CONFIGURADO');
        console.log('  - SDK inicializado:', !!window.FB);
        console.log('  - XFBML disponible:', !!(window.FB && window.FB.XFBML));
    } else {
        console.error('❌ [FB DIAGNOSIS] SDK de Facebook no cargado');
    }
    
    // Verificar widgets en la página
    const fbPosts = document.querySelectorAll('.fb-post');
    const renderedPosts = document.querySelectorAll('.fb-post[fb-xfbml-state="rendered"]');
    const iframes = document.querySelectorAll('iframe[src*="facebook"]');
    
    console.log('📊 [FB DIAGNOSIS] Estado de widgets:');
    console.log('  - Total de widgets .fb-post:', fbPosts.length);
    console.log('  - Widgets renderizados:', renderedPosts.length);
    console.log('  - iframes de Facebook:', iframes.length);
    
    // Recomendaciones específicas
    console.log('💡 [FB DIAGNOSIS] Recomendaciones:');
    
    if (isLocalhost) {
        console.warn('⚠️ [FB DIAGNOSIS] Estás en localhost - los widgets pueden no funcionar');
        console.log('   Solución: Usar ngrok o probar en GitHub Pages');
    }
    
    if (fbPosts.length > 0 && renderedPosts.length === 0) {
        console.warn('⚠️ [FB DIAGNOSIS] Widgets presentes pero no renderizados');
        console.log('   Posibles causas:');
        console.log('   1. App en modo Desarrollo (no Público)');
        console.log('   2. Dominio no autorizado en configuración');
        console.log('   3. Publicaciones privadas o eliminadas');
    }
    
    if (renderedPosts.length > 0) {
        console.log('✅ [FB DIAGNOSIS] Widgets funcionando correctamente');
        console.log('   Si no aparece uso en Analytics, esperar 24-48 horas');
    }
    
    // Información sobre configuración necesaria
    console.log('🔧 [FB DIAGNOSIS] Configuración requerida en Facebook Developers:');
    console.log('   1. Configuración > Básica > Dominios de la app:', currentDomain);
    console.log('   2. Configuración > Básica > URL del sitio:', window.location.origin + '/');
    console.log('   3. Modo de la app: Debe estar en "Público"');
    console.log('   4. JavaScript SDK: Debe estar habilitado');
    
    console.log('🔍 [FB DIAGNOSIS] === FIN DIAGNÓSTICO ===');
    
    return {
        domain: currentDomain,
        isProduction: isGitHubPages,
        sdkLoaded: !!window.FB,
        widgetsTotal: fbPosts.length,
        widgetsRendered: renderedPosts.length,
        iframesCount: iframes.length
    };
}

// Hacer disponible globalmente
window.diagnoseFacebookAppIssues = diagnoseFacebookAppIssues;

// Exportar funciones de utilidad si se usan modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkFacebookSDKStatus,
        debugFacebookIntegration
    };
}
