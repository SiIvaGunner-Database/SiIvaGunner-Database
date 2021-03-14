from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils.text import slugify
from .models import Rip
from . import forms

def ripList(request):
    if request.method == 'POST':
        searchTerms = request.POST['searchTerms']
        sort = request.POST['sort']
        sortType = request.POST['sortType']
        filter = request.POST['filter']
        maxResults = int(request.POST['maxResults'])
        if filter == 'Unfiltered':
            if searchTerms:
                ripsByTitle = Rip.objects.filter(visible=True, title__icontains=searchTerms).order_by(sortType + sort)[:maxResults]
                ripsById = Rip.objects.filter(visible=True, videoId__icontains=searchTerms).order_by(sortType + sort)[:maxResults]
                ripsByChannel = Rip.objects.filter(visible=True, channel__name__icontains=searchTerms).order_by(sortType + sort)[:maxResults]
                rips = ripsByTitle | ripsById | ripsByChannel
            else:
                rips = Rip.objects.filter(visible=True).order_by(sortType + sort)[:maxResults]
        elif filter == 'Undocumented' or filter == 'Documented':
            if searchTerms:
                ripsByTitle = Rip.objects.filter(visible=True, title__icontains=searchTerms, wikiStatus=filter).order_by(sortType + sort)[:maxResults]
                ripsById = Rip.objects.filter(visible=True, videoId__icontains=searchTerms, wikiStatus=filter).order_by(sortType + sort)[:maxResults]
                ripsByChannel = Rip.objects.filter(visible=True, channel__name__icontains=searchTerms, wikiStatus=filter).order_by(sortType + sort)[:maxResults]
                rips = ripsByTitle | ripsById | ripsByChannel
            else:
                rips = Rip.objects.filter(visible=True, wikiStatus=filter).order_by(sortType + sort)[:maxResults]
        else:
            if searchTerms:
                ripsByTitle = Rip.objects.filter(visible=True, title__icontains=searchTerms, videoStatus=filter).order_by(sortType + sort)[:maxResults]
                ripsById = Rip.objects.filter(visible=True, videoId__icontains=searchTerms, videoStatus=filter).order_by(sortType + sort)[:maxResults]
                ripsByChannel = Rip.objects.filter(visible=True, channel__name__icontains=searchTerms, videoStatus=filter).order_by(sortType + sort)[:maxResults]
                rips = ripsByTitle | ripsById | ripsByChannel
            else:
                rips = Rip.objects.filter(visible=True, videoStatus=filter).order_by(sortType + sort)[:maxResults]
        return render(request, 'rips/ripList.html', { 'rips':rips })
    rips = Rip.objects.filter(visible=True).order_by('-uploadDate')[:100]
    return render(request, 'rips/ripList.html', { 'rips':rips })

def ripDetails(request, ripSlug):
    rip = Rip.objects.get(slug=ripSlug)
    return render(request, 'rips/ripDetails.html', { 'rip':rip })

def ripAdd(request):
    if request.method == 'POST':
        form = forms.AddRip(request.POST, request.FILES)
        if form.is_valid():
            instance = form.save(commit=False)
            if instance.videoId == '' or Rip.objects.filter(slug=instance.videoId).count() > 0:
                instance.slug = 'CHANGE-ME-' + instance.videoId
            else:
                instance.slug = instance.videoId
            if request.user.is_authenticated:
                instance.author = request.user
            instance.save()
            return redirect('rips:list')
    else:
        form = forms.AddRip()
    return render(request, 'rips/ripAdd.html', { 'form':form })
