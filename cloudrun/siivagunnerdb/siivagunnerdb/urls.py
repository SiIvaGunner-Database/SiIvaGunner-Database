from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include

from rest_framework import routers

from . import views
from accounts import views as accountViews
from channels import views as channelViews
from reports import views as reportViews
from rips import views as ripViews

router = routers.DefaultRouter()
router.register(r'users', accountViews.UserViewSet)
router.register(r'groups', accountViews.GroupViewSet)
router.register(r'channels', channelViews.ChannelViewSet)
router.register(r'reports', reportViews.ReportViewSet)
router.register(r'rips', ripViews.RipViewSet)

urlpatterns = [
    path('accounts/', include('accounts.urls')),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('channels/', include('channels.urls')),
    path('generate/', views.generate, name="generate"),
    path('reports/', include('reports.urls')),
    path('rips/', include('rips.urls')),
    path('', ripViews.ripList, name="home"),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
