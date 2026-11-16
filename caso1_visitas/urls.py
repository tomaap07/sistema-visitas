from django.urls import path
from . import views

urlpatterns = [
    path('visitas/', views.visita_list, name='visita_list'),
    path('visitas/nuevo/', views.visita_create, name='visita_create'),
    path('visitas/<int:pk>/', views.visita_detail, name='visita_detail'),
    path('visitas/<int:pk>/editar/', views.visita_update, name='visita_update'),
    path('visitas/<int:pk>/eliminar/', views.visita_delete, name='visita_delete')

]
