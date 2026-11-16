from rest_framework import routers, viewsets

from .models import Visita, Persona
from .serializers import VisitaSerializer, PersonaSerializer

class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer

class VisitaViewSet(viewsets.ModelViewSet):
    queryset = Visita.objects.all()
    serializer_class = VisitaSerializer

router = routers.DefaultRouter()
router.register(r'visitas', VisitaViewSet)