// Configuración de la aplicación
const CONFIG = {
    platforms: {
        facebook: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877f2',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s]+/i,
            embedUrl: 'https://www.facebook.com/plugins/post.php'
        },
        instagram: {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#e4405f',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s]+/i,
            embedUrl: 'https://www.instagram.com/p/'
        },
        twitter: {
            name: 'X/Twitter',
            icon: 'fab fa-twitter',
            color: '#1da1f2',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/[^\s]+/i,
            embedUrl: 'https://platform.twitter.com/widgets.js'
        }
    }
};

// Estado global de la aplicación
let appState = {
    links: [],
    currentFilter: 'all',
    isLoading: false,
    facebookSDKReady: false,
    twitterSDKReady: false,
    loadingWidgets: new Set() // Nuevo estado para controlar widgets en carga
};

// Elementos del DOM
const elements = {
    linkInput: document.getElementById('linkInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyTextBtn: document.getElementById('copyTextBtn'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    totalCount: document.getElementById('totalCount'),
    validCount: document.getElementById('validCount'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// Inicialización del SDK de Facebook según documentación oficial
// Esta función se ejecuta cuando el SDK de Facebook está listo
// NOTA: La configuración principal del SDK ahora está en el HTML para seguir las mejores prácticas

// Función para procesar widgets de Facebook pendientes
function processPendingFacebookWidgets() {
    console.log('🔄 [FB SDK] Iniciando procesamiento de widgets pendientes...');
    
    // CRÍTICO: Actualizar el estado local primero
    appState.facebookSDKReady = true;
    console.log('✅ [FB SDK] Estado local appState actualizado a: true');
    
    const pendingFacebookWidgets = document.querySelectorAll('.fb-post[data-pending="true"]');
    console.log(`🔍 [FB SDK] Widgets pendientes encontrados: ${pendingFacebookWidgets.length}`);
    
    if (pendingFacebookWidgets.length === 0) {
        console.log('ℹ️ [FB SDK] No hay widgets pendientes para procesar');
        return;
    }
    
    pendingFacebookWidgets.forEach((widget, index) => {
        console.log(`🔄 [FB SDK] Procesando widget pendiente ${index + 1}/${pendingFacebookWidgets.length}`);
        widget.removeAttribute('data-pending');
        
        // Usar FB.XFBML.parse() en el contenedor padre para reprocesar
        try {
            FB.XFBML.parse(widget.parentElement);
            console.log(`✅ [FB SDK] Widget ${index + 1} procesado exitosamente`);
        } catch (error) {
            console.error(`❌ [FB SDK] Error procesando widget ${index + 1}:`, error);
        }
    });
    
    // Actualizar el estado global si existe
    if (window.appState) {
        window.appState.facebookSDKReady = true;
        console.log('✅ [FB SDK] Estado global actualizado');
    }
}

// Hacer la función disponible globalmente para el SDK
window.processPendingFacebookWidgets = processPendingFacebookWidgets;

// Función para sincronizar el estado del SDK cuando esté listo
function syncFacebookSDKState() {
    if (window.FB && window.FB.XFBML) {
        appState.facebookSDKReady = true;
        console.log('🔄 [FB SYNC] Estado del SDK sincronizado: Facebook SDK listo');
        
        // Procesar cualquier widget pendiente
        processPendingFacebookWidgets();
    } else {
        console.log('⏳ [FB SYNC] SDK aún no está listo, reintentando en 1 segundo...');
        setTimeout(syncFacebookSDKState, 1000);
    }
}

// Llamar a la sincronización inmediatamente
setTimeout(syncFacebookSDKState, 100);

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 [APP] Inicializando aplicación...');
    
    // Event listeners
    elements.analyzeBtn.addEventListener('click', analyzeLinks);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.copyTextBtn.addEventListener('click', copyInputText);
    
    // Event listeners para filtros
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setActiveFilter(filter);
            filterResults(filter);
        });
    });

    // No cargar ejemplo automáticamente - el usuario ingresa sus propios enlaces

    // Agregar botón de volver arriba
    addScrollToTopButton();
    
    // Scroll listener para mostrar/ocultar botón volver arriba
    window.addEventListener('scroll', handleScroll);
    
    // Verificar estado de SDKs después de 1 segundo (más temprano)
    setTimeout(checkSDKStatus, 1000);
    
    // Segunda verificación después de 3 segundos
    setTimeout(checkSDKStatus, 3000);
    
    // Verificar y re-procesar widgets pendientes después de 5 segundos
    setTimeout(() => {
        if (window.FB && window.FB.XFBML) {
            console.log('🔄 [APP] Verificando widgets pendientes después de inicialización...');
            const pendingWidgets = document.querySelectorAll('.fb-post[data-pending="true"]');
            if (pendingWidgets.length > 0) {
                console.log(`🔄 [APP] Re-procesando ${pendingWidgets.length} widgets pendientes...`);
                if (window.processPendingFacebookWidgets) {
                    window.processPendingFacebookWidgets();
                }
            }
        }
    }, 5000);
    
    // Agregar debugging para Facebook SDK
    setTimeout(() => {
        if (typeof debugFacebookIntegration === 'function') {
            debugFacebookIntegration();
        }
        
        // Log del estado de widgets estáticos
        const staticWidgets = document.querySelectorAll('.fb-post');
        console.log(`📊 [APP] Widgets estáticos de Facebook encontrados: ${staticWidgets.length}`);
        
        // Trackear uso de la app
        if (typeof trackFacebookAppUsage === 'function') {
            trackFacebookAppUsage();
        }
        
        // Ejecutar diagnóstico específico para app publicada
        if (typeof diagnoseFacebookAppIssues === 'function') {
            diagnoseFacebookAppIssues();
        }
    }, 7000);
    
    console.log('✅ [APP] Aplicación inicializada correctamente');
}

// Función para verificar el estado de los SDKs con información extendida
function checkSDKStatus() {
    console.log('📊 [SDK STATUS] === DIAGNÓSTICO COMPLETO DE SDKs ===');
    
    // Estado de Facebook
    console.log('📊 [SDK STATUS] Facebook SDK:');
    console.log('  - appState.facebookSDKReady:', appState.facebookSDKReady ? '✅ Listo' : '❌ No disponible');
    console.log('  - window.FB:', window.FB ? '✅ Disponible' : '❌ No cargado');
    console.log('  - window.FB.XFBML:', (window.FB && window.FB.XFBML) ? '✅ Disponible' : '❌ No disponible');
    console.log('  - window.appState:', window.appState ? '✅ Existe' : '❌ No existe');
    console.log('  - window.appState.facebookSDKReady:', window.appState?.facebookSDKReady ? '✅ Listo' : '❌ No disponible');
    
    // Estado de Twitter
    console.log('📊 [SDK STATUS] Twitter SDK:');
    console.log('  - appState.twitterSDKReady:', appState.twitterSDKReady ? '✅ Listo' : '❌ No disponible');
    console.log('  - window.twttr:', window.twttr ? '✅ Disponible' : '❌ No cargado');
    console.log('  - window.twttr.widgets:', (window.twttr && window.twttr.widgets) ? '✅ Disponible' : '❌ No disponible');
    
    // Diagnóstico de widgets en DOM
    const fbWidgets = document.querySelectorAll('.fb-post');
    const fbIframes = document.querySelectorAll('iframe[src*="facebook"]');
    const pendingFbWidgets = document.querySelectorAll('.fb-post[data-pending="true"]');
    
    console.log('📊 [SDK STATUS] Estado del DOM:');
    console.log('  - Widgets de Facebook (.fb-post):', fbWidgets.length);
    console.log('  - iframes de Facebook:', fbIframes.length);
    console.log('  - Widgets pendientes:', pendingFbWidgets.length);
    
    // Verificar scripts cargados
    const fbScript = document.querySelector('script[src*="connect.facebook.net"]');
    const twitterScript = document.querySelector('script[src*="platform.twitter.com"]');
    
    console.log('📊 [SDK STATUS] Scripts cargados:');
    console.log('  - Script de Facebook:', fbScript ? '✅ Presente' : '❌ No encontrado');
    console.log('  - Script de Twitter:', twitterScript ? '✅ Presente' : '❌ No encontrado');
    
    // CORRECCIÓN AUTOMÁTICA mejorada
    let correctionMade = false;
    
    if (window.FB && window.FB.XFBML && !appState.facebookSDKReady) {
        console.log('🔧 [SDK STATUS] CORRIGIENDO inconsistencia de Facebook SDK...');
        appState.facebookSDKReady = true;
        if (window.appState) {
            window.appState.facebookSDKReady = true;
        }
        correctionMade = true;
        console.log('✅ [SDK STATUS] Estado de Facebook SDK CORREGIDO');
    }
    
    if (window.twttr && window.twttr.widgets && !appState.twitterSDKReady) {
        console.log('🔧 [SDK STATUS] CORRIGIENDO inconsistencia de Twitter SDK...');
        appState.twitterSDKReady = true;
        correctionMade = true;
        console.log('✅ [SDK STATUS] Estado de Twitter SDK CORREGIDO');
    }
    
    // Procesar widgets pendientes si se hizo corrección
    if (correctionMade && pendingFbWidgets.length > 0) {
        console.log(`🔄 [SDK STATUS] Procesando ${pendingFbWidgets.length} widgets pendientes tras corrección...`);
        processPendingFacebookWidgets();
    }
    
    // Resumen final
    const fbStatus = (appState.facebookSDKReady && window.FB && window.FB.XFBML) ? '🟢 FUNCIONAL' : '🔴 PROBLEMA';
    const twitterStatus = (appState.twitterSDKReady && window.twttr && window.twttr.widgets) ? '🟢 FUNCIONAL' : '🔴 PROBLEMA';
    
    console.log('📊 [SDK STATUS] === RESUMEN ===');
    console.log(`  - Facebook SDK: ${fbStatus}`);
    console.log(`  - Twitter SDK: ${twitterStatus}`);
    console.log('📊 [SDK STATUS] === FIN DIAGNÓSTICO ===');
}

// Función para agregar botón de volver arriba
function addScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToTopBtn';
    scrollBtn.className = 'scroll-to-top-btn';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.style.display = 'none';
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(scrollBtn);
}

// Función para copiar texto de entrada
async function copyInputText() {
    const text = elements.linkInput.value;
    if (!text.trim()) {
        showNotification('No hay texto para copiar', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Texto copiado al portapapeles', 'success');
    } catch (err) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Texto copiado al portapapeles', 'success');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para manejar scroll
function handleScroll() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (window.scrollY > 300) {
        scrollBtn.style.display = 'flex';
    } else {
        scrollBtn.style.display = 'none';
    }
}

// Función principal para analizar enlaces
async function analyzeLinks() {
    const input = elements.linkInput.value.trim();
    
    if (!input) {
        showError('Por favor, ingresa algunos enlaces para analizar.');
        return;
    }

    setLoading(true);
    
    try {
        const parsedLinks = extraerEnlaces(input);
        appState.links = parsedLinks;
        
        updateStats();
        displayResults();
        setLoading(false);
        
        // Scroll automático a resultados
        setTimeout(() => {
            elements.resultsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 500);
        
        // Cargar widgets después de mostrar los resultados
        await loadWidgets();
        
    } catch (error) {
        console.error('Error al analizar enlaces:', error);
        showError('Error al procesar los enlaces. Por favor, verifica el formato.');
        setLoading(false);
    }
}

// Función robusta para limpiar texto (del linkAnalizer.js)
function limpiarTexto(texto) {
    // Elimina negritas (*, **), espacios extra y caracteres invisibles
    return texto.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
                .replace(/\s+/g, ' ')
                .trim();
}

// Función para limpiar enlaces (del linkAnalizer.js)
function limpiarEnlace(enlace) {
    // Elimina separadores o caracteres finales que no sean parte del enlace
    return enlace.replace(/[\?\.\)\]\}]+$/, '');
}

// Función principal para extraer enlaces (del linkAnalizer.js)
function extraerEnlaces(texto) {
    // Expresión regular para Facebook, Instagram, X/Twitter, tolerante a errores
    const regex = /(?:Facebook|Instagram|X|Twitter)\s*([^\n]*?)\s*(https?:\/\/(?:www\.|m\.)?(?:facebook\.com\/[^\s]+|instagram\.com\/[^\s]+|x\.com\/[^\s]+|twitter\.com\/[^\s]+)[^\s]*)/gi;
    const resultados = [];
    let match;
    
    while ((match = regex.exec(texto)) !== null) {
        // Obtén red social desde la coincidencia
        const grupoRed = /Facebook|Instagram|X|Twitter/i.exec(match[0]);
        const red = grupoRed ? grupoRed[0].charAt(0).toUpperCase() + grupoRed[0].slice(1).toLowerCase() : "Red";
        
        // Titular: lo que está entre la red y el enlace
        let titular = limpiarTexto(match[1]);
        if (!titular) titular = red + " Publicación";
        
        const url = limpiarEnlace(match[2]);
        
        // Determinar plataforma
        let platform = 'unknown';
        if (url.includes('facebook.com')) platform = 'facebook';
        else if (url.includes('instagram.com')) platform = 'instagram';
        else if (url.includes('x.com') || url.includes('twitter.com')) platform = 'twitter';
        
        resultados.push({
            url: url,
            platform: platform,
            group: titular,
            title: titular,
            id: generateId()
        });
    }
    
    return resultados;
}

// Función para generar ID único
function generateId() {
    return 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Función para mostrar los resultados
function displayResults() {
    elements.resultsSection.style.display = 'block';
    elements.resultsContainer.innerHTML = '';
    
    if (appState.links.length === 0) {
        elements.resultsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No se encontraron enlaces válidos en el texto ingresado.</p>
                <p class="help-text">Asegúrate de que el formato sea: "Facebook Titular" seguido de la URL</p>
            </div>
        `;
        return;
    }
    
    const filteredLinks = filterLinksByPlatform(appState.links, appState.currentFilter);
    
    filteredLinks.forEach(link => {
        const linkCard = createLinkCard(link);
        elements.resultsContainer.appendChild(linkCard);
    });
}

// Función para crear una tarjeta de enlace
function createLinkCard(link) {
    const platform = CONFIG.platforms[link.platform];
    const card = document.createElement('div');
    card.className = 'link-card';
    card.dataset.platform = link.platform;
    card.dataset.id = link.id;
    
    card.innerHTML = `
        <div class="link-header">
            <div class="platform-icon ${link.platform}">
                <i class="${platform.icon}"></i>
            </div>
            <div class="link-info">
                <div class="link-title">${link.title}</div>
                <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
                <div class="link-group">${link.group}</div>
            </div>
        </div>
        <div class="widget-container" id="widget-${link.id}">
            
        </div>
    `;
    
    return card;
}

// Función para cargar widgets
async function loadWidgets() {
    for (const link of appState.links) {
        await loadWidget(link);
    }
}

// Función para cargar un widget específico
async function loadWidget(link) {
    const widgetContainer = document.getElementById(`widget-${link.id}`);
    if (!widgetContainer) return;
    
    try {
        switch (link.platform) {
            case 'facebook':
                await loadFacebookWidget(link, widgetContainer);
                break;
            case 'instagram':
                await loadInstagramWidget(link, widgetContainer);
                break;
            case 'twitter':
                await loadTwitterWidget(link, widgetContainer);
                break;
        }
    } catch (error) {
        console.error(`Error loading widget for ${link.platform}:`, error);
        widgetContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar el widget. <a href="${link.url}" target="_blank">Ver publicación original</a></p>
            </div>
        `;
    }
}

// Función para cargar widget de Facebook (implementación híbrida con Graph API y oEmbed)
async function loadFacebookWidget(link, container) {
    console.log('🔍 [FB HYBRID] Iniciando carga híbrida para:', link.url);
    console.log('🔍 [FB HYBRID] Estado inicial del SDK:', {
        appStateFB: appState.facebookSDKReady,
        windowFB: !!window.FB,
        windowFBXFBML: !!(window.FB && window.FB.XFBML),
        globalAppState: !!(window.appState && window.appState.facebookSDKReady)
    });
    
    try {
        // Validar URL de Facebook
        if (!link.url.includes('facebook.com')) {
            throw new Error('URL no es de Facebook');
        }
        
        const postId = extractFacebookPostId(link.url);
        console.log('🔍 [FB HYBRID] Post ID extraído:', postId);
        
        // MÉTODO 1: Intentar Graph API para tracking máximo
        console.log('� [FB HYBRID] Probando Graph API...');
        const graphSuccess = await tryGraphAPI(link.url, postId, container);
        if (graphSuccess) {
            console.log('✅ [FB HYBRID] Graph API exitoso - tracking completo activado');
            return;
        }
        
        // MÉTODO 2: Intentar Meta oEmbed
        console.log('� [FB HYBRID] Probando Meta oEmbed...');
        const oembedSuccess = await tryMetaOEmbed(link.url, container);
        if (oembedSuccess) {
            console.log('✅ [FB HYBRID] Meta oEmbed exitoso');
            return;
        }
        
        // MÉTODO 3: Fallback a XFBML (método original)
        console.log('� [FB HYBRID] Fallback a XFBML estándar...');
        await loadFacebookWidgetXFBML(link, container);
        
    } catch (error) {
        console.error('❌ [FB HYBRID] Error general:', error);
        showFacebookFallback(link, container);
    }
}

// Función para extraer el ID del post de Facebook
function extractFacebookPostId(url) {
    console.log('🔍 [FB ID] Extrayendo ID de URL:', url);
    
    // Patrones para diferentes formatos de URL de Facebook
    const patterns = [
        { name: 'page_id/posts/post_id', regex: /facebook\.com\/(\d+)\/posts\/(\d+)/ },
        { name: 'share/p/', regex: /facebook\.com\/share\/p\/([^\/\?]+)/ },
        { name: 'permalink.php', regex: /facebook\.com\/permalink\.php\?story_fbid=([^&]+)/ },
        { name: 'posts/', regex: /facebook\.com\/posts\/([^\/\?]+)/ },
        { name: 'page/posts/', regex: /facebook\.com\/[^\/]+\/posts\/([^\/\?]+)/ },
        { name: 'photo.php', regex: /facebook\.com\/photo\.php\?fbid=([^&]+)/ }
    ];
    
    for (const pattern of patterns) {
        console.log(`🔍 [FB ID] Probando patrón: ${pattern.name}`);
        const match = url.match(pattern.regex);
        if (match) {
            console.log(`✅ [FB ID] Match encontrado con patrón: ${pattern.name}`);
            // Para el formato page_id/posts/post_id, usar el post_id (segundo grupo)
            const extractedId = pattern.name === 'page_id/posts/post_id' ? match[2] : match[1];
            console.log(`✅ [FB ID] ID extraído: ${extractedId}`);
            return extractedId;
        }
    }
    
    console.log('❌ [FB ID] Ningún patrón coincidió');
    return null;
}

// Función para mostrar fallback de Facebook
function showFacebookFallback(link, container) {
    container.innerHTML = `
        <div class="facebook-preview">
            <div class="social-preview-header">
                <div class="platform-icon facebook">
                    <i class="fab fa-facebook"></i>
                </div>
                <div class="preview-info">
                    <h4>Publicación de Facebook</h4>
                    <p>${link.title}</p>
                    <span class="preview-status">Widget no disponible - Restricciones de CORS</span>
                </div>
            </div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <i class="fab fa-facebook"></i>
                    <p>Contenido de Facebook</p>
                    <span class="preview-note">Esta publicación está disponible en Facebook</span>
                    <div class="preview-help">
                        <small>💡 Las publicaciones públicas deberían mostrarse automáticamente</small>
                    </div>
                </div>
            </div>
            <div class="preview-actions">
                <a href="${link.url}" target="_blank" class="btn btn-primary">
                    <i class="fab fa-facebook"></i> Ver en Facebook
                </a>
            </div>
        </div>
    `;
}

// Función para mostrar que el post de Facebook no está disponible
function showFacebookPostUnavailable(link, container) {
    container.innerHTML = `
        <div class="facebook-preview">
            <div class="social-preview-header">
                <div class="platform-icon facebook">
                    <i class="fab fa-facebook"></i>
                </div>
                <div class="preview-info">
                    <h4>Publicación de Facebook</h4>
                    <p>${link.title}</p>
                    <span class="preview-status">Post no disponible - Restricciones de CORS</span>
                </div>
            </div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <i class="fab fa-facebook"></i>
                    <p>Contenido de Facebook</p>
                    <span class="preview-note">Esta publicación no está disponible en Facebook.</span>
                    <div class="preview-help">
                        <small>💡 Las publicaciones públicas deberían mostrarse automáticamente</small>
                    </div>
                </div>
            </div>
            <div class="preview-actions">
                <a href="${link.url}" target="_blank" class="btn btn-primary">
                    <i class="fab fa-facebook"></i> Ver en Facebook
                </a>
            </div>
        </div>
    `;
}

// Función para cargar widget de Instagram (volviendo al método original)
async function loadInstagramWidget(link, container) {
    // Extraer el ID del post de Instagram
    const match = link.url.match(/instagram\.com\/p\/([^\/\?]+)/);
    if (!match) {
        throw new Error('URL de Instagram no válida');
    }
    
    const postId = match[1];
    const embedUrl = `${CONFIG.platforms.instagram.embedUrl}${postId}/embed/`;
    
    container.innerHTML = `
        <iframe 
            src="${embedUrl}"
            width="100%" 
            height="480" 
            frameborder="0" 
            scrolling="no" 
            allowtransparency="true"
            style="border-radius:8px;">
        </iframe>
    `;
}

// Función para cargar widget de Twitter/X (solo método que funciona)
async function loadTwitterWidget(link, container) {
    // Evitar cargas duplicadas
    const containerId = container.id || `widget-${link.id}`;
    if (appState.loadingWidgets.has(containerId)) {
        console.log('Twitter widget ya está siendo cargado para:', containerId);
        return;
    }
    
    appState.loadingWidgets.add(containerId);
    
    try {
        // Extraer información del tweet
        const tweetMatch = link.url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status\/([^\/\?\s]+)/);
        
        if (!tweetMatch) {
            throw new Error('No se pudo extraer información del tweet');
        }
        
        const username = tweetMatch[1];
        const tweetId = tweetMatch[2];
        
        // Asegurar que Twitter SDK esté cargado
        await ensureTwitterSDK();
        
        // Usar createTweet (único método que funciona)
        if (window.twttr && window.twttr.widgets) {
            const tweetElement = await window.twttr.widgets.createTweet(tweetId, container, {
                theme: 'light',
                dnt: true,
                conversation: 'none',
                cards: 'visible',
                align: 'center',
                width: 500
            });
            
            if (tweetElement) {
                console.log('✅ Twitter widget creado exitosamente con createTweet');
                appState.loadingWidgets.delete(containerId);
                return;
            }
        }
        
        // Si createTweet falla, mostrar fallback
        console.log('Twitter createTweet falló, mostrando fallback');
        handleCORSError('twitter', link, container);
        appState.loadingWidgets.delete(containerId);
        
    } catch (error) {
        console.error('Twitter widget error:', error);
        handleCORSError('twitter', link, container);
        appState.loadingWidgets.delete(containerId);
    }
}

// Función mejorada para asegurar que Twitter SDK esté cargado
async function ensureTwitterSDK() {
    if (appState.twitterSDKReady && window.twttr && window.twttr.widgets) {
        return;
    }
    
    return new Promise((resolve) => {
        // Si ya existe el script, solo esperar a que esté listo
        if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
            const checkTwttr = setInterval(() => {
                if (window.twttr && window.twttr.widgets) {
                    clearInterval(checkTwttr);
                    appState.twitterSDKReady = true;
                    console.log('Twitter SDK ya estaba cargado');
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkTwttr);
                console.log('Twitter SDK timeout, continuando...');
                resolve();
            }, 10000);
            return;
        }
        
        // Cargar el script si no existe
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        
        script.onload = () => {
            const checkTwttr = setInterval(() => {
                if (window.twttr && window.twttr.widgets) {
                    clearInterval(checkTwttr);
                    appState.twitterSDKReady = true;
                    console.log('Twitter SDK cargado exitosamente');
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkTwttr);
                console.log('Twitter SDK timeout, continuando...');
                resolve();
            }, 10000);
        };
        
        script.onerror = () => {
            console.log('Error cargando Twitter SDK');
            resolve();
        };
        
        document.head.appendChild(script);
    });
}

// Función para mostrar fallback de Twitter
function showTwitterFallback(link, container, username) {
    container.innerHTML = `
        <div class="twitter-preview">
            <div class="social-preview-header">
                <div class="platform-icon twitter">
                    <i class="fab fa-twitter"></i>
                </div>
                <div class="preview-info">
                    <h4>Tweet de @${username}</h4>
                    <p>${link.title}</p>
                    <span class="preview-status">Widget no disponible - Restricciones de CORS</span>
                </div>
            </div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <i class="fab fa-twitter"></i>
                    <p>Contenido de X/Twitter</p>
                    <span class="preview-note">Este tweet está disponible en X/Twitter</span>
                    <div class="preview-help">
                        <small>💡 Los tweets públicos deberían mostrarse automáticamente</small>
                    </div>
                </div>
            </div>
            <div class="preview-actions">
                <a href="${link.url}" target="_blank" class="btn btn-primary">
                    <i class="fab fa-twitter"></i> Ver en X/Twitter
                </a>
            </div>
        </div>
    `;
}

// Función para filtrar enlaces por plataforma
function filterLinksByPlatform(links, filter) {
    if (filter === 'all') {
        return links;
    }
    return links.filter(link => link.platform === filter);
}

// Función para establecer filtro activo
function setActiveFilter(filter) {
    appState.currentFilter = filter;
    
    elements.filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
}

// Función para filtrar resultados
function filterResults(filter) {
    const filteredLinks = filterLinksByPlatform(appState.links, filter);
    
    // Ocultar todas las tarjetas
    const allCards = elements.resultsContainer.querySelectorAll('.link-card');
    allCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Mostrar solo las tarjetas del filtro seleccionado
    filteredLinks.forEach(link => {
        const card = elements.resultsContainer.querySelector(`[data-id="${link.id}"]`);
        if (card) {
            card.style.display = 'block';
        }
    });
}

// Función para actualizar estadísticas
function updateStats() {
    elements.totalCount.textContent = appState.links.length;
    elements.validCount.textContent = appState.links.length;
}

// Función para limpiar todo
function clearAll() {
    elements.linkInput.value = '';
    elements.resultsSection.style.display = 'none';
    appState.links = [];
    appState.currentFilter = 'all';
    
    // Resetear filtros
    elements.filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    elements.filterBtns[0].classList.add('active');
}

// Función para copiar el texto del input al portapapeles
async function copyInputText() {
    const text = elements.linkInput.value;
    
    if (!text.trim()) {
        showNotification('No hay texto para copiar', 'warning');
        return;
    }
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showNotification('Texto copiado al portapapeles', 'success');
        } else {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Texto copiado al portapapeles', 'success');
            } catch (err) {
                showNotification('Error al copiar texto', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Error al copiar texto:', err);
        showNotification('Error al copiar texto', 'error');
    }
}

// Función para establecer estado de carga
function setLoading(loading) {
    appState.isLoading = loading;
    
    if (loading) {
        elements.analyzeBtn.disabled = true;
        elements.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
    } else {
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analizar Enlaces';
    }
}

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
    `;
    
    elements.resultsSection.style.display = 'block';
    elements.resultsContainer.innerHTML = '';
    elements.resultsContainer.appendChild(errorDiv);
}

// Función para cargar ejemplo
// Función para manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Función para manejar promesas rechazadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
}); 

// Función para manejar errores de CORS y proporcionar información útil
function handleCORSError(platform, link, container) {
    console.warn(`Error de CORS detectado para ${platform}:`, link.url);
    
    const errorMessage = platform === 'facebook' 
        ? 'Widget de Facebook no disponible debido a restricciones de CORS. Las publicaciones públicas deberían mostrarse correctamente.'
        : 'Widget de Twitter no disponible debido a restricciones de CORS. Las publicaciones públicas deberían mostrarse correctamente.';
    
    // Mostrar notificación informativa
    showNotification(errorMessage, 'warning');
    
    // Mostrar fallback con información adicional
    if (platform === 'facebook') {
        showFacebookFallback(link, container);
    } else if (platform === 'twitter') {
        const username = link.url.match(/(?:x\.com|twitter\.com)\/([^\/]+)/)?.[1] || 'usuario';
        showTwitterFallback(link, container, username);
    }
}

// Función para mostrar indicador de carga específico para Facebook
function showFacebookLoading(container) {
    const loadingHTML = `
        <div class="facebook-loading" style="
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            text-align: center;
            color: #6c757d;
        ">
            <div>
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid #1877f2;
                    border-top: 3px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 12px;
                "></div>
                <p><i class="fab fa-facebook" style="color: #1877f2; margin-right: 8px;"></i>Cargando widget de Facebook...</p>
                <small style="color: #999; margin-top: 8px; display: block;">
                    Si el widget no carga, puede deberse a restricciones en localhost
                </small>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    container.innerHTML = loadingHTML;
}

// Nueva función para debugging detallado de Facebook
function debugFacebookIntegration() {
    console.log('🔧 [FB DEBUG] === DEBUGGING DETALLADO DE FACEBOOK ===');
    
    // Estado de elementos clave
    const fbRoot = document.getElementById('fb-root');
    const fbPosts = document.querySelectorAll('.fb-post');
    const fbIframes = document.querySelectorAll('iframe[src*="facebook"]');
    
    console.log('🔧 [FB DEBUG] Elementos del DOM:');
    console.log('  - #fb-root existe:', !!fbRoot);
    console.log('  - Cantidad de .fb-post:', fbPosts.length);
    console.log('  - Cantidad de iframes de FB:', fbIframes.length);
    
    // Analizar cada widget
    fbPosts.forEach((post, index) => {
        console.log(`🔧 [FB DEBUG] Widget ${index + 1}:`);
        console.log('    - data-href:', post.getAttribute('data-href'));
        console.log('    - data-pending:', post.getAttribute('data-pending'));
        console.log('    - children count:', post.children.length);
        console.log('    - innerHTML length:', post.innerHTML.length);
        
        const iframe = post.querySelector('iframe');
        if (iframe) {
            console.log('    - iframe src:', iframe.src ? 'presente' : 'ausente');
            console.log('    - iframe dimensions:', `${iframe.offsetWidth}x${iframe.offsetHeight}`);
        } else {
            console.log('    - iframe: NO PRESENTE');
        }
    });
    
    // Estado global de Facebook
    console.log('🔧 [FB DEBUG] Estado global:');
    console.log('  - window.FB:', !!window.FB);
    console.log('  - window.FB.XFBML:', !!(window.FB && window.FB.XFBML));
    console.log('  - appState.facebookSDKReady:', appState.facebookSDKReady);
    
    console.log('🔧 [FB DEBUG] === FIN DEBUGGING ===');
}

// Hacer la función de debugging disponible globalmente
window.debugFacebookIntegration = debugFacebookIntegration;

// Función para forzar el registro de uso de la app de Facebook
function trackFacebookAppUsage() {
    if (window.FB && window.FB.getAppId()) {
        console.log('📈 [FB TRACKING] Registrando uso de app:', window.FB.getAppId());
        
        // Forzar una llamada API simple para registrar uso
        try {
            window.FB.api('/me', function(response) {
                if (response && !response.error) {
                    console.log('✅ [FB TRACKING] Uso de app registrado exitosamente');
                } else {
                    console.log('ℹ️ [FB TRACKING] Usuario no logueado, pero SDK en uso');
                }
            });
        } catch (error) {
            console.log('ℹ️ [FB TRACKING] SDK en uso, usuario no autenticado');
        }
        
        // Verificar plugins activos
        const fbPosts = document.querySelectorAll('.fb-post[fb-xfbml-state="rendered"]');
        console.log(`📊 [FB TRACKING] Plugins activos: ${fbPosts.length}`);
        
        if (fbPosts.length > 0) {
            console.log('✅ [FB TRACKING] Plugins de Facebook renderizados correctamente');
            return true;
        }
    }
    return false;
}

// CONFIGURACIÓN PARA GRAPH API Y META OEMBED
const META_API_CONFIG = {
    graphUrl: 'https://graph.facebook.com/v19.0',
    appId: '1131335178847592', // Tu App ID
    // Para posts públicos, se puede intentar sin token
    // En producción, usar server-side con app token
};

// Función para probar Graph API
async function tryGraphAPI(postUrl, postId, container) {
    if (!postId) return false;
    
    try {
        console.log('📊 [GRAPH API] Intentando obtener datos del post:', postId);
        
        // Intentar obtener datos básicos del post público
        const endpoint = `${META_API_CONFIG.graphUrl}/${postId}`;
        const params = new URLSearchParams({
            fields: 'id,message,created_time,permalink_url,full_picture',
            // Para posts públicos, a veces funciona sin token
        });
        
        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();
        
        if (data.error) {
            console.log('⚠️ [GRAPH API] Error (esperado sin token):', data.error.message);
            return false;
        }
        
        console.log('✅ [GRAPH API] Datos obtenidos exitosamente:', data);
        
        // Crear widget personalizado con datos de Graph API
        createCustomFacebookWidget(data, postUrl, container);
        
        // Forzar tracking llamando a la API
        trackGraphAPIUsage(postId);
        
        return true;
        
    } catch (error) {
        console.log('ℹ️ [GRAPH API] No disponible:', error.message);
        return false;
    }
}

// Función para probar Meta oEmbed
async function tryMetaOEmbed(postUrl, container) {
    try {
        console.log('🔗 [OEMBED] Intentando obtener embed para:', postUrl);
        
        const endpoint = `${META_API_CONFIG.graphUrl}/oembed_post`;
        const params = new URLSearchParams({
            url: postUrl,
            maxwidth: 500,
            omitscript: false
        });
        
        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();
        
        if (data.error) {
            console.log('⚠️ [OEMBED] Error:', data.error.message);
            return false;
        }
        
        if (data.html) {
            console.log('✅ [OEMBED] HTML obtenido exitosamente');
            container.innerHTML = data.html;
            
            // Ejecutar scripts si los hay
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.head.appendChild(newScript);
            });
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.log('ℹ️ [OEMBED] No disponible:', error.message);
        return false;
    }
}

// Función para crear widget personalizado con datos de Graph API
function createCustomFacebookWidget(postData, originalUrl, container) {
    const { id, message, created_time, permalink_url, full_picture } = postData;
    const date = new Date(created_time).toLocaleDateString();
    
    const customWidget = `
        <div class="custom-fb-post" style="
            border: 1px solid #dddfe2;
            border-radius: 8px;
            background: white;
            padding: 16px;
            max-width: 500px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <div class="fb-header" style="display: flex; align-items: center; margin-bottom: 12px;">
                <div class="platform-icon facebook" style="
                    background: #1877f2;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                ">
                    <i class="fab fa-facebook" style="color: white; font-size: 20px;"></i>
                </div>
                <div>
                    <div style="font-weight: 600; color: #1c1e21;">Facebook Post</div>
                    <div style="color: #65676b; font-size: 13px;">${date}</div>
                </div>
            </div>
            
            ${message ? `<div class="fb-message" style="
                color: #1c1e21;
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 12px;
                white-space: pre-wrap;
            ">${message}</div>` : ''}
            
            ${full_picture ? `<div class="fb-image" style="margin-bottom: 12px;">
                <img src="${full_picture}" style="
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    display: block;
                " alt="Post image" />
            </div>` : ''}
            
            <div class="fb-actions" style="
                border-top: 1px solid #e4e6ea;
                padding-top: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="color: #65676b; font-size: 13px;">
                    📊 Cargado via Graph API - Tracking activo
                </div>
                <a href="${permalink_url || originalUrl}" target="_blank" style="
                    background: #1877f2;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                ">
                    Ver en Facebook
                </a>
            </div>
        </div>
    `;
    
    container.innerHTML = customWidget;
    console.log('✅ [GRAPH API] Widget personalizado creado con datos estructurados');
}

// Función para trackear uso de Graph API
function trackGraphAPIUsage(postId) {
    console.log('📈 [GRAPH API TRACKING] Registrando uso de Graph API para post:', postId);
    
    // Múltiples llamadas para asegurar tracking
    const trackingCalls = [
        // Llamada básica de info
        () => {
            if (window.FB) {
                window.FB.api(`/${postId}`, { fields: 'id' }, (response) => {
                    console.log('📊 [TRACKING] FB.api call successful:', !!response.id);
                });
            }
        },
        
        // Llamada directa a Graph API
        () => {
            fetch(`${META_API_CONFIG.graphUrl}/${postId}?fields=id`)
                .then(r => r.json())
                .then(data => {
                    console.log('📊 [TRACKING] Direct Graph API call:', !!data.id);
                })
                .catch(() => console.log('📊 [TRACKING] Direct call completed'));
        }
    ];
    
    // Ejecutar llamadas de tracking
    trackingCalls.forEach((call, index) => {
        setTimeout(() => {
            try {
                call();
            } catch (e) {
                console.log(`📊 [TRACKING] Call ${index + 1} completed`);
            }
        }, index * 1000);
    });
}

// Función XFBML original como fallback
async function loadFacebookWidgetXFBML(link, container) {
    console.log('🔄 [XFBML FALLBACK] Usando método XFBML estándar');
    
    const fbHTML = `
        <div class="fb-post" 
             data-href="${link.url}" 
             data-width="500" 
             data-show-text="true"
             data-lazy="false"
             data-colorscheme="light">
        </div>
    `;
    
    console.log('🔍 [XFBML FALLBACK] Insertando HTML oficial...');
    container.innerHTML = fbHTML;
    
    // Verificar y sincronizar estado del SDK
    if (window.FB && window.FB.XFBML) {
        if (!appState.facebookSDKReady) {
            appState.facebookSDKReady = true;
            if (window.appState) {
                window.appState.facebookSDKReady = true;
            }
        }
        
        try {
            window.FB.XFBML.parse(container);
            console.log('✅ [XFBML FALLBACK] Parse ejecutado exitosamente');
        } catch (parseError) {
            console.error('❌ [XFBML FALLBACK] Error en parse:', parseError);
            showFacebookFallback(link, container);
        }
    } else {
        const fbPost = container.querySelector('.fb-post');
        if (fbPost) {
            fbPost.setAttribute('data-pending', 'true');
        }
    }
}