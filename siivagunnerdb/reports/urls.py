from . import views
from django.urls import path

app_name = 'reports'

urlpatterns = [
    path('add/', views.reportAdd, name="add"),
]
