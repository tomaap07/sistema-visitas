from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('visitas.urls')),
]

# Forzamos a Django a servir los estáticos en producción a través de la vista 'serve'
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]

# (Mantenemos esta línea por si acaso para localhost)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)