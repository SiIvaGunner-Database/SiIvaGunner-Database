from django.urls import path
from . import views

app_name = 'videos'

urlpatterns = [
    path('', views.videoList, name='list'),
    # path('add/', views.videoAdd, name='add'),
    path('<slug:id>/', views.videoDetails, name='details'),
]
