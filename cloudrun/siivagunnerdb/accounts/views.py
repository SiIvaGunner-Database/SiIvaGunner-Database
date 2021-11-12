from django.contrib import messages
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.contrib.auth.models import User, Group
from django.shortcuts import render, redirect

from rest_framework import viewsets
from rest_framework import permissions

from . import forms
from .serializers import UserSerializer, GroupSerializer



# The signup page
def signupView(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            rawPassword = form.cleaned_data['password1']
            user = authenticate(username=username, password=rawPassword)
            login(request, user)
            return redirect('rips:list')
    else:
        form = UserCreationForm()

    return render(request, 'accounts/signup.html', { 'form':form })



# The login page
def loginView(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)

            if 'next' in request.POST:
                return redirect(request.POST.get('next'))
            else:
                return redirect('rips:list')
    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', { 'form':form })



# The logout redirect
def logoutView(request):
    if request.method == 'POST':
        logout(request)
        return redirect('rips:list')



# The account page
@login_required()
def myAccountView(request):
    if request.method == 'POST':
        if 'saveUsername' in request.POST:
            form = forms.ChangeUsername(request.POST)

            if form.is_valid():
                newusername = form.cleaned_data['username']
                username = request.user.username
                user = User.objects.get(username = username)
                user.username = newusername
                user.save()
                messages.success(request, 'Your username was successfully changed!')
                return redirect('accounts:myAccount')
            else:
                messages.error(request, 'An error occurred. The username you entered is either taken or contains invalid characters.')

        elif 'savePassword' in request.POST:
            form = PasswordChangeForm(request.user, request.POST)

            if form.is_valid():
                user = form.save()
                update_session_auth_hash(request, user)  # Important!
                messages.success(request, 'Your password was successfully changed!')
                return redirect('accounts:myAccount')
            else:
                messages.error(request, 'An error occurred. Please make sure the password fits the criteria.')

    usernameForm = forms.ChangeUsername()
    passwordForm = PasswordChangeForm(request.user)
    return render(request, 'accounts/myAccount.html', { 'usernameForm':usernameForm, 'passwordForm': passwordForm })



# The user API viewset
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]



# The group API viewset
class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
