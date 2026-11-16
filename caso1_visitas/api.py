from rest_framework import routers, viewsets
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.exceptions import APIException
from django.db.models.deletion import ProtectedError

from .models import Visita, Persona
from .serializers import VisitaSerializer, PersonaSerializer

class ReceptionPermissions(DjangoModelPermissions):
    perms_map = {
        **DjangoModelPermissions.perms_map,
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
    }


class RelatedVisitsConflict(APIException):
    status_code = 409
    default_detail = 'Esta persona tiene visitas asociadas. Elimina primero esas visitas si corresponde.'
    default_code = 'person_has_visits'


class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.order_by('apellido', 'nombre', 'rut')
    serializer_class = PersonaSerializer
    permission_classes = [ReceptionPermissions]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise RelatedVisitsConflict()

class VisitaViewSet(viewsets.ModelViewSet):
    queryset = Visita.objects.select_related('persona').order_by('-hora_entrada', '-pk')
    serializer_class = VisitaSerializer
    permission_classes = [ReceptionPermissions]

router = routers.DefaultRouter()
router.register(r'visitas', VisitaViewSet)
router.register(r'personas', PersonaViewSet)
