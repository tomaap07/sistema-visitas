from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Conectamos las urls de nuestra app a la raíz del sitio
    path('', include('visitas.urls')), 
]