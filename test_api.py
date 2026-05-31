import requests
import json

BASE_URL = "http://localhost:8000/api"

print("--- 🚀 INICIANDO TEST AUTOMÁTICO DE LA API ANTIGRABITI ---")

# 1. Login para obtener JWT y sellar el Device ID
print("\n[1] Intentando Login y obteniendo Token JWT (Anti-Spoofing)...")
login_payload = {
    "username": "admin",
    "password": "admin123",
    "device_id": "iPhone-Prueba-1"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_payload)
except requests.exceptions.ConnectionError:
    print("❌ Error: No me pude conectar. ¿Estás seguro de que 'docker-compose up' está corriendo?")
    exit(1)

if response.status_code == 200:
    token = response.json().get('access')
    print("✅ ¡Login exitoso! Token criptográfico obtenido.")
    
    # 2. Intentar Check-in Geográfico
    print("\n[2] Disparando Check-In a la Sucursal con el Motor Espacial (PostGIS)...")
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Device-ID": "iPhone-Prueba-1"  # Debe coincidir exactamente con el del login
    }
    
    checkin_payload = {
        "route_stop_id": "11111111-1111-1111-1111-111111111111",
        "latitud": -33.4489, 
        "longitud": -70.6693,
        "velocidad_kmh": 0,
        "es_mock_location": False
    }
    
    checkin_res = requests.post(f"{BASE_URL}/logistica/checkin/", json=checkin_payload, headers=headers)
    print(f"Status Code: {checkin_res.status_code}")
    print("Respuesta del Motor Backend:")
    print(json.dumps(checkin_res.json(), indent=2, ensure_ascii=False))
else:
    print("❌ Error en el Login.")
    print(response.text)
