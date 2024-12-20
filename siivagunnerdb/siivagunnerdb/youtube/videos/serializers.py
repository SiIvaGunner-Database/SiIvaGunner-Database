from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Video


class VideoSerializer(LoggedModelSerializer):
    class Meta:
        model = Video
        # All fields except contributors and playlists
        fields = [
            'addDate',
            'updateDate',
            'visible',
            'author',
            'notes',
            'id',
            'publishedAt',
            'title',
            'description',
            'thumbnails',
            'channelTitle',
            'tags',
            'categoryId',
            'liveBroadcastContent',
            'defaultLanguage',
            'localized',
            'defaultAudioLanguage',
            'duration',
            'dimension',
            'definition',
            'caption',
            'licensedContent',
            'regionRestriction',
            'contentRating',
            'projection',
            'viewCount',
            'likeCount',
            'dislikeCount',
            'favoriteCount',
            'commentCount',
            'channel',
            'wikiTitle',
            'wikiStatus',
            'videoStatus',
        ]
