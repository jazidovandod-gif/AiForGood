import requests
import json

BASE_URL = "http://localhost:8001/api"

# Coordenadas reales del PDV seed (id=11111111-...) — La Paz, Bolivia
PDV_LAT = -16.53678674
PDV_LON = -68.04696858

print("--- 🚀 INICIANDO TEST AUTOMÁTICO DE LA API VENADO ROUTE AI ---")

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
    print("❌ Error: No me pude conectar. ¿Estás seguro de que 'docker compose up' está corriendo?")
    exit(1)

if response.status_code == 200:
    token = response.json().get('access')
    print("✅ ¡Login exitoso! Token criptográfico obtenido.")

    # 2. Intentar Check-in Geográfico
    print("\n[2] Disparando Check-In a la Sucursal con el Motor Espacial (PostGIS)...")
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Device-ID": "iPhone-Prueba-1"
    }

    checkin_payload = {
        "route_stop_id": "11111111-1111-1111-1111-111111111111",
        "latitud": PDV_LAT,
        "longitud": PDV_LON,
        "velocidad_kmh": 0,
        "es_mock_location": False
    }

    checkin_res = requests.post(f"{BASE_URL}/logistica/checkin/", json=checkin_payload, headers=headers)
    print(f"Status Code: {checkin_res.status_code}")
    print("Respuesta del Motor Backend:")
    print(json.dumps(checkin_res.json(), indent=2, ensure_ascii=False))

    if checkin_res.status_code in (200, 201):
        print("\n✅ CHECK-IN GEOFENCING: APROBADO")
    else:
        print("\n❌ CHECK-IN GEOFENCING: RECHAZADO")
else:
    print("❌ Error en el Login.")
    print(response.text)
