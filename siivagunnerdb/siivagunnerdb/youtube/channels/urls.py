from django.urls import path
from . import views

app_name = 'channels'

urlpatterns = [
    path('', views.channelList, name='list'),
    path('<slug:id>/', views.channelDetails, name='details'),
]
