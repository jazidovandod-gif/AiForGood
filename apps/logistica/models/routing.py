from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
import uuid
from .locations import PDV

User = get_user_model()

class Route(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('partial', 'Partial'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    replenisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="routes")
    route_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_pdvs = models.SmallIntegerField(default=0)
    total_estimated_minutes = models.SmallIntegerField(default=0)
    total_distance_km = models.DecimalField(max_digits=8, decimal_places=3, default=0.0)
    total_real_minutes = models.SmallIntegerField(null=True, blank=True)
    total_real_distance_km = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "routes"
        unique_together = ('replenisher', 'route_date')

class RouteStop(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops")
    pdv = models.ForeignKey(PDV, on_delete=models.CASCADE)
    stop_order = models.SmallIntegerField()
    estimated_minutes = models.SmallIntegerField()
    distance_from_prev_km = models.DecimalField(max_digits=6, decimal_places=3, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    arrived_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    real_minutes = models.SmallIntegerField(null=True, blank=True)
    
    # El móvil reportará dónde llegó realmente
    arrival_location = models.PointField(srid=4326, geography=True, null=True, blank=True)
    distance_to_pdv_m = models.DecimalField(max_digits=8, decimal_places=1, null=True, blank=True)

    class Meta:
        db_table = "route_stops"
        unique_together = ('route', 'stop_order')

class Visit(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, null=True, blank=True, related_name="visits")
    pdv = models.ForeignKey(PDV, on_delete=models.CASCADE)
    replenisher = models.ForeignKey(User, on_delete=models.CASCADE)
    visit_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.SmallIntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "visits"
