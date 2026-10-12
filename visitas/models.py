from django.db import models
from django.utils import timezone

class Visita(models.Model):
    nombre_completo = models.CharField(max_length=200, verbose_name="Nombre Completo")
    rut = models.CharField(max_length=12, verbose_name="RUT")
    motivo = models.TextField(verbose_name="Motivo de la visita")
    fecha_entrada = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Entrada")
    fecha_salida = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Salida")

    def __str__(self):
        return f"{self.nombre_completo} - {self.rut}"

    class Meta:
        verbose_name = "Visita"
        verbose_name_plural = "Visitas"
        ordering = ['-fecha_entrada']