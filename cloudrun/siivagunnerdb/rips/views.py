from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.utils.text import slugify
from django.urls import reverse
from urllib.parse import urlencode
from .models import Rip
from . import forms
import re



# The rip search page
def ripList(request):
    # If the search is being submitted
    if request.method == 'POST':
        parameters = []

        # Check for search parameters

        if request.POST['searchTerms']:
            queryString =  urlencode({'search': request.POST['searchTerms']})  # param=val
            parameters.append(queryString)

        if request.POST['sort'] != 'date':
            queryString =  urlencode({'sort': request.POST['sort']})  # param=val
            parameters.append(queryString)

        if request.POST['sortType'] != 'descending':
            queryString =  urlencode({'order': request.POST['sortType']})  # param=val
            parameters.append(queryString)

        if request.POST['filter'] != 'unfiltered':
            queryString =  urlencode({'filter': request.POST['filter']})  # param=val
            parameters.append(queryString)

        # Format the parameters in the URL

        url = reverse('rips:list')  # /rips/
        paramChar = '?'

        for param in parameters:
            url = url + paramChar + param  # /rips/?param=val&param=val
            paramChar = '&'

        return redirect(url)

    # Else the search is being loaded
    else:
        # Load the search parameters if they exist
        # Otherwise, load the defaults

        if request.GET.get('search'):
            search = request.GET.get('search')
        else:
            search = None

        if request.GET.get('sort'):
            sort = request.GET.get('sort')
            if sort == "views":
                sort = "viewCount"
        else:
            sort = "uploadDate"

        if request.GET.get('order') and request.GET.get('order') == "ascending":
            order = ""
        else:
            order = "-"

        if request.GET.get('filter'):
            filter = request.GET.get('filter')
        else:
            filter = None

        try:
            page = int(request.GET.get('page'))
            if page < 1:
                page = 1
        except:
            page = 1

        # If search terms were entered, the search merges multiple queries
        if search:
            ripsByTitle = Rip.objects.filter(visible=True, title__icontains=search)
            ripsByChannel = Rip.objects.filter(visible=True, channel__name__icontains=search)
            ripsById = Rip.objects.filter(visible=True, videoId__icontains=search)
            rips = (ripsByTitle | ripsById | ripsByChannel).order_by(order + sort)
        else:
            rips = Rip.objects.filter(visible=True).order_by(order + sort)

        # If a filter was given
        if filter:
            filter = filter.capitalize()

            if filter == 'Undocumented' or filter == 'Documented':
                rips = rips.filter(wikiStatus=filter)
            else:
                rips = rips.filter(videoStatus=filter)

        # Determine the next and previous page links

        ripCount = rips.count()
        rips = rips[page * 100 - 100:page * 100]
        url = request.get_full_path()
        url = re.sub('page=.*&', '', url, flags=re.DOTALL)
        url = re.sub('&page=.*', '', url, flags=re.DOTALL)

        try:
            url.index('?')
            pageStr = '&page='
        except:
            pageStr = '?page='

        prevUrl = url + pageStr + str(page - 1)
        nextUrl = url + pageStr + str(page + 1)
        urls = [prevUrl, nextUrl]

        # Return the page with the searched rips
        return render(request, 'rips/ripList.html', { 'rips':rips, 'urls':urls, } )



# The rip details page
def ripDetails(request, ripSlug):
    rip = Rip.objects.get(slug=ripSlug)
    return render(request, 'rips/ripDetails.html', { 'rip':rip })



# The rip submission page
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
