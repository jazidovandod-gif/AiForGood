from django.db import models
from .routing import Visit

class FormularioDinamico(models.Model):
    """
    Soporta los campos mutables y elásticos inyectados por los mentores en el hackathon.
    Aprovecha la potencia de JSONB de PostgreSQL para absorber esquemas no estructurados.
    """
    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        related_name="formularios_dinamicos",
        null=True, blank=True
    )
    tipo_formulario = models.CharField(
        max_length=100,
        help_text="Contexto de llenado, Ej: 'Fiebre_Precios', 'Stock_Out', 'Quiebre_Gondola'",
    )
    
    # 💥 CAMPO MUTABLE PRINCIPAL (JSONB Nativo PostgreSQL) 💥
    datos_extra = models.JSONField(
        default=dict,
        help_text="Absorbe diccionarios/listas de tamaño ilimitado sin necesidad de alterar el modelo SQL",
    )
    
    # Soporte multimedia robusto (Multipart/Form-Data) para evidencias
    foto_evidencia = models.ImageField(
        upload_to="evidencias/%Y/%m/%d/",
        null=True,
        blank=True,
    )
    
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "logistica_formulario_dinamico"
