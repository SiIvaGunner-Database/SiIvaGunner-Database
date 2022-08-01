from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('add/', views.reportAdd, name="add"),
]
