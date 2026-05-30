from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.gis.geos import Point
import uuid

class Command(BaseCommand):
    help = 'Inicializa la BD con datos reales del Excel (Mercados, PDVs, Usuarios y Rutas).'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        
        self.stdout.write(self.style.WARNING('--- Creando Usuarios del Excel ---'))
        
        # Diccionario para guardar los usuarios creados y asignarlos luego
        usuarios = {}
        
        # 1. Superusuario Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@venado.com', 'admin123')
            self.stdout.write('✅ Admin creado: admin / admin123')
            
        # 2. Crear Supervisores y Reponedores mencionados en el Excel
        cuentas = [
            {'user': 'supervisor1', 'rol': 'Supervisor', 'pass': 'super123'},
            {'user': 'supervisor2', 'rol': 'Supervisor', 'pass': 'super123'},
            {'user': 'reponedor1', 'rol': 'Reponedor', 'pass': 'repo123'},
            {'user': 'reponedor2', 'rol': 'Reponedor', 'pass': 'repo123'},
            {'user': 'reponedor9', 'rol': 'Reponedor', 'pass': 'repo123'},
            {'user': 'reponedor10', 'rol': 'Reponedor', 'pass': 'repo123'},
            {'user': 'reponedor13', 'rol': 'Reponedor', 'pass': 'repo123'},
        ]
        
        for c in cuentas:
            obj, created = User.objects.get_or_create(username=c['user'])
            if created:
                obj.set_password(c['pass'])
                obj.first_name = c['user'].capitalize()
                obj.last_name = c['rol']
                obj.save()
            usuarios[c['user']] = obj
            
        self.stdout.write(self.style.SUCCESS('✅ Usuarios del Excel listos.'))

        # 3. Datos extraídos de la foto del Excel
        self.stdout.write(self.style.WARNING('--- Limpiando datos antiguos de rutas ---'))
        from apps.logistica.models import Market, ClientType, PDV, Route, RouteStop
        
        RouteStop.objects.all().delete()
        Route.objects.all().delete()
        PDV.objects.all().delete()
        Market.objects.all().delete()
        
        self.stdout.write(self.style.WARNING('--- Poblando PDVs y Mercados (56 clientes) ---'))
        
        from apps.logistica.management.commands.excel_data import EXCEL_ROWS
        excel_data = EXCEL_ROWS

        # Crear tipos de cliente
        tipo_minorista, _ = ClientType.objects.get_or_create(category="MINORISTA", defaults={"min_purchase_bs": 500, "avg_visit_minutes": 25})
        tipo_mayorista, _ = ClientType.objects.get_or_create(category="MAYORISTA", defaults={"min_purchase_bs": 5000, "avg_visit_minutes": 45})

        hoy = timezone.now().date()
        
        # Iterar sobre el Excel
        for idx, fila in enumerate(excel_data):
            # Mercado
            market, _ = Market.objects.get_or_create(name=fila["mercado"], defaults={"city": "La Paz"})
            
            # PDV
            punto = Point(fila["lng"], fila["lat"], srid=4326)
            tipo_cliente = tipo_mayorista if fila["cat"] == "MAYORISTA" else tipo_minorista
            
            pdv, pdv_created = PDV.objects.get_or_create(
                code=fila["cod"],
                defaults={
                    "client_code": fila["cliente"],
                    "market": market,
                    "client_type": tipo_cliente,
                    "location": punto,
                    "visit_minutes_estimated": fila["tiempo"],
                    "visit_mon": fila["dias"].get("L", False),
                    "visit_tue": fila["dias"].get("M", False),
                    "visit_wed": fila["dias"].get("X", False),
                    "visit_thu": fila["dias"].get("J", False),
                    "visit_fri": fila["dias"].get("V", False),
                    "visit_sat": fila["dias"].get("S", False),
                }
            )
            
            if pdv_created:
                # Asignar a la Ruta del Reponedor para el día de hoy
                # Para simplificar la prueba, asumimos que hoy le toca visitarlos a todos
                reponedor = usuarios.get(fila["rep"])
                if reponedor:
                    ruta, _ = Route.objects.get_or_create(replenisher=reponedor, route_date=hoy)
                    
                    # Generamos un UUID específico para el primer registro (el de test_api.py)
                    stop_id = uuid.UUID('11111111-1111-1111-1111-111111111111') if idx == 0 else uuid.uuid4()
                    
                    RouteStop.objects.update_or_create(
                        id=stop_id,
                        defaults={
                            "route": ruta,
                            "pdv": pdv,
                            "stop_order": idx + 1,
                            "estimated_minutes": fila["tiempo"]
                        }
                    )
        
        self.stdout.write(self.style.SUCCESS(f'✅ Se importaron {len(excel_data)} clientes del Excel con sus Rutas.'))
        self.stdout.write(self.style.SUCCESS('✅ ¡Base de datos poblada exitosamente!'))
