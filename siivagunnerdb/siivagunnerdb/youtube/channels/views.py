from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from siivagunnerdb.views import MultipleModelViewSet
from urllib.parse import urlencode

from siivagunnerdb.youtube.videos.models import Video
from .models import Channel
from .serializers import ChannelSerializer


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

        if request.POST['sort'] != 'publishedAt':
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
            sortOptions = ['publishedAt', 'title']

            if sort not in sortOptions:
                sort = 'publishedAt'
        else:
            sort = 'publishedAt'

        if request.GET.get('order') and request.GET.get('order') == 'ascending':
            order = 'ascending'
        else:
            order = 'descending'

        # Query the search using any given filters or sorting

        if search:
            channelsByTitle = Channel.objects.filter(visible=True, title__icontains=search)
            channelsById = Channel.objects.filter(visible=True, id__icontains=search)
            channels = (channelsByTitle | channelsById)
        else:
            channels = Channel.objects.filter(visible=True)

        if order == 'descending':
            if sort != 'title':
                channels = channels.order_by('-' + sort)
            else:
                channels = channels.order_by(Lower(sort).desc())
        else:
            if sort != 'title':
                channels = channels.order_by(sort)
            else:
                channels = channels.order_by(Lower(sort))

        # Format the join dates
        for channel in channels:
            if channel.publishedAt:
                channel.publishedAt = channel.publishedAt.strftime('%Y-%m-%d   %H:%M:%S')

        # Return the page with the searched channels
        return render(request, 'channels/channelList.html', {'channels':channels })


def channelDetails(request, id):
    """
    The channel details page.
    """
    channel = Channel.objects.get(id=id)
    videos = Video.objects.filter(visible=True, channel__id=id)
    videoCount = videos.count()
    videos = videos.order_by('-publishedAt')[:10]

    for video in videos:
        if video.publishedAt:
            video.publishedAt = video.publishedAt.strftime('%Y-%m-%d   %H:%M:%S')

    return render(request, 'channels/channelDetails.html', {'channel':channel, 'videos':videos, 'videoCount':videoCount})


class ChannelViewSet(MultipleModelViewSet):
    """
    API endpoint that allows channels to be viewed or edited.
    """
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
