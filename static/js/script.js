// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const passwordResult = document.getElementById('password-result');
    const copyPasswordBtn = document.getElementById('copy-password');
    const refreshPasswordBtn = document.getElementById('refresh-password');
    const generatePasswordBtn = document.getElementById('generate-password');
    const passwordLengthInput = document.getElementById('password-length');
    const lengthSlider = document.getElementById('length-slider');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const specialCheckbox = document.getElementById('special');
    const standardRadio = document.getElementById('standard');
    const easyToReadRadio = document.getElementById('easy-to-read');
    const easyToPronounceRadio = document.getElementById('easy-to-pronounce');
    const strengthMeter = document.querySelector('.meter-bar');
    const strengthText = document.getElementById('strength-text');
    const themeSwitch = document.getElementById('theme-switch');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Configuración inicial
    let passwordLength = 12;
    passwordLengthInput.value = passwordLength;
    lengthSlider.value = passwordLength;

    // Establecer tema según preferencia del usuario
    initTheme();

    // Generar una contraseña al cargar la página
    generatePassword();

    // Evento para generar una nueva contraseña
    generatePasswordBtn.addEventListener('click', generatePassword);
    refreshPasswordBtn.addEventListener('click', generatePassword);

    // Evento para copiar la contraseña al portapapeles
    copyPasswordBtn.addEventListener('click', copyToClipboard);

    // Evento para cambiar la longitud con el slider
    lengthSlider.addEventListener('input', function() {
        passwordLength = parseInt(this.value);
        passwordLengthInput.value = passwordLength;
        generatePassword();
    });

    // Evento para cambiar la longitud manualmente
    passwordLengthInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value >= 4 && value <= 50) {
            passwordLength = value;
            lengthSlider.value = value;
        } else if (value < 4) {
            passwordLength = 4;
            this.value = 4;
            lengthSlider.value = 4;
        } else if (value > 50) {
            passwordLength = 50;
            this.value = 50;
            lengthSlider.value = 50;
        }
        generatePassword();
    });

    // Eventos para las opciones de tipo de contraseña
    standardRadio.addEventListener('change', generatePassword);
    easyToReadRadio.addEventListener('change', generatePassword);
    easyToPronounceRadio.addEventListener('change', generatePassword);

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
                showToast('Debe seleccionar al menos un tipo de carácter');
            }
            generatePassword();
        });
    });

    // Evento para cambiar tema
    themeSwitch.addEventListener('click', toggleTheme);

    // Función principal para generar una contraseña mediante la API de Python
    async function generatePassword() {
        // Mostrar indicador de carga
        passwordResult.value = "Generando...";
        
        // Preparar el tipo de contraseña
        let passwordType = 'standard';
        if (easyToReadRadio.checked) {
            passwordType = 'easy-to-read';
        } else if (easyToPronounceRadio.checked) {
            passwordType = 'easy-to-pronounce';
        }
        
        // Preparar los datos para la solicitud
        const requestData = {
            length: passwordLength,
            type: passwordType,
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
            
        } catch (error) {
            console.error('Error:', error);
            passwordResult.value = "Error al generar";
            showToast('Error al generar la contraseña. Inténtelo de nuevo.');
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
        showToast('Contraseña copiada al portapapeles');
    }

    // Función para mostrar notificaciones toast
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        // Ocultar el toast después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Función para actualizar el medidor de seguridad
    function updateStrengthMeter(score, level) {
        // Actualizar la barra de progreso
        const percentage = score + '%';
        strengthMeter.style.width = percentage;
        
        // Actualizar el texto
        strengthText.textContent = level;
        
        // Cambiar el color según el nivel
        if (score < 40) {
            strengthMeter.style.width = '25%';
            strengthText.style.color = 'var(--danger-color)';
        } else if (score < 70) {
            strengthMeter.style.width = '50%';
            strengthText.style.color = 'var(--warning-color)';
        } else if (score < 90) {
            strengthMeter.style.width = '75%';
            strengthText.style.color = 'var(--primary-color)';
        } else {
            strengthMeter.style.width = '100%';
            strengthText.style.color = 'var(--success-color)';
        }
    }

    // Función para inicializar el tema
    function initTheme() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme');
        
        if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
            document.body.setAttribute('data-theme', 'dark');
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Función para cambiar el tema
    function toggleTheme() {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
});