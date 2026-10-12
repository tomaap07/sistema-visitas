from django.contrib import admin
from django.utils import timezone
from .models import Visita

# --- BRANDING DE DJANGO ADMIN ---
admin.site.site_header = "Panel de Control - Sistema de Visitas"
admin.site.site_title = "Admin Visitas"
admin.site.index_title = "Gestión Administrativa de Visitas"

# --- ACCIÓN MASIVA ---
@admin.action(description="Marcar salida a las visitas seleccionadas")
def marcar_salida_masiva(modeladmin, request, queryset):
    # Actualiza la fecha de salida a la hora actual
    queryset.update(fecha_salida=timezone.now())
    modeladmin.message_user(request, "Las visitas seleccionadas han marcado su salida exitosamente.")

# --- REGISTRO DEL MODELO ---
@admin.register(Visita)
class VisitaAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'rut', 'fecha_entrada', 'fecha_salida')
    # Requisito: Filtros por fecha
    list_filter = ('fecha_entrada', 'fecha_salida')
    # Requisito: Búsqueda por RUT
    search_fields = ('rut', 'nombre_completo')
    # Registramos la acción masiva
    actions = [marcar_salida_masiva]