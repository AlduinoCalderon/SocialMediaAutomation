// Función robusta para analizar texto y extraer enlaces de Facebook, Instagram, X/Twitter
function limpiarTexto(texto) {
  // Elimina negritas (*, **), espacios extra y caracteres invisibles
  return texto.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
              .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
              .replace(/\s+/g, ' ')
              .trim();
}

function limpiarEnlace(enlace) {
  // Elimina separadores o caracteres finales que no sean parte del enlace
  return enlace.replace(/[\?\.\)\]\}]+$/, '');
}

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
    resultados.push({
      red,
      titular,
      url,
    });
  }
  return resultados;
}

// Ejemplo de uso (puedes borrar este bloque cuando lo integres):
/*
const texto = `
Viernes 22 de agosto

Facebook Titular 
https://www.facebook.com/share/p/14JZkDVzxbL/

Instagram Titular 

X Titular 
https://www.instagram.com/p/DNqt0o-O2oy/

https://x.com/editsantibanez/status/1958959222055374946?s

Facebook Setrao

https://www.facebook.com/share/p/1Zsfw9TewS/

Instagram Setrao 

https://www.instagram.com/p/DNqwSmOy4qJ/

X Setrao

https://x.com/trabajo_goboax/status/1958958733725151477?
`;

console.log(extraerEnlaces(texto));
*/

module.exports = {
  extraerEnlaces,
  limpiarTexto,
  limpiarEnlace
};