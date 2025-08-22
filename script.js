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
            icon: 'fab fa-x-twitter',
            color: '#000000',
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
    twitterSDKReady: false
};

// Elementos del DOM
const elements = {
    linkInput: document.getElementById('linkInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    totalCount: document.getElementById('totalCount'),
    validCount: document.getElementById('validCount'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// Inicialización del SDK de Facebook según documentación oficial
window.fbAsyncInit = function() {
    FB.init({
        xfbml: true,
        version: 'v18.0'
    });
    
    appState.facebookSDKReady = true;
    console.log('Facebook SDK inicializado correctamente');
    
    // Procesar cualquier widget de Facebook pendiente
    const pendingFacebookWidgets = document.querySelectorAll('.fb-post[data-pending="true"]');
    pendingFacebookWidgets.forEach(widget => {
        widget.removeAttribute('data-pending');
        FB.XFBML.parse(widget.parentElement);
    });
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Event listeners
    elements.analyzeBtn.addEventListener('click', analyzeLinks);
    elements.clearBtn.addEventListener('click', clearAll);
    
    // Event listeners para filtros
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setActiveFilter(filter);
            filterResults(filter);
        });
    });

    // Cargar ejemplo si no hay contenido
    if (!elements.linkInput.value.trim()) {
        loadExample();
    }

    // Agregar botón de volver arriba
    addScrollToTopButton();
    
    // Agregar botón de copiar texto
    addCopyTextButton();
    
    // Scroll listener para mostrar/ocultar botón volver arriba
    window.addEventListener('scroll', handleScroll);
    
    // Verificar estado de SDKs después de 3 segundos
    setTimeout(checkSDKStatus, 3000);
}

// Función para verificar el estado de los SDKs
function checkSDKStatus() {
    console.log('Estado de SDKs:');
    console.log('- Facebook SDK:', appState.facebookSDKReady ? 'Listo' : 'No disponible');
    console.log('- Twitter SDK:', appState.twitterSDKReady ? 'Listo' : 'No disponible');
    
    if (!appState.facebookSDKReady) {
        console.warn('Facebook SDK no se ha inicializado. Usando fallbacks.');
    }
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

// Función para agregar botón de copiar texto
function addCopyTextButton() {
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copyTextBtn';
    copyBtn.className = 'copy-text-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Texto';
    
    copyBtn.addEventListener('click', copyInputText);
    
    // Insertar después del botón limpiar
    const buttonGroup = document.querySelector('.button-group');
    buttonGroup.appendChild(copyBtn);
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
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Cargando widget...</p>
            </div>
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

// Función para cargar widget de Facebook (mejorada con la documentación oficial)
async function loadFacebookWidget(link, container) {
    try {
        // Limpiar URL para mejor compatibilidad
        const cleanUrl = link.url.split('?')[0];
        
        // Convertir URLs de share a URLs de post normales si es necesario
        let facebookUrl = cleanUrl;
        if (cleanUrl.includes('/share/p/')) {
            const shareMatch = cleanUrl.match(/\/share\/p\/([^\/\?]+)/);
            if (shareMatch) {
                const postId = shareMatch[1];
                // Intentar múltiples formatos de URL
                const urlFormats = [
                    `https://www.facebook.com/permalink.php?story_fbid=${postId}`,
                    `https://www.facebook.com/posts/${postId}`,
                    cleanUrl // Como último recurso, usar la URL original
                ];
                facebookUrl = urlFormats[0]; // Usar el primer formato
            }
        }
        
        // Crear el widget de Facebook usando el SDK oficial
        container.innerHTML = `
            <div class="fb-post" 
                 data-href="${facebookUrl}" 
                 data-width="500" 
                 data-show-text="true"
                 ${!appState.facebookSDKReady ? 'data-pending="true"' : ''}>
            </div>
        `;
        
        // Si el SDK ya está listo, parsear inmediatamente
        if (appState.facebookSDKReady && window.FB && window.FB.XFBML) {
            window.FB.XFBML.parse(container);
        }
        
        // Verificar si el widget se cargó correctamente después de 6 segundos
        setTimeout(() => {
            const fbPost = container.querySelector('.fb-post');
            const iframe = container.querySelector('iframe');
            
            if (!iframe || iframe.style.display === 'none' || iframe.offsetHeight < 100) {
                console.log('Facebook widget no se cargó correctamente, mostrando fallback');
                showFacebookFallback(link, container);
            } else {
                console.log('Facebook widget cargado exitosamente');
            }
        }, 6000);
        
    } catch (error) {
        console.error('Facebook widget error:', error);
        showFacebookFallback(link, container);
    }
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
                    <span class="preview-status">Widget no disponible - Ver contenido original</span>
                </div>
            </div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <i class="fab fa-facebook"></i>
                    <p>Contenido de Facebook</p>
                    <span class="preview-note">Esta publicación está disponible en Facebook</span>
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

// Función para cargar widget de Instagram (mantener como está)
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

// Función para cargar widget de Twitter/X (mejorada con oEmbed API)
async function loadTwitterWidget(link, container) {
    try {
        // Extraer información del tweet
        const tweetMatch = link.url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status\/([^\/\?\s]+)/);
        
        if (tweetMatch) {
            const username = tweetMatch[1];
            const tweetId = tweetMatch[2];
            
            // Método 1: Intentar con oEmbed API
            try {
                const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(link.url)}&theme=light&dnt=true&hide_thread=true&hide_media=false&align=center&maxwidth=500`;
                
                const response = await fetch(oembedUrl);
                if (response.ok) {
                    const data = await response.json();
                    
                    container.innerHTML = `
                        <div class="twitter-oembed-container">
                            ${data.html}
                        </div>
                    `;
                    
                    // Cargar Twitter Widgets SDK si no está disponible
                    await ensureTwitterSDK();
                    
                    // Renderizar el tweet
                    if (window.twttr && window.twttr.widgets) {
                        await window.twttr.widgets.load(container);
                    }
                    
                    console.log('Twitter widget cargado con oEmbed API');
                    return;
                }
            } catch (oembedError) {
                console.log('oEmbed API falló, intentando método tradicional:', oembedError);
            }
            
            // Método 2: Fallback con método tradicional
            container.innerHTML = `
                <div class="twitter-widget-container">
                    <blockquote class="twitter-tweet" 
                                data-theme="light" 
                                data-dnt="true" 
                                data-lang="es"
                                data-conversation="none"
                                data-cards="visible"
                                data-align="center">
                        <a href="${link.url}"></a>
                    </blockquote>
                </div>
            `;
            
            // Cargar el widget con Twitter SDK
            await ensureTwitterSDK();
            
            if (window.twttr && window.twttr.widgets) {
                await window.twttr.widgets.load(container);
            }
            
            // Verificar si se cargó correctamente después de 5 segundos
            setTimeout(() => {
                const tweetRendered = container.querySelector('.twitter-tweet-rendered');
                const iframe = container.querySelector('iframe');
                
                if (!tweetRendered && !iframe) {
                    console.log('Twitter widget no se cargó, mostrando fallback');
                    showTwitterFallback(link, container, username);
                } else {
                    console.log('Twitter widget cargado exitosamente');
                }
            }, 5000);
        } else {
            throw new Error('No se pudo extraer información del tweet');
        }
        
    } catch (error) {
        console.error('Twitter widget error:', error);
        const username = link.url.match(/(?:x\.com|twitter\.com)\/([^\/]+)/)?.[1] || 'usuario';
        showTwitterFallback(link, container, username);
    }
}

// Función para asegurar que Twitter SDK esté cargado
async function ensureTwitterSDK() {
    if (appState.twitterSDKReady) {
        return;
    }
    
    return new Promise((resolve) => {
        if (window.twttr) {
            appState.twitterSDKReady = true;
            resolve();
            return;
        }
        
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
                    <i class="fab fa-x-twitter"></i>
                </div>
                <div class="preview-info">
                    <h4>Tweet de @${username}</h4>
                    <p>${link.title}</p>
                    <span class="preview-status">Widget no disponible - Ver contenido original</span>
                </div>
            </div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <i class="fab fa-x-twitter"></i>
                    <p>Contenido de X/Twitter</p>
                    <span class="preview-note">Este tweet está disponible en X/Twitter</span>
                </div>
            </div>
            <div class="preview-actions">
                <a href="${link.url}" target="_blank" class="btn btn-primary">
                    <i class="fab fa-x-twitter"></i> Ver en X/Twitter
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
function loadExample() {
    const example = `Viernes 22 de agosto

Facebook Titular 
https://www.facebook.com/share/p/14JZkDVzxbL/

Instagram Titular 
https://www.instagram.com/p/DNqt0o-O2oy/

X Titular 
https://x.com/editsantibanez/status/1958959222055374946?s

Facebook Setrao
https://www.facebook.com/share/p/1Zsfw9TewS/

Instagram Setrao 
https://www.instagram.com/p/DNqwSmOy4qJ/

X Setrao
https://x.com/trabajo_goboax/status/1958958733725151477?`;
    
    elements.linkInput.value = example;
}

// Función para manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Función para manejar promesas rechazadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
}); 