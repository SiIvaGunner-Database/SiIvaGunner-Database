from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from rest_framework import viewsets
from urllib.parse import urlencode

from . import forms
from .models import Channel
from .serializers import ChannelSerializer
from rips.models import Rip

def channelList(request):
    """
    The channel search page.
    """
    # If the search is being submitted
    if request.method == 'POST':
        parameters = []

        # Check for search parameters

        if request.POST['searchTerms']:
            queryString =  urlencode({'search': request.POST['searchTerms'].strip()})  # param=val
            parameters.append(queryString)

        if request.POST['sort'] != 'joinDate':
            queryString =  urlencode({'sort': request.POST['sort']})  # param=val
            parameters.append(queryString)

        if request.POST['sortType'] != 'descending':
            queryString =  urlencode({'order': request.POST['sortType']})  # param=val
            parameters.append(queryString)

        # Format the parameters in the URL

        url = reverse('channels:list')  # /channels/
        paramChar = '?'

        for param in parameters:
            url = url + paramChar + param  # /channels/?param=val&param=val
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
            sortOptions = ["joinDate", "name"]

            if sort not in sortOptions:
                sort = "joinDate"
        else:
            sort = "joinDate"

        if request.GET.get('order') and request.GET.get('order') == "ascending":
            order = "ascending"
        else:
            order = "descending"

        # Query the search using any given filters or sorting

        if search:
            channelsByName = Channel.objects.filter(visible=True, name__icontains=search)
            channelsById = Channel.objects.filter(visible=True, id__icontains=search)
            channels = (channelsByName | channelsById)
        else:
            channels = Channel.objects.filter(visible=True)

        if order == "descending":
            if sort != "name":
                channels = channels.order_by('-' + sort)
            else:
                channels = channels.order_by(Lower(sort).desc())
        else:
            if sort != "name":
                channels = channels.order_by(sort)
            else:
                channels = channels.order_by(Lower(sort))

        # Format the join dates
        for channel in channels:
            channel.joinDate = channel.joinDate.strftime("%Y-%m-%d   %H:%M:%S")

        # Return the page with the searched channels
        return render(request, 'channels/channelList.html', {'channels':channels })

def channelDetails(request, id):
    """
    The channel details page.
    """
    channel = Channel.objects.get(id=id)
    rips = Rip.objects.filter(visible=True, channel__id=id)
    ripCount = rips.count()
    rips = rips.order_by('-uploadDate')[:10]

    for rip in rips:
        rip.uploadDate = rip.uploadDate.strftime("%Y-%m-%d   %H:%M:%S")

    return render(request, 'channels/channelDetails.html', {'channel':channel, 'rips':rips, 'ripCount':ripCount})

def channelAdd(request):
    """
    The channel submission page.
    """
    if request.method == 'POST':
        form = forms.AddChannel(request.POST, request.FILES)

        if form.is_valid():
            instance = form.save(commit=False)
            instance.id = 'ID-' + instance.id

            if request.user.is_authenticated:
                instance.author = request.user

            instance.save()
            return redirect('channels:list')
    else:
        form = forms.AddChannel()

    return render(request, 'channels/channelAdd.html', { 'form':form })

class ChannelViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows channels to be viewed or edited.
    """
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
