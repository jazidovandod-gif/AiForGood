import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def print_banner(title):
    print(f"\n==================================================")
    print(f"🚀 {title}")
    print(f"==================================================")

def get_auth_token():
    print("[Autenticación] Solicitando token JWT...")
    login_payload = {
        "username": "admin",
        "password": "admin123",
        "device_id": "iPhone-Prueba-1"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_payload)
        response.raise_for_status()
        token = response.json().get('access')
        print("✅ Autenticación exitosa.")
        return token
    except Exception as e:
        print(f"❌ Error de autenticación: {e}")
        print("¿Aseguraste que el backend está corriendo?")
        sys.exit(1)

def run_test_case(name, payload, headers):
    print(f"\n👉 Ejecutando: {name}")
    print(f"Payload enviado: {json.dumps(payload, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/logistica/checkin/", json=payload, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    try:
        print("Respuesta:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except Exception:
        print(f"Respuesta cruda: {response.text}")

def main():
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Device-ID": "iPhone-Prueba-1"
    }

    # Caso 1: Check-in Exitoso (Dentro del rango de la Sucursal Central - Tolerancia 100m)
    print_banner("Caso 1: Check-in Exitoso (Dentro del Perímetro)")
    run_test_case(
        "Check-in en la ubicación exacta de la sucursal",
        {
            "ruta_id": 1,
            "latitud": -33.4489, 
            "longitud": -70.6693,
            "velocidad_kmh": 0,
            "es_mock_location": False
        },
        headers
    )

    # Caso 2: Check-in Fallido por Distancia (Fuera del rango)
    print_banner("Caso 2: Check-in Fallido (Fuera del Perímetro)")
    run_test_case(
        "Check-in alejado de la sucursal (Santiago Centro vs Providencia)",
        {
            "ruta_id": 1,
            "latitud": -33.4250, # Latitud desplazada hacia el noreste
            "longitud": -70.6150, # Longitud desplazada hacia el este
            "velocidad_kmh": 0,
            "es_mock_location": False
        },
        headers
    )

    # Caso 3: Intento de Fraude por Mock Location (Fake GPS)
    print_banner("Caso 3: Bloqueo de Seguridad (Ubicación Simulada/Mock)")
    run_test_case(
        "Check-in en coordenadas correctas pero con flag es_mock_location=True",
        {
            "ruta_id": 1,
            "latitud": -33.4489, 
            "longitud": -70.6693,
            "velocidad_kmh": 0,
            "es_mock_location": True
        },
        headers
    )

    # Caso 4: Intento de Fraude por Velocidad Cinética Imposible
    print_banner("Caso 4: Bloqueo de Seguridad (Velocidad Imposible)")
    run_test_case(
        "Check-in a velocidad absurda (250 km/h)",
        {
            "ruta_id": 1,
            "latitud": -33.4489, 
            "longitud": -70.6693,
            "velocidad_kmh": 250.0,
            "es_mock_location": False
        },
        headers
    )

if __name__ == "__main__":
    main()
