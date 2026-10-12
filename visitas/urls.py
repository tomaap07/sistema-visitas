from django.urls import path
from . import views

urlpatterns = [
    path('', views.VisitaListView.as_view(), name='visita_list'),
    path('nueva/', views.VisitaCreateView.as_view(), name='visita_create'),
    path('editar/<int:pk>/', views.VisitaUpdateView.as_view(), name='visita_update'),
    path('eliminar/<int:pk>/', views.VisitaDeleteView.as_view(), name='visita_delete'),
]