from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api import router


def api_home(request):
    accept = request.headers.get("Accept", "")
    if "text/html" in accept or not accept:
        return render(request, "api/index.html")
    return router.get_api_root_view()(request)


def api_auth(request):
    return render(request, "api/auth.html")


@csrf_exempt
def token_obtain(request):
    if request.method == "POST":
        return TokenObtainPairView.as_view()(request)
    return render(request, "api/token.html")


@csrf_exempt
def token_refresh(request):
    if request.method == "POST":
        return TokenRefreshView.as_view()(request)
    return render(request, "api/token_refresh.html")
