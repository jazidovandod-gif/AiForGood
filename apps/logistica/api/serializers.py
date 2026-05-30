from rest_framework import serializers
from django.contrib.gis.geos import Point
from apps.logistica.models import RouteStop, Visit, FormularioDinamico, ProductoExterno
from apps.logistica.services.geofencing import GeofencingService
from django.utils import timezone

class CheckInSerializer(serializers.Serializer):
    route_stop_id = serializers.UUIDField(required=True)
    latitud = serializers.FloatField(required=True)
    longitud = serializers.FloatField(required=True)
    velocidad_kmh = serializers.FloatField(default=0.0)
    bateria_porcentaje = serializers.IntegerField(default=100)
    es_mock_location = serializers.BooleanField(default=False)

    def validate(self, attrs):
        if attrs.get("es_mock_location"):
            raise serializers.ValidationError("Intento de fraude detectado: Dispositivo utilizando Fake GPS.")
            
        if GeofencingService.regla_antispoofing_velocidad(attrs.get("velocidad_kmh", 0.0)):
            raise serializers.ValidationError("Anomalía cinética. Velocidad imposible detectada.")

        geofence_status = GeofencingService.validar_checkin(
            route_stop_id=attrs["route_stop_id"],
            latitud=attrs["latitud"],
            longitud=attrs["longitud"],
        )
        
        if not geofence_status.get("autorizado", False):
            raise serializers.ValidationError(
                f"Fuera del perímetro de seguridad comercial. Estás a {geofence_status.get('distancia_metros')}m "
                f"(Tolerancia: {geofence_status.get('tolerancia_metros')}m)."
            )
            
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        punto = Point(validated_data["longitud"], validated_data["latitud"], srid=4326)
        
        stop = RouteStop.objects.get(id=validated_data["route_stop_id"])
        
        # Crear la visita real
        visita = Visit.objects.create(
            route_stop=stop,
            pdv=stop.pdv,
            replenisher=user,
            status='in_progress',
            started_at=timezone.now()
        )
        
        # Actualizar el RouteStop con la ubicación real
        stop.status = 'in_progress'
        stop.arrived_at = timezone.now()
        stop.arrival_location = punto
        stop.save()
        
        return visita

class FormularioDinamicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioDinamico
        fields = [
            "id", 
            "visit", 
            "tipo_formulario", 
            "datos_extra", 
            "foto_evidencia", 
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]

class ProductoExternoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoExterno
        fields = "__all__"
