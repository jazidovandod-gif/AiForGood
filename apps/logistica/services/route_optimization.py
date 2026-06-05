import math
from django.conf import settings


def haversine_m(lat1, lon1, lat2, lon2):
    """Distancia en metros entre dos coordenadas GPS (fórmula de Haversine)."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _haversine_matrix(points):
    """Matriz n×n de distancias Haversine. No requiere API externa."""
    n = len(points)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = haversine_m(
                    points[i][0], points[i][1],
                    points[j][0], points[j][1]
                )
    return matrix


def _gmaps_matrix(points):
    """
    Matriz de tiempos de viaje (segundos) vía Google Maps Distance Matrix API.
    Usa departure_time='now' + traffic_model='best_guess' para tiempos con tráfico real.

    La API acepta máx 25 orígenes × 25 destinos (625 elementos) por request.
    Para rutas grandes divide orígenes en lotes de 25 y consulta contra todos los destinos
    en sublotes de 25, ensamblando la matriz completa.

    Retorna None si la clave no está configurada o todas las llamadas fallan.
    """
    try:
        import googlemaps
        key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        if not key:
            return None
        gmaps = googlemaps.Client(key=key)

        n = len(points)
        BATCH = 25
        matrix = [[0.0] * n for _ in range(n)]

        for i_start in range(0, n, BATCH):
            origins_batch = points[i_start:i_start + BATCH]
            for j_start in range(0, n, BATCH):
                dest_batch = points[j_start:j_start + BATCH]
                result = gmaps.distance_matrix(
                    origins=origins_batch,
                    destinations=dest_batch,
                    mode="driving",
                    departure_time="now",
                    traffic_model="best_guess",
                )
                for bi, row in enumerate(result.get('rows', [])):
                    for bj, element in enumerate(row.get('elements', [])):
                        i, j = i_start + bi, j_start + bj
                        if i != j and element.get('status') == 'OK':
                            traffic = element.get('duration_in_traffic', element.get('duration', {}))
                            matrix[i][j] = float(traffic.get('value', 0))
        return matrix
    except Exception:
        return None


def _directions_chunk(gmaps, chunk):
    """
    Llama a Directions API para un segmento de ruta (máx 25 puntos = 23 waypoints).
    Retorna la lista de legs o [] si falla.
    """
    origin = chunk[0]
    destination = chunk[-1]
    waypoints = chunk[1:-1] if len(chunk) > 2 else []

    result = gmaps.directions(
        origin=origin,
        destination=destination,
        waypoints=waypoints or None,
        mode="driving",
        departure_time="now",
        traffic_model="best_guess",
        optimize_waypoints=False,
    )
    if not result:
        return [], '', []
    route = result[0]
    return route.get('legs', []), route.get('summary', ''), route.get('warnings', [])


def get_route_details(ordered_points):
    """
    Obtiene detalles de tráfico en tiempo real para una ruta ordenada.

    La Directions API acepta máx 25 puntos por llamada (origin + 23 waypoints + destination).
    Para rutas más largas divide en chunks solapados (el último punto de cada chunk es
    el primero del siguiente) para no perder ningún tramo.

    Args:
        ordered_points: lista de tuplas (lat, lon) en el orden optimizado.

    Returns:
        dict con legs, polyline, warnings y totales, o None si la API no está disponible.
    """
    if len(ordered_points) < 2:
        return None
    try:
        import googlemaps
        key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        if not key:
            return None
        gmaps = googlemaps.Client(key=key)

        # Directions API: máx 25 puntos por request (1 origin + 23 waypoints + 1 destination)
        CHUNK_SIZE = 25
        STEP = CHUNK_SIZE - 1  # el último punto del chunk anterior es el primero del siguiente

        all_legs = []
        total_distance_m = 0
        total_duration_s = 0
        total_duration_traffic_s = 0
        all_warnings = []
        first_polyline = ''
        summary = ''

        for i in range(0, len(ordered_points) - 1, STEP):
            chunk = ordered_points[i:i + CHUNK_SIZE]
            if len(chunk) < 2:
                break

            legs, chunk_summary, warnings = _directions_chunk(gmaps, chunk)
            if not summary and chunk_summary:
                summary = chunk_summary
            if not first_polyline and legs:
                # La polilínea del primer chunk es suficiente para preview en mapa
                first_polyline = ''  # viene de route, no de legs; se usa la del primer chunk
            all_warnings.extend(warnings)

            for leg in legs:
                duration_s = leg['duration']['value']
                duration_traffic_s = leg.get('duration_in_traffic', leg['duration'])['value']
                distance_m = leg['distance']['value']

                total_distance_m += distance_m
                total_duration_s += duration_s
                total_duration_traffic_s += duration_traffic_s

                all_legs.append({
                    'start': leg['start_address'],
                    'end': leg['end_address'],
                    'distance_m': distance_m,
                    'distance_text': leg['distance']['text'],
                    'duration_s': duration_s,
                    'duration_text': leg['duration']['text'],
                    'duration_traffic_s': duration_traffic_s,
                    'duration_traffic_text': leg.get('duration_in_traffic', leg['duration'])['text'],
                    'traffic_delay_s': duration_traffic_s - duration_s,
                })

        if not all_legs:
            return None

        # Polilínea: obtener del primer chunk directamente
        try:
            first_result = gmaps.directions(
                origin=ordered_points[0],
                destination=ordered_points[min(CHUNK_SIZE - 1, len(ordered_points) - 1)],
                waypoints=ordered_points[1:min(CHUNK_SIZE - 1, len(ordered_points) - 1)] or None,
                mode="driving",
                departure_time="now",
                traffic_model="best_guess",
                optimize_waypoints=False,
            )
            first_polyline = first_result[0]['overview_polyline']['points'] if first_result else ''
        except Exception:
            first_polyline = ''

        return {
            'legs': all_legs,
            'overview_polyline': first_polyline,
            'summary': summary,
            'warnings': list(set(all_warnings)),
            'total_distance_m': total_distance_m,
            'total_distance_text': f"{total_distance_m / 1000:.1f} km",
            'total_duration_s': total_duration_s,
            'total_duration_traffic_s': total_duration_traffic_s,
            'total_traffic_delay_s': total_duration_traffic_s - total_duration_s,
        }
    except Exception:
        return None


def _nearest_neighbor(matrix, start=0):
    """
    Heurística del vecino más cercano para TSP.
    Construye un tour greedy partiendo de `start`. O(n²).
    """
    n = len(matrix)
    visited = [False] * n
    tour = [start]
    visited[start] = True

    for _ in range(n - 1):
        current = tour[-1]
        nearest = min(
            (j for j in range(n) if not visited[j]),
            key=lambda j: matrix[current][j]
        )
        tour.append(nearest)
        visited[nearest] = True

    return tour


def _two_opt(tour, matrix):
    """
    Mejora iterativa 2-opt: invierte segmentos del tour cuando reduce la
    distancia total. O(n²) por pasada; ~10-20% de mejora sobre Nearest Neighbor.
    """
    n = len(tour)
    improved = True
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                a, b = tour[i - 1], tour[i]
                c, d = tour[j], tour[(j + 1) % n]
                delta = (matrix[a][b] + matrix[c][d]) - (matrix[a][c] + matrix[b][d])
                if delta > 1e-6:
                    tour[i:j + 1] = tour[i:j + 1][::-1]
                    improved = True
    return tour


def tour_distance(tour, matrix):
    """Distancia total de un tour (suma de aristas consecutivas)."""
    return sum(matrix[tour[i]][tour[(i + 1) % len(tour)]] for i in range(len(tour)))


def optimize_route(pdvs, start_pdv_index=0):
    """
    Optimiza el orden de visita a una lista de PDVs.

    Algoritmo: Nearest Neighbor + 2-opt.
    Fuente de pesos: Google Maps (tiempos con tráfico real) o Haversine (fallback).

    Args:
        pdvs: lista o queryset de PDV con atributo `location` (Point SRID 4326).
        start_pdv_index: índice del PDV de inicio (depósito del reponedor).

    Returns:
        dict con:
          - 'pdvs': lista de PDVs en orden optimizado
          - 'route_details': detalles de ruta con tráfico (None si sin API)
    """
    pdvs = list(pdvs)

    if len(pdvs) < 2:
        return {'pdvs': pdvs, 'route_details': None}

    points = [(pdv.location.y, pdv.location.x) for pdv in pdvs]

    matrix = _gmaps_matrix(points) or _haversine_matrix(points)

    tour = _nearest_neighbor(matrix, start=start_pdv_index)
    if len(tour) > 3:
        tour = _two_opt(tour, matrix)

    ordered_pdvs = [pdvs[i] for i in tour]
    ordered_points = [points[i] for i in tour]

    route_details = get_route_details(ordered_points)

    return {
        'pdvs': ordered_pdvs,
        'route_details': route_details,
    }
