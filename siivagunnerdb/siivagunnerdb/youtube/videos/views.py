import re

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from datetime import datetime
from siivagunnerdb.views import MultipleModelViewSet
from siivagunnerdb.search import convertFormParamsToQueryParams, getPageNumbers

from .models import Video
from .serializers import VideoSerializer


def videoList(request):
    """
    The video search page.
    """
    # If the search is being submitted
    if request.method == 'POST':
        parameterNames = [
            'searchTerms', 'sort', 'sortType', 'filter', 'channelType',
            'minimumSubscribers', 'channel',
        ]
         # "/videos/" + "?param=val&param=val"
        url = reverse('videos:list') + convertFormParamsToQueryParams(request, parameterNames)
        return redirect(url)

    # Else the search is being loaded
    else:
        startTime = datetime.utcnow()

        # Get the search parameters
        search = request.GET.get('search')
        sort = request.GET.get('sort')
        filter = request.GET.get('filter')
        order = request.GET.get('order')
        channelType = request.GET.get('channelType')
        minimumSubscribers = request.GET.get('minimumSubscribers')
        channelId = request.GET.get('channel')
        currentPage = request.GET.get('page')

        # Set applicable default parameter values
        sortOptions = ['date', 'title', 'views']
        if sort is None or sort not in sortOptions:
            sort = 'publishedAt'
        filterOptions = ['unfiltered', 'documented', 'undocumented', 'public', 'unlisted', 'private', 'deleted', 'unavailable']
        if filter is None not in filterOptions:
            filter = None
        if currentPage is not None:
            currentPage = int(currentPage)
        else:
            currentPage = 1

        # Query the search using any given filters or sorting
        # TODO: move logic to search.py
        if search:
            videosByTitle = Video.objects.filter(visible=True, title__icontains=search)
            videosByChannel = Video.objects.filter(visible=True, channel__title__icontains=search)
            videosById = Video.objects.filter(visible=True, id__icontains=search)
            videos = (videosByTitle | videosById | videosByChannel)
        else:
            videos = Video.objects.filter(visible=True)
        if channelId:
            videos = videos & Video.objects.filter(visible=True, channel__id=channelId)
        if order == 'descending':
            if sort != 'title':
                videos = videos.order_by('-' + sort)
            else:
                videos = videos.order_by(Lower(sort).desc())
        else:
            if sort != 'title':
                videos = videos.order_by(sort)
            else:
                videos = videos.order_by(Lower(sort))
        if filter:
            filter = filter.capitalize()
            if filter == 'Undocumented' or filter == 'Documented':
                videos = videos.filter(wikiStatus=filter)
            else:
                videos = videos.filter(videoStatus=filter)
        if channelType == 'original':
            videos = videos.filter(channel__channelType='Original')
        elif channelType != 'all':
            videos = videos.exclude(channel__channelType='Influenced')
        if minimumSubscribers:
            videos = videos.filter(channel__subscriberCount__gte=minimumSubscribers)

        # Determine the search page numbers
        resultCount = videos.count()
        pageNumbers = getPageNumbers(resultCount, currentPage)

        # Use only the videos for the current page
        if resultCount > 0:
            videos = videos[currentPage * 100 - 100:currentPage * 100]

        # Format the upload dates and put the first 50 IDs into an array
        first50Ids = []
        for video in videos:
            if len(first50Ids) < 50:
                first50Ids.append(video.id)
            if video.publishedAt:
                video.publishedAt = video.publishedAt.strftime('%Y-%m-%d %H:%M:%S')

        # TODO Remove page=0 from url
        searchUrl = request.get_full_path()

        # Return the page with the searched videos
        context = {
            'videos': videos,
            'first50Ids': ','.join(first50Ids),
            'searchUrl': searchUrl,
            'resultCount': resultCount,
            'currentPage': currentPage,
            'pageNumbers': pageNumbers,
        }
        endTime = datetime.utcnow()
        print('Search execution time: ' + str((endTime - startTime).total_seconds()) + ' milliseconds')
        return render(request, 'videos/videoList.html', context)


def videoDetails(request, id):
    """
    The video details page.
    """
    video = Video.objects.get(visible=True, channel__visible=True, id=id)

    if video.publishedAt:
        video.publishedAt = video.publishedAt.strftime('%Y-%m-%d %H:%M:%S')

    return render(request, 'videos/videoDetails.html', { 'video':video })


class VideoViewSet(MultipleModelViewSet):
    """
    API endpoint that allows videos to be viewed or edited.
    """
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    filterset_fields =  {
        'addDate': ['exact'],
        'updateDate': ['exact'],
        'visible': ['exact'],
        'author': ['exact'],
        'notes': ['exact'],
        'id': ['exact', 'in'],
        'publishedAt': ['exact'],
        'title': ['exact'],
        'description': ['exact'],
        'thumbnails': ['exact'],
        'channelTitle': ['exact'],
        'tags': ['exact'],
        'categoryId': ['exact'],
        'liveBroadcastContent': ['exact'],
        'defaultLanguage': ['exact'],
        'localized': ['exact'],
        'defaultAudioLanguage': ['exact'],
        'duration': ['exact'],
        'dimension': ['exact'],
        'definition': ['exact'],
        'caption': ['exact'],
        'licensedContent': ['exact'],
        'regionRestriction': ['exact'],
        'contentRating': ['exact'],
        'projection': ['exact'],
        'viewCount': ['exact'],
        'likeCount': ['exact'],
        'dislikeCount': ['exact'],
        'favoriteCount': ['exact'],
        'commentCount': ['exact'],
        'channel': ['exact'],
        'contributors': ['exact'],
        'playlists': ['exact'],
        'wikiTitle': ['exact'],
        'wikiStatus': ['exact'],
        'videoStatus': ['exact', 'in']
    }
    ordering_fields = '__all__'
