from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Inicializa la base de datos con un superusuario por defecto para desarrollo.'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@antigrabiti.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('✅ Superusuario creado automáticamente: admin / admin123'))
        else:
            self.stdout.write(self.style.WARNING('⚡ El superusuario admin ya existe.'))

        # Crear sucursal de prueba para que funcione el test_api.py
        from apps.logistica.models.geospatial import RutaAsignada
        from django.contrib.gis.geos import Point

        if not RutaAsignada.objects.filter(id=1).exists():
            # Sucursal central de prueba
            punto = Point(-70.6693, -33.4489, srid=4326)
            RutaAsignada.objects.create(
                id=1,
                nombre_sucursal="Sucursal Central Hackathon",
                ubicacion_objetivo=punto,
                radio_tolerancia_metros=100.0
            )
            self.stdout.write(self.style.SUCCESS('✅ Sucursal de prueba (ID: 1) creada en PostGIS.'))
