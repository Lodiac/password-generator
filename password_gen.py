import random
import string
import re

def generate_password(longitud=12, usar_mayusculas=True, usar_minusculas=True, 
                     usar_numeros=True, usar_especiales=True):
    """
    Genera una contraseña aleatoria con los parámetros especificados.
    
    Args:
        longitud (int): Longitud de la contraseña a generar.
        usar_mayusculas (bool): Incluir letras mayúsculas.
        usar_minusculas (bool): Incluir letras minúsculas.
        usar_numeros (bool): Incluir números.
        usar_especiales (bool): Incluir caracteres especiales.
        
    Returns:
        str: Contraseña generada.
    """
    # Definir los grupos de caracteres
    mayusculas = string.ascii_uppercase
    minusculas = string.ascii_lowercase
    numeros = string.digits
    especiales = string.punctuation
    
    # Crear el pool de caracteres según las opciones seleccionadas
    caracteres = ""
    if usar_mayusculas:
        caracteres += mayusculas
    if usar_minusculas:
        caracteres += minusculas
    if usar_numeros:
        caracteres += numeros
    if usar_especiales:
        caracteres += especiales
        
    # Verificar que al menos un grupo de caracteres esté seleccionado
    if len(caracteres) == 0:
        raise ValueError("Debe seleccionar al menos un grupo de caracteres")
    
    # Generar la contraseña
    password = ''.join(random.choice(caracteres) for _ in range(longitud))
    
    return password

def generate_password_secure(length=12, usar_mayusculas=True, usar_minusculas=True, 
                           usar_numeros=True, usar_especiales=True):
    """
    Genera una contraseña aleatoria garantizando que contenga al menos 
    un carácter de cada tipo seleccionado.
    """
    # Verificar que la longitud sea suficiente para incluir todos los tipos requeridos
    tipos_requeridos = sum([usar_mayusculas, usar_minusculas, usar_numeros, usar_especiales])
    if length < tipos_requeridos:
        raise ValueError(f"La longitud debe ser al menos {tipos_requeridos} para incluir todos los tipos requeridos")
    
    # Generar una contraseña básica
    password = generate_password(length, usar_mayusculas, usar_minusculas, usar_numeros, usar_especiales)
    
    # Verificar que la contraseña contiene al menos un carácter de cada tipo requerido
    tiene_mayuscula = any(c in string.ascii_uppercase for c in password) if usar_mayusculas else True
    tiene_minuscula = any(c in string.ascii_lowercase for c in password) if usar_minusculas else True
    tiene_numero = any(c in string.digits for c in password) if usar_numeros else True
    tiene_especial = any(c in string.punctuation for c in password) if usar_especiales else True
    
    # Si no cumple con todos los requisitos, generar una nueva
    if not (tiene_mayuscula and tiene_minuscula and tiene_numero and tiene_especial):
        return generate_password_secure(length, usar_mayusculas, usar_minusculas, usar_numeros, usar_especiales)
    
    return password

def calculate_password_strength(password):
    """
    Calcula la puntuación de seguridad de una contraseña (0-100).
    
    Args:
        password (str): La contraseña a evaluar.
    
    Returns:
        int: Puntuación de seguridad (0-100).
    """
    score = 0
    
    # Longitud (máx 40 puntos)
    length_score = min(40, len(password) * 2)
    score += length_score
    
    # Variedad de caracteres (máx 60 puntos)
    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_lowercase = bool(re.search(r'[a-z]', password))
    has_numbers = bool(re.search(r'[0-9]', password))
    has_special = bool(re.search(r'[^A-Za-z0-9]', password))
    
    # Puntos por cada tipo de carácter utilizado
    if has_uppercase:
        score += 15
    if has_lowercase:
        score += 15
    if has_numbers:
        score += 15
    if has_special:
        score += 15
    
    return score

# Función adicional para análisis de seguridad más avanzado
def analyze_password_security(password):
    """
    Realiza un análisis más detallado de la seguridad de la contraseña.
    
    Args:
        password (str): La contraseña a analizar.
    
    Returns:
        dict: Resultado del análisis con varios indicadores.
    """
    result = {
        'length': len(password),
        'has_uppercase': bool(re.search(r'[A-Z]', password)),
        'has_lowercase': bool(re.search(r'[a-z]', password)),
        'has_numbers': bool(re.search(r'[0-9]', password)),
        'has_special': bool(re.search(r'[^A-Za-z0-9]', password)),
        'score': calculate_password_strength(password),
    }
    
    # Identificar patrones comunes y poco seguros
    result['has_sequential_chars'] = bool(re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)', password.lower()))
    result['has_repeated_chars'] = bool(re.search(r'(.)\1{2,}', password))  # 3 o más caracteres repetidos
    
    # Verificar si incluye palabras comunes (simplificado)
    common_words = ['password', 'contraseña', 'admin', '123456', 'qwerty', 'welcome', 'letmein']
    result['has_common_word'] = any(word in password.lower() for word in common_words)
    
    # Tiempo estimado para crackear por fuerza bruta (muy simplificado)
    # Asumiendo 1 billón de intentos por segundo (estimación conservadora para un atacante motivado)
    attempts_per_second = 1_000_000_000_000  # 10^12
    
    charset_size = 0
    if result['has_lowercase']:
        charset_size += 26
    if result['has_uppercase']:
        charset_size += 26
    if result['has_numbers']:
        charset_size += 10
    if result['has_special']:
        charset_size += 33  # Aproximadamente
    
    if charset_size == 0:  # Por si acaso
        charset_size = 26
    
    # Número total de combinaciones posibles
    combinations = charset_size ** len(password)
    
    # Tiempo en segundos (promedio es la mitad del total)
    time_to_crack_seconds = (combinations / attempts_per_second) / 2
    
    # Convertir a formato legible
    if time_to_crack_seconds < 1:
        time_to_crack = "menos de un segundo"
    elif time_to_crack_seconds < 60:
        time_to_crack = f"{time_to_crack_seconds:.1f} segundos"
    elif time_to_crack_seconds < 3600:
        time_to_crack = f"{time_to_crack_seconds/60:.1f} minutos"
    elif time_to_crack_seconds < 86400:
        time_to_crack = f"{time_to_crack_seconds/3600:.1f} horas"
    elif time_to_crack_seconds < 31536000:
        time_to_crack = f"{time_to_crack_seconds/86400:.1f} días"
    elif time_to_crack_seconds < 31536000 * 100:
        time_to_crack = f"{time_to_crack_seconds/31536000:.1f} años"
    else:
        time_to_crack = "más de 100 años"
    
    result['time_to_crack'] = time_to_crack
    
    return result

if __name__ == "__main__":
    # Pruebas del módulo
    print("Generando contraseñas de prueba:")
    
    # Contraseña estándar
    pwd = generate_password()
    print(f"Contraseña estándar: {pwd}")
    print(f"Puntuación: {calculate_password_strength(pwd)}/100")
    
    # Contraseña personalizada
    pwd = generate_password(longitud=16, usar_especiales=False)
    print(f"Contraseña personalizada (16 chars, sin especiales): {pwd}")
    print(f"Puntuación: {calculate_password_strength(pwd)}/100")
    
    # Contraseña segura
    pwd = generate_password_secure(length=10)
    print(f"Contraseña segura (10 chars): {pwd}")
    print(f"Puntuación: {calculate_password_strength(pwd)}/100")
    
    # Análisis detallado
    print("\nAnálisis detallado de seguridad:")
    analysis = analyze_password_security("P@ssw0rd123!")
    for key, value in analysis.items():
        print(f"{key}: {value}")