"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

from caso1_visitas.api import router
from caso1_visitas.api_views import api_auth, api_home, token_obtain, token_refresh, current_user


urlpatterns = [
    path('', RedirectView.as_view(pattern_name='visita_list', permanent=False)),
    path('admin/', admin.site.urls),
    path('cliente/', RedirectView.as_view(url='/static/cliente/index.html', permanent=False), name='cliente_web'),
    path('', include('caso1_visitas.urls')),
    path("api/auth/", api_auth, name="api_auth"),
    path("api/auth/", include("rest_framework.urls")),

    path("api/", api_home, name="api_home"),
    path("api/me/", current_user, name="api_current_user"),
    path("api/", include(router.urls)), 

    path("api/token/", token_obtain, name="token_obtain_pair"),
    path("api/token/refresh/", token_refresh, name="token_refresh"),
]
