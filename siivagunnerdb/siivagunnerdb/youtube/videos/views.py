from datetime import datetime

from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from siivagunnerdb.views import MultipleModelViewSet
from siivagunnerdb import search

from .models import Video
from .serializers import VideoSerializer


def videoList(request):
    """
    The video search page.
    """
    # If the search is being submitted
    if request.method == 'POST':
        parameterNames = ['search', 'sort', 'order', 'filter', 'channelType', 'minimumSubscribers', 'channel',]
         # "/videos/" + "?param=val&param=val"
        url = reverse('videos:list') + search.convertFormParamsToQueryParams(request, parameterNames)
        return redirect(url)

    # Else the search is being loaded
    else:
        startTime = datetime.utcnow()

        # Get the search parameters
        searchTerms = request.GET.get('search')
        sort = request.GET.get('sort')
        order = request.GET.get('order')
        filter = request.GET.get('filter')
        channelType = request.GET.get('channelType')
        minimumSubscribers = request.GET.get('minimumSubscribers')
        channelId = request.GET.get('channel')
        currentPage = request.GET.get('page')

        # Set applicable default parameter values
        sortOptions = ['publishedAt', 'title', 'viewCount',]
        if sort is None or sort not in sortOptions:
            sort = 'publishedAt'
        filterOptions = ['documented', 'undocumented', 'public', 'unlisted', 'private', 'deleted', 'unavailable',]
        if filter not in filterOptions:
            filter = None
        else:
            filter = filter.capitalize()
        if currentPage:
            currentPage = abs(int(currentPage))
        else:
            currentPage = 1
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search paramater execution time in seconds: ' + str(executionTime))

        # Query the search using any given filters or sorting
        videos = Video.objects.filter(visible=True, channel__visible=True)
        if searchTerms:
            videosByTitle = videos.filter(title__icontains=searchTerms)
            videosByChannel = videos.filter(channel__title__icontains=searchTerms)
            videosById = videos.filter(id__icontains=searchTerms)
            videos = (videosByTitle | videosById | videosByChannel)
        if channelId:
            videos = videos.filter(channel__id=channelId)
        elif channelType == 'original':
            videos = videos.filter(channel__channelType='Original')
        elif channelType != 'all':
            videos = videos.exclude(channel__channelType='Influenced')
        if filter:
            if filter == 'Undocumented' or filter == 'Documented':
                videos = videos.filter(wikiStatus=filter)
            else:
                videos = videos.filter(videoStatus=filter)
        if minimumSubscribers:
            videos = videos.filter(channel__subscriberCount__gte=minimumSubscribers)
        if order == 'ascending':
            if sort != 'title':
                videos = videos.order_by(sort)
            else:
                videos = videos.order_by(Lower(sort))
        else:
            if sort != 'title':
                videos = videos.order_by('-' + sort)
            else:
                videos = videos.order_by(Lower(sort).desc())
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search filter execution time in seconds: ' + str(executionTime))

        # Determine the search page numbers
        resultCount = videos.count()
        pageNumbers = search.getPageNumbers(resultCount, currentPage)
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search pagination numbers execution time in seconds: ' + str(executionTime))

        # Use only the videos for the current page
        if resultCount > 0:
            videos = videos[currentPage * 50 - 50:currentPage * 50]
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search pagination data split execution time in seconds: ' + str(executionTime))

        # Format the upload dates and put the first 50 IDs into an array
        first50Ids = []
        for video in videos:
            first50Ids.append(video.id)
            if video.publishedAt:
                video.publishedAt = video.publishedAt.strftime('%Y-%m-%d %H:%M:%S')
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search date formatting execution time in seconds: ' + str(executionTime))

        # Return the page with the searched videos
        context = {
            'videos': videos,
            'first50Ids': ','.join(first50Ids),
            'searchUrl': search.getPathWithoutPageParameter(request),
            'resultCount': resultCount,
            'currentPage': currentPage,
            'pageNumbers': pageNumbers,
        }
        executionTime = (datetime.utcnow() - startTime).total_seconds()
        print('Video search total execution time in seconds: ' + str(executionTime))
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
    filterset_fields = {
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
        'wikiTitle': ['exact'],
        'wikiStatus': ['exact'],
        'videoStatus': ['exact', 'in']
    }
    ordering_fields = '__all__'
