// Debug simple para verificar que los botones funcionan
console.log('🔍 Debug script cargado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM completamente cargado');
    
    // Verificar elementos
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const linkInput = document.getElementById('linkInput');
    
    console.log('🔍 Elementos encontrados:', {
        analyzeBtn: !!analyzeBtn,
        clearBtn: !!clearBtn,
        copyTextBtn: !!copyTextBtn,
        linkInput: !!linkInput
    });
    
    // Listeners simples
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            console.log('✅ Botón Analizar clickeado');
            alert('Botón Analizar funciona!');
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log('✅ Botón Limpiar clickeado');
            if (linkInput) {
                linkInput.value = '';
                alert('Texto limpiado');
            }
        });
    }
    
    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', function() {
            console.log('✅ Botón Copiar clickeado');
            if (linkInput && linkInput.value) {
                navigator.clipboard.writeText(linkInput.value).then(function() {
                    alert('Texto copiado');
                });
            } else {
                alert('No hay texto para copiar');
            }
        });
    }
    
    console.log('✅ Debug listeners configurados');
});
