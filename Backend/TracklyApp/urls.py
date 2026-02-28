from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API документація
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Редірект з кореневого / на Swagger
    path("", RedirectView.as_view(url="/api/docs/swagger/", permanent=False)),

    # API ендпоінтів
    path('api/', include('TracklyApp.apps.habits.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/users/', include("TracklyApp.apps.users.urls")),

    # Google OAuth
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
