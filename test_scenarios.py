import requests
import json
import sys

BASE_URL = "http://localhost:8001/api"

# Coordenadas reales del PDV seed (id=11111111-...) — La Paz, Bolivia
PDV_LAT = -16.53678674
PDV_LON = -68.04696858

# Coordenadas fuera del perímetro (~2km al norte del PDV)
FUERA_LAT = -16.5190
FUERA_LON = -68.0470

ROUTE_STOP_ID = "11111111-1111-1111-1111-111111111111"

PASS = "✅ PASS"
FAIL = "❌ FAIL"


def print_banner(title):
    print(f"\n{'='*50}")
    print(f"🚀 {title}")
    print(f"{'='*50}")


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
        print("¿Aseguraste que el backend está corriendo en el puerto 8001?")
        sys.exit(1)


def run_test_case(name, payload, headers, expect_status):
    print(f"\n👉 Ejecutando: {name}")
    print(f"Payload enviado: {json.dumps(payload, indent=2)}")

    response = requests.post(f"{BASE_URL}/logistica/checkin/", json=payload, headers=headers)

    print(f"Status Code: {response.status_code}")
    try:
        print("Respuesta:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except Exception:
        print(f"Respuesta cruda: {response.text}")

    resultado = PASS if response.status_code == expect_status else FAIL
    print(f"\nResultado: {resultado} (esperado {expect_status}, obtenido {response.status_code})")
    return response.status_code == expect_status


def main():
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Device-ID": "iPhone-Prueba-1"
    }

    resultados = []

    # Caso 1: Check-in exitoso — coordenadas exactas del PDV, sin fraude
    print_banner("Caso 1: Check-in Exitoso (Dentro del Perímetro)")
    resultados.append(run_test_case(
        "Check-in en la ubicación exacta del PDV (La Paz, Bolivia)",
        {
            "route_stop_id": ROUTE_STOP_ID,
            "latitud": PDV_LAT,
            "longitud": PDV_LON,
            "velocidad_kmh": 0,
            "es_mock_location": False
        },
        headers,
        expect_status=201
    ))

    # Caso 2: Check-in fallido — coordenadas alejadas del PDV (~2km)
    print_banner("Caso 2: Check-in Fallido (Fuera del Perímetro)")
    resultados.append(run_test_case(
        "Check-in ~2km al norte del PDV",
        {
            "route_stop_id": ROUTE_STOP_ID,
            "latitud": FUERA_LAT,
            "longitud": FUERA_LON,
            "velocidad_kmh": 0,
            "es_mock_location": False
        },
        headers,
        expect_status=400
    ))

    # Caso 3: Bloqueo por Mock Location (Fake GPS)
    print_banner("Caso 3: Bloqueo de Seguridad (Ubicación Simulada/Mock)")
    resultados.append(run_test_case(
        "Check-in en coordenadas correctas pero con flag es_mock_location=True",
        {
            "route_stop_id": ROUTE_STOP_ID,
            "latitud": PDV_LAT,
            "longitud": PDV_LON,
            "velocidad_kmh": 0,
            "es_mock_location": True
        },
        headers,
        expect_status=400
    ))

    # Caso 4: Bloqueo por velocidad cinética imposible
    print_banner("Caso 4: Bloqueo de Seguridad (Velocidad Imposible)")
    resultados.append(run_test_case(
        "Check-in a velocidad absurda (250 km/h)",
        {
            "route_stop_id": ROUTE_STOP_ID,
            "latitud": PDV_LAT,
            "longitud": PDV_LON,
            "velocidad_kmh": 250.0,
            "es_mock_location": False
        },
        headers,
        expect_status=400
    ))

    # Resumen
    total = len(resultados)
    pasados = sum(resultados)
    print(f"\n{'='*50}")
    print(f"RESUMEN: {pasados}/{total} tests pasaron")
    print('='*50)
    sys.exit(0 if pasados == total else 1)


if __name__ == "__main__":
    main()
