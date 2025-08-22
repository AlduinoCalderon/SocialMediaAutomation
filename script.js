// Configuración de la aplicación
const CONFIG = {
    platforms: {
        facebook: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877f2',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:share\/p\/|permalink\.php\?story_fbid=|.*?\/posts\/|.*?\/photos\/|.*?\/videos\/)([^\/\?]+)/i,
            embedUrl: 'https://www.facebook.com/plugins/post.php'
        },
        instagram: {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#e4405f',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([^\/\?]+)/i,
            embedUrl: 'https://www.instagram.com/p/'
        },
        twitter: {
            name: 'X/Twitter',
            icon: 'fab fa-x-twitter',
            color: '#000000',
            urlPattern: /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([^\/]+)\/status\/([^\/\?]+)/i,
            embedUrl: 'https://platform.twitter.com/widgets.js'
        }
    }
};

// Estado global de la aplicación
let appState = {
    links: [],
    currentFilter: 'all',
    isLoading: false
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
        const parsedLinks = parseLinks(input);
        appState.links = parsedLinks;
        
        updateStats();
        displayResults();
        setLoading(false);
        
        // Cargar widgets después de mostrar los resultados
        await loadWidgets();
        
    } catch (error) {
        console.error('Error al analizar enlaces:', error);
        showError('Error al procesar los enlaces. Por favor, verifica el formato.');
        setLoading(false);
    }
}

// Función para parsear el texto de entrada
function parseLinks(input) {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    const links = [];
    let currentGroup = '';
    let currentTitle = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detectar grupos (líneas que contienen "Titular", "Setrao", etc.)
        if (line.toLowerCase().includes('titular') || 
            line.toLowerCase().includes('setrao') ||
            line.toLowerCase().includes('facebook') ||
            line.toLowerCase().includes('instagram') ||
            line.toLowerCase().includes('x') ||
            line.toLowerCase().includes('twitter')) {
            
            // Si la línea anterior era una URL, usar esa línea como título
            if (i > 0 && isUrl(lines[i - 1])) {
                currentTitle = line;
            } else {
                currentGroup = line;
                currentTitle = line;
            }
            continue;
        }
        
        // Detectar URLs
        if (isUrl(line)) {
            const platform = detectPlatform(line);
            if (platform) {
                links.push({
                    url: line,
                    platform: platform,
                    group: currentGroup,
                    title: currentTitle,
                    id: generateId()
                });
            }
        }
    }
    
    return links;
}

// Función para detectar si una línea es una URL
function isUrl(text) {
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(text);
}

// Función para detectar la plataforma de un enlace
function detectPlatform(url) {
    for (const [key, platform] of Object.entries(CONFIG.platforms)) {
        if (platform.urlPattern.test(url)) {
            return key;
        }
    }
    return null;
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

// Función para cargar widget de Facebook
async function loadFacebookWidget(link, container) {
    const match = link.url.match(CONFIG.platforms.facebook.urlPattern);
    if (!match) {
        throw new Error('URL de Facebook no válida');
    }
    
    const postId = match[1];
    const embedUrl = `${CONFIG.platforms.facebook.embedUrl}?href=${encodeURIComponent(link.url)}&show_text=true&width=550`;
    
    container.innerHTML = `
        <iframe 
            src="${embedUrl}"
            width="550" 
            height="400" 
            style="border:none;overflow:hidden" 
            scrolling="no" 
            frameborder="0" 
            allowfullscreen="true" 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
    `;
}

// Función para cargar widget de Instagram
async function loadInstagramWidget(link, container) {
    const match = link.url.match(CONFIG.platforms.instagram.urlPattern);
    if (!match) {
        throw new Error('URL de Instagram no válida');
    }
    
    const postId = match[1];
    const embedUrl = `${CONFIG.platforms.instagram.embedUrl}${postId}/embed/`;
    
    container.innerHTML = `
        <iframe 
            src="${embedUrl}"
            width="400" 
            height="480" 
            frameborder="0" 
            scrolling="no" 
            allowtransparency="true">
        </iframe>
    `;
}

// Función para cargar widget de Twitter/X
async function loadTwitterWidget(link, container) {
    const match = link.url.match(CONFIG.platforms.twitter.urlPattern);
    if (!match) {
        throw new Error('URL de Twitter no válida');
    }
    
    const username = match[1];
    const tweetId = match[2];
    
    // Crear elemento para el tweet
    const tweetElement = document.createElement('div');
    tweetElement.className = 'twitter-tweet';
    tweetElement.innerHTML = `
        <blockquote class="twitter-tweet">
            <a href="${link.url}"></a>
        </blockquote>
    `;
    
    container.innerHTML = '';
    container.appendChild(tweetElement);
    
    // Cargar script de Twitter si no está cargado
    if (!window.twttr) {
        const script = document.createElement('script');
        script.src = CONFIG.platforms.twitter.embedUrl;
        script.async = true;
        document.head.appendChild(script);
        
        script.onload = () => {
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load(container);
            }
        };
    } else {
        window.twttr.widgets.load(container);
    }
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