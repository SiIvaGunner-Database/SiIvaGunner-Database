from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signupView, name='signup'),
    path('login/', views.loginView, name='login'),
    path('logout/', views.logoutView, name='logout'),
    path('myaccount/', views.myAccountView, name='myAccount'),
    path('<str:listType>/<str:objectType>/<slug:id>/add/', views.addListItemView, name='addListItem'),
    path('<str:listType>/<str:objectType>/<slug:id>/remove/', views.removeListItemView, name='removeListItem'),
]
