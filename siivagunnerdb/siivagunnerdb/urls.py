from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include
from django.views.generic.base import TemplateView

from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token

from siivagunnerdb.administration.logs.views import LogViewSet, AlertViewSet
from siivagunnerdb.community.collectives.views import CollectiveViewSet
from siivagunnerdb.community.contributors.views import ContributorViewSet
from siivagunnerdb.drive.forms.views import FormViewSet
from siivagunnerdb.drive.scripts.views import ScriptViewSet
from siivagunnerdb.drive.sheets.views import SpreadsheetViewSet, SheetViewSet
from siivagunnerdb.youtube.channels.views import ChannelViewSet
from siivagunnerdb.youtube.playlists.views import PlaylistViewSet
from siivagunnerdb.youtube.videos.views import VideoViewSet

from . import views

router = routers.DefaultRouter()
router.register(r'alerts', AlertViewSet)
router.register(r'channels', ChannelViewSet)
router.register(r'collectives', CollectiveViewSet)
router.register(r'contributors', ContributorViewSet)
router.register(r'forms', FormViewSet)
router.register(r'logs', LogViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'scripts', ScriptViewSet)
router.register(r'spreadsheets', SpreadsheetViewSet)
router.register(r'sheets', SheetViewSet)
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
    path('reports/', views.reports, name='reports'),
    path('rips/', include('siivagunnerdb.youtube.videos.urls')),
    path('videos/', include('siivagunnerdb.youtube.videos.urls')),
    path('robots.txt', TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    path('', views.index, name='home'),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
