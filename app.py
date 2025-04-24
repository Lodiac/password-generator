from flask import Flask, render_template, request, jsonify
import password_gen

app = Flask(__name__)

@app.route('/')
def index():
    """Ruta principal que renderiza la página de inicio."""
    return render_template('index.html')

@app.route('/api/generate-password', methods=['POST'])
def generate_password():
    """API para generar contraseñas."""
    # Obtener los parámetros de la solicitud
    data = request.json
    length = data.get('length', 12)
    use_uppercase = data.get('uppercase', True)
    use_lowercase = data.get('lowercase', True)
    use_numbers = data.get('numbers', True)
    use_special = data.get('special', True)
    
    # Validar los parámetros
    if length < 4:
        length = 4
    elif length > 50:
        length = 50
    
    # Al menos un tipo de carácter debe estar activado
    if not any([use_uppercase, use_lowercase, use_numbers, use_special]):
        use_lowercase = True  # Activar minúsculas por defecto si nada está seleccionado
    
    # Generar la contraseña
    try:
        password = password_gen.generate_password_secure(
            length=length,
            usar_mayusculas=use_uppercase,
            usar_minusculas=use_lowercase,
            usar_numeros=use_numbers,
            usar_especiales=use_special
        )
        
        # Calcular la puntuación de seguridad
        strength_score = password_gen.calculate_password_strength(password)
        
        # Determinar el nivel de seguridad
        if strength_score < 25:
            strength_level = "Muy débil"
        elif strength_score < 50:
            strength_level = "Débil"
        elif strength_score < 75:
            strength_level = "Media"
        elif strength_score < 90:
            strength_level = "Fuerte"
        else:
            strength_level = "Muy fuerte"
        
        return jsonify({
            'password': password,
            'strength': {
                'score': strength_score,
                'level': strength_level
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-password', methods=['POST'])
def check_password():
    """API para verificar la seguridad de una contraseña existente."""
    data = request.json
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'No se proporcionó contraseña'}), 400
    
    # Calcular la puntuación de seguridad
    strength_score = password_gen.calculate_password_strength(password)
    
    # Determinar el nivel de seguridad
    if strength_score < 25:
        strength_level = "Muy débil"
    elif strength_score < 50:
        strength_level = "Débil"
    elif strength_score < 75:
        strength_level = "Media"
    elif strength_score < 90:
        strength_level = "Fuerte"
    else:
        strength_level = "Muy fuerte"
    
    return jsonify({
        'strength': {
            'score': strength_score,
            'level': strength_level
        }
    })

if __name__ == '__main__':
    app.run(debug=True)