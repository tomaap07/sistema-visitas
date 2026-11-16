"""Small, permission-aware summary for the administration landing page."""
from django.db.models import Count, Q
from django.urls import reverse
from django.utils import timezone

from .models import Persona, Visita


def resumen_admin(request):
    if request.path != reverse('admin:index') or not request.user.is_authenticated or not request.user.is_staff:
        return {}

    summary = {}
    if request.user.has_perm('caso1_visitas.view_visita') or request.user.has_perm('caso1_visitas.change_visita'):
        summary['visitas'] = Visita.objects.aggregate(
            total=Count('pk'),
            hoy=Count('pk', filter=Q(fecha=timezone.localdate())),
            activas=Count('pk', filter=Q(hora_salida__isnull=True)),
            finalizadas=Count('pk', filter=Q(hora_salida__isnull=False)),
        )
        summary['recientes'] = list(
            Visita.objects.select_related('persona').order_by('-hora_entrada')[:5]
        )
    if request.user.has_perm('caso1_visitas.view_persona') or request.user.has_perm('caso1_visitas.change_persona'):
        summary['personas'] = Persona.objects.count()
    return {'resumen_admin': summary}
