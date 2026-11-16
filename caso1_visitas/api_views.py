from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .api import router


@api_view(['GET'])
def current_user(request):
    return Response({
        'username': request.user.get_username(),
        'permissions': {
            model: {action: request.user.has_perm(f'caso1_visitas.{action}_{model}')
                    for action in ('view', 'add', 'change', 'delete')}
            for model in ('persona', 'visita')
        },
    })


def api_home(request):
    accept = request.headers.get("Accept", "")
    if "text/html" in accept or not accept:
        return render(request, "api/index.html")
    return router.get_api_root_view()(request)


def api_auth(request):
    return render(request, "api/auth.html")


@csrf_exempt
@never_cache
def token_obtain(request):
    if request.method == "POST":
        return TokenObtainPairView.as_view()(request)
    return render(request, "api/token.html")


@csrf_exempt
@never_cache
def token_refresh(request):
    if request.method == "POST":
        return TokenRefreshView.as_view()(request)
    return render(request, "api/token_refresh.html")
