from django.urls import path
from . import views

app_name = 'channels'

urlpatterns = [
    path('', views.channelList, name="list"),
    # path('add/', views.channelAdd, name="add"),
    path('<slug:channelSlug>/', views.channelDetails, name="details"),
]
