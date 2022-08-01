from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include

from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from . import views
from siivagunnerdb.administration.accounts import views as accountViews
from siivagunnerdb.administration.reports import views as reportViews
from siivagunnerdb.youtube.channels import views as channelViews
from siivagunnerdb.youtube.rips import views as ripViews

router = routers.DefaultRouter()
router.register(r'users', accountViews.UserViewSet)
router.register(r'groups', accountViews.GroupViewSet)
router.register(r'channels', channelViews.ChannelViewSet)
router.register(r'reports', reportViews.ReportViewSet)
router.register(r'rips', ripViews.RipViewSet)

urlpatterns = [
    path('accounts/', include('siivagunnerdb.administration.accounts.urls')),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('channels/', include('siivagunnerdb.youtube.channels.urls')),
    path('generate/', views.generate, name='generate'),
    path('token/', views.token, name='token'),
    path('reports/', include('siivagunnerdb.administration.reports.urls')),
    path('rips/', include('siivagunnerdb.youtube.rips.urls')),
    path('', ripViews.ripList, name='home'),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
