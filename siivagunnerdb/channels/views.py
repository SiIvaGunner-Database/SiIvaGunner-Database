from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.utils.text import slugify
from rips.models import Rip
from django.urls import reverse
from urllib.parse import urlencode
from .models import Channel
from . import forms

def channelList(request):
    # If the search is being submitted
    if request.method == 'POST':
        parameters = []
        if request.POST['searchTerms']:
            queryString =  urlencode({'search': request.POST['searchTerms']})  # param=val
            parameters.append(queryString)
        if request.POST['sort'] != 'joinDate':
            queryString =  urlencode({'sort': request.POST['sort']})  # param=val
            parameters.append(queryString)
        if request.POST['sortType'] != 'descending':
            queryString =  urlencode({'order': request.POST['sortType']})  # param=val
            parameters.append(queryString)
        url = reverse('channels:list')  # /channels/
        paramChar = '?'
        for param in parameters:
            url = url + paramChar + param  # /channels/?param=val&param=val
            paramChar = '&'
        return redirect(url)

    # Else load the search parameters if they exist or query the defaults
    else:
        if request.GET.get('search'):
            search = request.GET.get('search')
        else:
            search = None
        if request.GET.get('sort'):
            sort = request.GET.get('sort')
        else:
            sort = "joinDate"
        if request.GET.get('order') and request.GET.get('order') == "ascending":
            order = ""
        else:
            order = "-"
        if search:
            channelsByName = Channel.objects.filter(visible=True, name__icontains=search)
            channelsById = Channel.objects.filter(visible=True, channelId__icontains=search)
            channels = (channelsByName | channelsById).order_by(order + sort)
        else:
            channels = Channel.objects.filter(visible=True).order_by(order + sort)
        return render(request, 'channels/channelList.html', {'channels': channels })

def channelDetails(request, channelSlug):
    channel = Channel.objects.get(slug=channelSlug)
    rips = Rip.objects.filter(visible=True, channel__slug=channelSlug).order_by('-uploadDate')[:10]
    return render(request, 'channels/channelDetails.html', {'channel': channel, 'rips':rips })

def channelAdd(request):
    if request.method == 'POST':
        form = forms.AddChannel(request.POST, request.FILES)
        if form.is_valid():
            instance = form.save(commit=False)
            if instance.channelId == '' or Channel.objects.filter(slug=instance.channelId).count() > 0:
                instance.slug = 'CHANGE-ME-' + instance.channelId
            else:
                instance.slug = instance.channelId
            if request.user.is_authenticated:
                instance.author = request.user
            instance.save()
            return redirect('channels:list')
    else:
        form = forms.AddChannel()
    return render(request, 'channels/channelAdd.html', { 'form':form })
