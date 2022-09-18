from django.db import models

from siivagunnerdb.models import StandardModel
from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.drive.sheets.models import Sheet


class Playlist(StandardModel):
    id = models.CharField(primary_key=True, max_length=34)

    # Snippet
    publishedAt = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, default='placeholder')
    description = models.TextField(blank=True, default='')
    thumbnails = models.JSONField(blank=True, default=dict)
    channelTitle = models.CharField(max_length=100, blank=True, default='')
    defaultLanguage = models.CharField(max_length=50,blank=True, default='')
    localized = models.JSONField(blank=True, default=dict)

    # Content details
    itemCount = models.PositiveIntegerField(blank=True, default=0)

    # Custom
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT, blank=True, null=True)
    productionSheet = models.ForeignKey(Sheet, related_name='playlists_prod_sheet', on_delete=models.PROTECT, blank=True, null=True)
    developmentSheet = models.ForeignKey(Sheet, related_name='playlists_dev_sheet', on_delete=models.PROTECT, blank=True, null=True)

    def __str__(self):
        return self.title
