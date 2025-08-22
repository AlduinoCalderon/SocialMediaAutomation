# Analizador de Enlaces SETRAO

Una herramienta web estática para analizar y verificar publicaciones en redes sociales (Facebook, Instagram y X/Twitter) utilizada por el área de Comunicación Social de SETRAO.

## 🚀 Características

- **Análisis automático** de enlaces de redes sociales
- **Widgets embebidos** para cada plataforma
- **Filtros por plataforma** (Facebook, Instagram, X/Twitter)
- **Interfaz moderna y responsiva**
- **Organización por grupos** (Titular, Setrao, etc.)
- **Diseño optimizado** para verificación de contenido

## 📋 Funcionalidades

### Análisis de Enlaces
- Detecta automáticamente enlaces de Facebook, Instagram y X/Twitter
- Extrae información de cada publicación
- Organiza por grupos y títulos

### Widgets Embebidos
- **Facebook**: Muestra posts completos con texto e imágenes
- **Instagram**: Visualiza posts de Instagram con contenido multimedia
- **X/Twitter**: Presenta tweets con formato nativo

### Filtros y Organización
- Filtro por plataforma social
- Agrupación por cuentas (Titular, Setrao)
- Estadísticas de enlaces procesados

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con gradientes y efectos visuales
- **JavaScript Vanilla**: Lógica de procesamiento sin dependencias
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografía Inter

## 📦 Instalación y Despliegue

### Despliegue en GitHub Pages

1. **Crear un repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/nombre-del-repo.git
   git push -u origin main
   ```

2. **Configurar GitHub Pages**
   - Ve a Settings > Pages
   - En "Source", selecciona "Deploy from a branch"
   - Selecciona la rama "main"
   - Guarda la configuración

3. **Acceder a la aplicación**
   - La URL será: `https://tu-usuario.github.io/nombre-del-repo`

### Despliegue Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/nombre-del-repo.git
   cd nombre-del-repo
   ```

2. **Abrir en el navegador**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:
   ```bash
   python -m http.server 8000
   # Luego ve a http://localhost:8000
   ```

## 📖 Uso

### Formato de Entrada

La aplicación acepta texto con el siguiente formato:

```
Viernes 22 de agosto

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
https://x.com/trabajo_goboax/status/1958958733725151477?
```

### Pasos de Uso

1. **Pegar enlaces**: Copia y pega la lista de enlaces en el área de texto
2. **Analizar**: Haz clic en "Analizar Enlaces"
3. **Revisar**: Los widgets se cargarán automáticamente
4. **Filtrar**: Usa los botones de filtro para ver por plataforma
5. **Verificar**: Compara el contenido de cada publicación

## 🔧 Configuración

### Plataformas Soportadas

- **Facebook**: `facebook.com/share/p/`, `facebook.com/posts/`, etc.
- **Instagram**: `instagram.com/p/`
- **X/Twitter**: `x.com/username/status/`, `twitter.com/username/status/`

### Personalización

Puedes modificar las configuraciones en `script.js`:

```javascript
const CONFIG = {
    platforms: {
        facebook: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            urlPattern: /tu-patron-aqui/,
            embedUrl: 'tu-url-de-embed'
        }
        // ... más plataformas
    }
};
```

## 🎨 Personalización del Diseño

### Colores Principales
- **Primario**: `#667eea` (Azul)
- **Secundario**: `#764ba2` (Púrpura)
- **Facebook**: `#1877f2`
- **Instagram**: Gradiente multicolor
- **X/Twitter**: `#000000`

### Tipografía
- **Principal**: Inter (Google Fonts)
- **Tamaños**: Responsive con breakpoints móviles

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: 1200px+ (diseño completo)
- **Tablet**: 768px-1199px (ajustes menores)
- **Mobile**: <768px (diseño adaptado)

## 🔒 Privacidad y Seguridad

- **Sin almacenamiento**: No se guardan datos en el navegador
- **Sin tracking**: No se recopilan datos de usuario
- **Widgets seguros**: Los widgets se cargan desde las plataformas oficiales

## 🐛 Solución de Problemas

### Widgets no se cargan
- Verifica que los enlaces sean válidos
- Asegúrate de tener conexión a internet
- Algunos posts pueden tener restricciones de privacidad

### Errores de formato
- Revisa que los enlaces tengan el formato correcto
- Asegúrate de que las URLs sean completas (con https://)

### Problemas de rendimiento
- La aplicación procesa los widgets de forma asíncrona
- Los widgets pesados pueden tardar en cargar

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollado para**: SETRAO - Comunicación Social
- **Propósito**: Verificación de publicaciones en redes sociales
- **Mantenimiento**: Área de Comunicación Social

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
- Crear un issue en GitHub
- Contactar al área de Comunicación Social de SETRAO

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024 