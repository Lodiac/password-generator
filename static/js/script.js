// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const passwordResult = document.getElementById('password-result');
    const copyPasswordBtn = document.getElementById('copy-password');
    const refreshPasswordBtn = document.getElementById('refresh-password');
    const generatePasswordBtn = document.getElementById('generate-password');
    const passwordLengthInput = document.getElementById('password-length');
    const decreaseLengthBtn = document.getElementById('decrease-length');
    const increaseLengthBtn = document.getElementById('increase-length');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const specialCheckbox = document.getElementById('special');
    const strengthBars = document.querySelectorAll('.strength-meter .bar');
    const strengthText = document.querySelector('.strength-text');
    const passwordAnalysis = document.querySelector('.password-analysis');
    const crackTimeElement = document.getElementById('crack-time');
    const securityScoreElement = document.getElementById('security-score');
    const securityWarnings = document.getElementById('security-warnings');

    // Configuración inicial
    let passwordLength = 12;
    passwordLengthInput.value = passwordLength;

    // Generar una contraseña al cargar la página
    generatePassword();

    // Evento para generar una nueva contraseña
    generatePasswordBtn.addEventListener('click', generatePassword);
    refreshPasswordBtn.addEventListener('click', generatePassword);

    // Evento para copiar la contraseña al portapapeles
    copyPasswordBtn.addEventListener('click', copyToClipboard);

    // Eventos para aumentar/disminuir la longitud de la contraseña
    decreaseLengthBtn.addEventListener('click', function() {
        if (passwordLength > 4) {
            passwordLength--;
            passwordLengthInput.value = passwordLength;
            generatePassword();
        }
    });

    increaseLengthBtn.addEventListener('click', function() {
        if (passwordLength < 50) {
            passwordLength++;
            passwordLengthInput.value = passwordLength;
            generatePassword();
        }
    });

    // Evento para cambiar la longitud manualmente
    passwordLengthInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value >= 4 && value <= 50) {
            passwordLength = value;
        } else if (value < 4) {
            passwordLength = 4;
            this.value = 4;
        } else if (value > 50) {
            passwordLength = 50;
            this.value = 50;
        }
        generatePassword();
    });

    // Eventos para los checkboxes
    const checkboxes = [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, specialCheckbox];
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Asegurarse de que al menos un tipo de carácter esté seleccionado
            if (!uppercaseCheckbox.checked && 
                !lowercaseCheckbox.checked && 
                !numbersCheckbox.checked && 
                !specialCheckbox.checked) {
                this.checked = true;
                showNotification('Debe seleccionar al menos un tipo de carácter');
            }
            generatePassword();
        });
    });

    // Función principal para generar una contraseña mediante la API de Python
    async function generatePassword() {
        // Mostrar indicador de carga
        passwordResult.value = "Generando...";
        
        // Preparar los datos para la solicitud
        const requestData = {
            length: passwordLength,
            uppercase: uppercaseCheckbox.checked,
            lowercase: lowercaseCheckbox.checked,
            numbers: numbersCheckbox.checked,
            special: specialCheckbox.checked
        };
        
        try {
            // Llamar a la API
            const response = await fetch('/api/generate-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error('Error al generar la contraseña');
            }
            
            const data = await response.json();
            
            // Mostrar la contraseña
            passwordResult.value = data.password;
            
            // Actualizar el medidor de seguridad
            updateStrengthMeter(data.strength.score, data.strength.level);
            
            // Solicitar análisis detallado (podríamos expandir esto en el futuro)
            requestPasswordAnalysis(data.password);
            
        } catch (error) {
            console.error('Error:', error);
            passwordResult.value = "Error al generar";
            showNotification('Error al generar la contraseña. Inténtelo de nuevo.');
        }
    }
    
    // Función para solicitar un análisis detallado de la contraseña
    async function requestPasswordAnalysis(password) {
        try {
            // Esta ruta aún no existe en el backend, pero podríamos implementarla
            // en el futuro para obtener análisis más detallados
            const response = await fetch('/api/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });
            
            if (!response.ok) {
                throw new Error('Error al analizar la contraseña');
            }
            
            const data = await response.json();
            
            // Mostrar el análisis detallado
            // Esto es un placeholder para una futura implementación
            passwordAnalysis.style.display = 'block';
            securityScoreElement.textContent = `${data.strength.score}/100`;
            
            // Placeholder para el tiempo de descifrado (implementación futura)
            const scoreToTime = {
                25: "segundos",
                50: "horas",
                75: "meses",
                90: "años",
                100: "siglos"
            };
            
            let timeEstimate = "segundos";
            for (const [score, time] of Object.entries(scoreToTime)) {
                if (data.strength.score >= parseInt(score)) {
                    timeEstimate = time;
                }
            }
            
            crackTimeElement.textContent = timeEstimate;
            
        } catch (error) {
            console.error('Error en análisis:', error);
            // No mostrar errores de análisis al usuario, ya que es una característica secundaria
        }
    }

    // Función para copiar la contraseña al portapapeles
    function copyToClipboard() {
        passwordResult.select();
        document.execCommand('copy');
        
        // Desseleccionar el texto
        window.getSelection().removeAllRanges();
        
        // Efecto visual de copiado
        copyPasswordBtn.classList.add('copy-animation');
        setTimeout(() => {
            copyPasswordBtn.classList.remove('copy-animation');
        }, 300);
        
        // Mostrar notificación
        showNotification('Contraseña copiada al portapapeles');
    }

    // Función para mostrar una notificación
    function showNotification(message) {
        // Eliminar notificación existente si hay alguna
        const existingNotification = document.querySelector('.copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Mostrar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar la notificación después de 2 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    // Función para actualizar el medidor de seguridad
    function updateStrengthMeter(score, level) {
        // Resetear las barras
        strengthBars.forEach(bar => {
            bar.className = 'bar';
        });
        
        // Actualizar barras según la puntuación
        if (score >= 25) {
            strengthBars[0].classList.add('weak');
        }
        if (score >= 50) {
            strengthBars[0].classList.add('medium');
            strengthBars[1].classList.add('medium');
        }
        if (score >= 75) {
            strengthBars[0].classList.add('strong');
            strengthBars[1].classList.add('strong');
            strengthBars[2].classList.add('strong');
        }
        if (score >= 90) {
            strengthBars[0].classList.add('strong');
            strengthBars[1].classList.add('strong');
            strengthBars[2].classList.add('strong');
            strengthBars[3].classList.add('strong');
        }
        
        // Actualizar el texto de seguridad
        strengthText.textContent = level;
        
        // Cambiar el color según el nivel
        if (level === "Muy débil" || level === "Débil") {
            strengthText.style.color = '#dc3545';
        } else if (level === "Media") {
            strengthText.style.color = '#ffc107';
        } else {
            strengthText.style.color = '#28a745';
        }
    }
});