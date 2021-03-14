from . import views
from django.urls import path

app_name = 'channels'

urlpatterns = [
    path('', views.channelList, name="list"),
    path('add/', views.channelAdd, name="add"),
    path('<slug:channelSlug>/', views.channelDetails, name="details"),
]
