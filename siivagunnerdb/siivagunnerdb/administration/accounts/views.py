from django.contrib import messages
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.contrib.auth.models import User
from django.http import Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video

from .forms import UsernameChangeForm
from .models import BlacklistItem, Favorite


def signupView(request):
    """
    The signup page.
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            rawPassword = form.cleaned_data['password1']
            user = authenticate(username=username, password=rawPassword)
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()

    context = {
        'title': 'Sign Up',
        'form': form,
    }
    return render(request, 'accounts/signup.html', context)


def loginView(request):
    """
    The login page.
    """
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)

            nextUrl = request.POST.get('next')

            # Only follow the next URL if it points to this site
            if nextUrl and url_has_allowed_host_and_scheme(nextUrl, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
                return redirect(nextUrl)
            else:
                return redirect('home')
    else:
        form = AuthenticationForm()

    context = {
        'title': 'Log In',
        'form': form,
    }
    return render(request, 'accounts/login.html', context)


def logoutView(request):
    """
    The logout redirect.
    """
    if request.method == 'POST':
        logout(request)
        return redirect('home')


@login_required()
def myAccountView(request):
    """
    The account page.
    """
    if request.method == 'POST':
        if 'saveUsername' in request.POST:
            form = UsernameChangeForm(request.POST)

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

    context = {
        'title': 'Account',
        'usernameForm': UsernameChangeForm(),
        'passwordForm': PasswordChangeForm(request.user),
        'favoriteChannels': Favorite.objects.filter(user=request.user, channel__visible=True).select_related('channel').order_by('-addDate'),
        'favoriteVideos': Favorite.objects.filter(user=request.user, video__visible=True, video__channel__visible=True).select_related('video').order_by('-addDate'),
        'blacklistChannels': BlacklistItem.objects.filter(user=request.user, channel__visible=True).select_related('channel').order_by('-addDate'),
        'blacklistVideos': BlacklistItem.objects.filter(user=request.user, video__visible=True, video__channel__visible=True).select_related('video').order_by('-addDate'),
    }
    return render(request, 'accounts/myAccount.html', context)


LIST_MODELS = {
    'favorites': Favorite,
    'blacklist': BlacklistItem,
}


def getListItemTarget(listType, objectType, id):
    """
    Return the list model, the item field name, the target object, and its details page URL name.
    """
    model = LIST_MODELS.get(listType)
    if model is None:
        raise Http404()
    if objectType == 'video':
        return model, 'video', get_object_or_404(Video, visible=True, channel__visible=True, id=id), 'videos:details'
    elif objectType == 'channel':
        return model, 'channel', get_object_or_404(Channel, visible=True, id=id), 'channels:details'
    raise Http404()


@require_POST
@login_required()
def addListItemView(request, listType, objectType, id):
    """
    The add favorite / blacklist item redirect.
    """
    model, field, target, detailsUrlName = getListItemTarget(listType, objectType, id)
    model.objects.get_or_create(user=request.user, **{field: target})
    return redirect(detailsUrlName, id)


@require_POST
@login_required()
def removeListItemView(request, listType, objectType, id):
    """
    The remove favorite / blacklist item redirect.
    """
    model, field, target, detailsUrlName = getListItemTarget(listType, objectType, id)
    model.objects.filter(user=request.user, **{field: target}).delete()
    return redirect(detailsUrlName, id)
