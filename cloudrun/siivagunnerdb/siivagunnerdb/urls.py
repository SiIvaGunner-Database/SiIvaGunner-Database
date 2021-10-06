from . import views
from django.urls import path, include
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static
from channels import views as channelViews
from reports import views as reportViews
from rips import views as ripViews

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('channels/', include('channels.urls')),
    path('reports/', include('reports.urls')),
    path('rips/', include('rips.urls')),
    path('generate/', views.generate, name="generate"),
    path('', ripViews.ripList, name="home"),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
