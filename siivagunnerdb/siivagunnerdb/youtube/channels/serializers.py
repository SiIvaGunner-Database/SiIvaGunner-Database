from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Channel


class ChannelSerializer(LoggedModelSerializer):
    class Meta:
        model = Channel
        # All fields except contributors
        fields = [
            'addDate',
            'updateDate',
            'visible',
            'author',
            'notes',
            'id',
            'title',
            'description',
            'customUrl',
            'publishedAt',
            'thumbnails',
            'defaultLanguage',
            'localized',
            'country',
            'relatedPlaylists',
            'viewCount',
            'subscriberCount',
            'hiddenSubscriberCount',
            'videoCount',
            'channelStatus',
            'channelType',
            'bannerExternalUrl',
            'wiki',
            'collective',
            'productionSpreadsheet',
            'developmentSpreadsheet',
            'productionChangelogSpreadsheet',
            'developmentChangelogSpreadsheet',
            'productionUndocumentedRipsPlaylist',
            'developmentUndocumentedRipsPlaylist',
        ]
