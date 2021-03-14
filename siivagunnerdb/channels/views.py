from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.text import slugify
from rips.models import Rip
from .models import Channel
from . import forms

def channelList(request):
    if request.method == 'POST':
        searchTerms = request.POST['searchTerms']
        sort = request.POST['sort']
        sortType = request.POST['sortType']
        channelsByTitle = Channel.objects.filter(visible=True, name__icontains=searchTerms).order_by(sortType + sort)
        channelsById = Channel.objects.filter(visible=True, channelId__icontains=searchTerms).order_by(sortType + sort)
        channels = channelsByTitle | channelsById
        return render(request, 'channels/channelList.html', { 'channels':channels })
    channels = Channel.objects.filter(visible=True).order_by('-joinDate')
    return render(request, 'channels/channelList.html', {'channels': channels })

def channelDetails(request, channelSlug):
    channel = Channel.objects.get(slug=channelSlug)
    rips = Rip.objects.filter(visible=True, channel__slug=channelSlug).order_by('-uploadDate')[:100]
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
