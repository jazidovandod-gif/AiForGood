from django.contrib.gis.db import models
import uuid

class Market(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80, unique=True)
    zone = models.CharField(max_length=80, null=True, blank=True)
    city = models.CharField(max_length=60, default='La Paz')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "markets"

    def __str__(self):
        return self.name

class ClientType(models.Model):
    CATEGORY_CHOICES = (
        ('MAYORISTA', 'MAYORISTA'),
        ('MINORISTA', 'MINORISTA'),
        ('DETALLISTA', 'DETALLISTA'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, unique=True)
    min_purchase_bs = models.IntegerField()
    avg_visit_minutes = models.SmallIntegerField()
    attention_profile = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "client_types"

    def __str__(self):
        return self.category

class PDV(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True)
    client_code = models.CharField(max_length=20)
    market = models.ForeignKey(Market, on_delete=models.CASCADE, related_name="pdvs")
    client_type = models.ForeignKey(ClientType, on_delete=models.CASCADE, related_name="pdvs")
    
    # Coordenadas geográficas puras
    location = models.PointField(srid=4326, geography=True)
    
    # Días de visita programados
    visit_mon = models.BooleanField(default=False)
    visit_tue = models.BooleanField(default=False)
    visit_wed = models.BooleanField(default=False)
    visit_thu = models.BooleanField(default=False)
    visit_fri = models.BooleanField(default=False)
    visit_sat = models.BooleanField(default=False)
    
    visit_minutes_estimated = models.SmallIntegerField(default=20)
    weekly_frequency = models.SmallIntegerField(default=1)
    monthly_frequency = models.SmallIntegerField(default=4)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pdvs"
        indexes = [
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.client_code}"
