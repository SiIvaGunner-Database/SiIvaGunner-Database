import json

from datetime import datetime

from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from siivagunnerdb.views import MultipleModelViewSet
from siivagunnerdb.youtube.videos.models import Video
from siivagunnerdb import search

from .models import Channel
from .serializers import ChannelSerializer


def channelList(request):
    """
    The channel search page.
    """
    # If the search is being submitted
    if request.method == 'POST':
        parameterNames = ['search', 'sort', 'order', 'channelType', 'minimumSubscribers',]
         # "/channels/" + "?param=val&param=val"
        url = reverse('channels:list') + search.convertFormParamsToQueryParams(request, parameterNames)
        return redirect(url)

    # Else the search is being loaded
    else:
        startTime = datetime.utcnow()

        # Get the search parameters
        searchTerms = request.GET.get('search')
        sort = request.GET.get('sort')
        order = request.GET.get('order')
        channelType = request.GET.get('channelType')
        minimumSubscribers = request.GET.get('minimumSubscribers')
        currentPage = request.GET.get('page')

        # Set applicable default parameter values
        sortOptions = ['publishedAt', 'title', 'subscriberCount',]
        if sort is None or sort not in sortOptions:
            sort = 'publishedAt'
        if currentPage:
            currentPage = int(currentPage)
        else:
            currentPage = 1
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search paramater execution time in seconds: ' + str(executionTime))

        # Query the search using any given filters or sorting
        channels = Channel.objects.filter(visible=True)
        if searchTerms:
            channelsByTitle = channels.filter(title__icontains=searchTerms)
            channelsById = channels.filter(id__icontains=searchTerms)
            channels = (channelsByTitle | channelsById)
        if channelType == 'original':
            channels = channels.filter(channelType='Original')
        elif channelType != 'all':
            channels = channels.exclude(channelType='Influenced')
        if minimumSubscribers:
            channels = channels.filter(subscriberCount__gte=minimumSubscribers)
        if order == 'ascending':
            if sort != 'title':
                channels = channels.order_by(sort)
            else:
                channels = channels.order_by(Lower(sort))
        else:
            if sort != 'title':
                channels = channels.order_by('-' + sort)
            else:
                channels = channels.order_by(Lower(sort).desc())
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search filter execution time in seconds: ' + str(executionTime))

        # Determine the search page numbers
        resultCount = channels.count()
        pageNumbers = search.getPageNumbers(resultCount, currentPage)
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search pagination numbers execution time in seconds: ' + str(executionTime))

        # Use only the channels for the current page
        if resultCount > 0:
            channels = channels[currentPage * 50 - 50:currentPage * 50]
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search pagination data split execution time in seconds: ' + str(executionTime))

        # Format the join dates
        for channel in channels:
            if channel.publishedAt:
                channel.publishedAt = channel.publishedAt.strftime('%Y-%m-%d %H:%M:%S')
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search date formatting execution time in seconds: ' + str(executionTime))

        # Return the page with the searched channels
        context = {
            'channels': channels,
            'searchUrl': search.getPathWithoutPageParameter(request),
            'resultCount': resultCount,
            'currentPage': currentPage,
            'pageNumbers': pageNumbers,
        }
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Channel search execution time in seconds: ' + str(executionTime))
        return render(request, 'channels/channelList.html', context)


def channelDetails(request, id):
    """
    The channel details page.
    """
    channel = Channel.objects.get(visible=True, id=id)
    videos = Video.objects.filter(visible=True, channel__id=id)
    videoCount = videos.count()
    videos = videos.order_by('-publishedAt')[:10]
    thumbnail = ""

    if channel.thumbnails and channel.thumbnails != "":
        thumbnail = json.loads(channel.thumbnails)["high"]["url"]

    if channel.publishedAt:
        channel.publishedAt = channel.publishedAt.strftime('%Y-%m-%d %H:%M:%S')

    for video in videos:
        if video.publishedAt:
            video.publishedAt = video.publishedAt.strftime('%Y-%m-%d %H:%M:%S')

    context = {
        'channel': channel,
        'videos': videos,
        'videoCount': videoCount,
        'thumbnail': thumbnail
    }
    return render(request, 'channels/channelDetails.html', context)


class ChannelViewSet(MultipleModelViewSet):
    """
    API endpoint that allows channels to be viewed or edited.
    """
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
