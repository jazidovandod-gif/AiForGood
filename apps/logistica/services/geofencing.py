from django.contrib.gis.geos import Point
from apps.logistica.models import RouteStop

class GeofencingService:
    """
    Motor de cálculos trigonométricos espaciales.
    Aprovecha el motor de la base de datos o el procesador GEOS en memoria.
    """
    
    @staticmethod
    def validar_checkin(route_stop_id: str, latitud: float, longitud: float) -> dict:
        """
        Calcula la distancia esférica real entre el reponedor y el Punto de Venta.
        """
        try:
            stop = RouteStop.objects.get(id=route_stop_id)
        except RouteStop.DoesNotExist:
            return {
                "autorizado": False,
                "error": "Parada de ruta o PDV no encontrado en base de datos",
            }

        punto_reponedor = Point(longitud, latitud, srid=4326)
        
        # distance() devuelve grados. Multiplicamos por 111,320 para metros (aprox).
        distancia_metros = punto_reponedor.distance(stop.pdv.location) * 111320.0
        
        # Tolerancia fija de 100 metros para PDVs (o lo que configuremos)
        tolerancia_metros = 100.0
        autorizado = distancia_metros <= tolerancia_metros
        
        return {
            "autorizado": autorizado,
            "distancia_metros": round(distancia_metros, 2),
            "tolerancia_metros": tolerancia_metros,
        }
        
    @staticmethod
    def regla_antispoofing_velocidad(velocidad_kmh: float) -> bool:
        VELOCIDAD_MAXIMA_LOGICA_KMH = 150.0
        return velocidad_kmh > VELOCIDAD_MAXIMA_LOGICA_KMH
