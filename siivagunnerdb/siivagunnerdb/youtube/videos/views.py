import datetime
import math
import re

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models.functions import Lower
from django.shortcuts import render, redirect
from django.urls import reverse

from siivagunnerdb.views import MultipleModelViewSet
from urllib.parse import urlencode

from .models import Video
from .serializers import VideoSerializer


def videoList(request):
    """
    The video search page.
    """
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

        url = reverse('videos:list')  # /videos/
        paramChar = '?'

        for param in parameters:
            url = url + paramChar + param  # /videos/?param=val&param=val
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
            sortOptions = ['date', 'title', 'views']

            if sort not in sortOptions:
                sort = 'publishedAt'

            if sort == 'views':
                sort = 'viewCount'
        else:
            sort = 'publishedAt'

        if request.GET.get('order') and request.GET.get('order') == 'ascending':
            order = 'ascending'
            urlParameters.append('order=' + order)
        else:
            order = 'descending'

        if request.GET.get('filter'):
            filter = request.GET.get('filter')
            urlParameters.append('filter=' + filter)
            filterOptions = ['unfiltered', 'documented', 'undocumented', 'public', 'unlisted', 'private', 'deleted', 'unavailable']

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

        resultCount = videos.count()
        pageCounter = resultCount
        pageNumber = 0
        pageNumbers = []
        lastPage = math.ceil(resultCount / 100)

        if lastPage < 1:
            lastPage = 1

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

        # Use only the videos for the current page
        if resultCount > 0:
            videos = videos[currentPage * 100 - 100:currentPage * 100]

        # Format the upload dates
        for video in videos:
            if video.publishedAt:
                video.publishedAt = video.publishedAt.strftime('%Y-%m-%d   %H:%M:%S')

        # Return the page with the searched videos
        return render(request, 'videos/videoList.html', {
                'videos':videos,
                'url':url,
                'resultCount':resultCount,
                'currentPage':currentPage,
                'pageNumbers':pageNumbers,
            }
        )


def videoDetails(request, id):
    """
    The video details page.
    """
    video = Video.objects.get(id=id)
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
        'wikiStatus': ['exact'],
        'videoStatus': ['exact', 'in']
    }
    ordering_fields = '__all__'
