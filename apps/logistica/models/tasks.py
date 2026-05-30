from django.db import models
from django.contrib.auth import get_user_model
import uuid
from .locations import PDV
from .routing import Visit

User = get_user_model()

class RestockRequest(models.Model):
    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('fulfilled', 'Fulfilled'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, null=True, blank=True)
    pdv = models.ForeignKey(PDV, on_delete=models.CASCADE)
    replenisher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="restock_requests")
    product_name = models.CharField(max_length=120)
    quantity_requested = models.SmallIntegerField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)
    photo_url = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_restocks")
    supervisor_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "restock_requests"

class ProductIssue(models.Model):
    REASON_CHOICES = (
        ('expired', 'Expired'),
        ('damaged', 'Damaged'),
        ('other', 'Other'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, null=True, blank=True)
    pdv = models.ForeignKey(PDV, on_delete=models.CASCADE)
    replenisher = models.ForeignKey(User, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=120)
    quantity = models.SmallIntegerField()
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    notes = models.TextField(null=True, blank=True)
    photo_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_issues"
