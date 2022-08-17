from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include

from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from . import views
from siivagunnerdb.administration.reports.views import ReportViewSet
from siivagunnerdb.administration.logs.views import LogViewSet
from siivagunnerdb.community.collectives.views import CollectiveViewSet
from siivagunnerdb.community.contributors.views import ContributorViewSet
from siivagunnerdb.youtube.channels.views import ChannelViewSet
from siivagunnerdb.youtube.playlists.views import PlaylistViewSet
from siivagunnerdb.youtube.rips.views import RipViewSet, ripList
from siivagunnerdb.youtube.videos.views import VideoViewSet

router = routers.DefaultRouter()
router.register(r'channels', ChannelViewSet)
router.register(r'collectives', CollectiveViewSet)
router.register(r'contributors', ContributorViewSet)
router.register(r'logs', LogViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'rips', RipViewSet)
router.register(r'videos', VideoViewSet)

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
    path('', ripList, name='home'),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
