from . import views
from django.urls import path

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signupView, name="signup"),
    path('login/', views.loginView, name="login"),
    path('logout/', views.logoutView, name="logout"),
    path('myaccount/', views.myAccountView, name="myAccount"),
]
