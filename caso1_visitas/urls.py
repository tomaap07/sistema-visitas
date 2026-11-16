from django.urls import path
from . import views

from .models import Visita, Persona
from rest_framework import routers, serializers, viewsets

class VisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visita
        fields = '__all__'

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = '__all__'

class VisitaViewSet(viewsets.ModelViewSet):
    queryset = Visita.objects.all()
    serializer_class = VisitaSerializer

class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer

router = routers.DefaultRouter()
router.register(r'visitas', VisitaViewSet)
router.register(r'personas', PersonaViewSet)

urlpatterns = [
    path('visitas/', views.visita_list, name='visita_list'),
    path('visitas/nuevo/', views.visita_create, name='visita_create'),
    path('visitas/<int:pk>/', views.visita_detail, name='visita_detail'),
    path('visitas/<int:pk>/editar/', views.visita_update, name='visita_update'),
    path('visitas/<int:pk>/eliminar/', views.visita_delete, name='visita_delete')

]
