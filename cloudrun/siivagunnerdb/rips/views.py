from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.utils.text import slugify
from django.urls import reverse
from urllib.parse import urlencode
from .models import Rip
from . import forms
import math
import re



# The rip search page
def ripList(request):
    # If the search is being submitted
    if request.method == 'POST':
        parameters = []

        # Check for search parameters

        if request.POST['searchTerms']:
            queryString =  urlencode({'search': request.POST['searchTerms'].strip()})  # param=val
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

        if request.POST['channel']:
            queryString =  urlencode({'channel': request.POST['channel']})  # param=val
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

        urlParameters = []

        if request.GET.get('search'):
            search = request.GET.get('search')
            urlParameters.append('search=' + search)
        else:
            search = None

        if request.GET.get('sort'):
            sort = request.GET.get('sort')
            urlParameters.append('sort=' + sort)
            sortOptions = ["date", "title", "views"]

            if sort not in sortOptions:
                sort = "uploadDate"

            if sort == "views":
                sort = "viewCount"
        else:
            sort = "uploadDate"

        if request.GET.get('order') and request.GET.get('order') == "ascending":
            order = "ascending"
            urlParameters.append('order=' + order)
        else:
            order = "descending"

        if request.GET.get('filter'):
            filter = request.GET.get('filter')
            urlParameters.append('filter=' + filter)
            filterOptions = ["unfiltered", "documented", "undocumented", "public", "unlisted", "private", "deleted", "unavailable"]

            if filter not in filterOptions:
                filter = None
        else:
            filter = None

        if request.GET.get('channel'):
            channelId = request.GET.get('channel')
            urlParameters.append('channel=' + channelId)
        else:
            channelId = None

        try:
            currentPage = int(request.GET.get('page'))

            if currentPage < 1:
                currentPage = 1
        except:
            currentPage = 1

        # Query the search using any given filters or sorting

        if search:
            ripsByTitle = Rip.objects.filter(visible=True, title__icontains=search)
            ripsByChannel = Rip.objects.filter(visible=True, channel__name__icontains=search)
            ripsById = Rip.objects.filter(visible=True, videoId__icontains=search)
            rips = (ripsByTitle | ripsById | ripsByChannel)
        else:
            rips = Rip.objects.filter(visible=True)

        if channelId:
            rips = rips & Rip.objects.filter(visible=True, channel__channelId=channelId)

        if order == "descending":
            if sort != "title":
                rips = rips.order_by('-' + sort)
            else:
                rips = rips.order_by(Lower(sort).desc())
        else:
            if sort != "title":
                rips = rips.order_by(sort)
            else:
                rips = rips.order_by(Lower(sort))

        if filter:
            filter = filter.capitalize()

            if filter == 'Undocumented' or filter == 'Documented':
                rips = rips.filter(wikiStatus=filter)
            else:
                rips = rips.filter(videoStatus=filter)

        # Build the url

        url = request.get_full_path()
        url = re.sub('\?.*', '?', url, flags=re.DOTALL)

        try:
            url.index('?')
            pageStr = '&page='
            for parameter in urlParameters:
                url += parameter + '&'
        except:
            url += '?'

        url += 'page='

        # Determine the search page numbers

        resultCount = rips.count()
        pageCounter = resultCount
        pageNumber = 0
        pageNumbers = []
        lastPage = math.ceil(resultCount / 100)

        if currentPage > lastPage:
            currentPage = lastPage

        while pageCounter >= 0:
            pageCounter -= 100
            pageNumber += 1

            if  (
                    pageNumber <= 3 or pageNumber >= lastPage - 2
                    or (pageNumber >= currentPage - 2 and pageNumber <= currentPage + 2)
                ):
                if pageNumber == currentPage:
                    pageNumbers.append('current')
                else:
                    pageNumbers.append(pageNumber)
            elif(
                    pageNumber == currentPage - 3 or pageNumber == currentPage + 3
                    or (pageNumber == 4 and currentPage == 1)
                    or (pageNumber == lastPage - 3 and currentPage == lastPage)
                ):
                pageNumbers.append('skip')

        # Use only the rips for the current page
        rips = rips[currentPage * 100 - 100:currentPage * 100]

        # Format the upload dates
        for rip in rips:
            rip.uploadDate = rip.uploadDate.strftime("%Y-%m-%d   %H:%M:%S")

        # Return the page with the searched rips
        return render(request, 'rips/ripList.html', {
                'rips':rips,
                'url':url,
                'resultCount':resultCount,
                'currentPage':currentPage,
                'pageNumbers':pageNumbers,
            }
        )



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
