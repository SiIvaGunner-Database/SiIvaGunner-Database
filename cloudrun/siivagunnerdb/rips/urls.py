from django.urls import path
from . import views

app_name = 'rips'

urlpatterns = [
    path('', views.ripList, name="list"),
    # path('add/', views.ripAdd, name="add"),
    path('<slug:ripSlug>/', views.ripDetails, name="details"),
]
