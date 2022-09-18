from django.db import models

from siivagunnerdb.models import StandardModel
from siivagunnerdb.community.collectives.models import Collective
from siivagunnerdb.community.contributors.models import Contributor
from siivagunnerdb.drive.sheets.models import Sheet

ChannelStatus = models.TextChoices('ChannelStatusChoice', 'Public Deleted')


class Channel(StandardModel):
    id = models.CharField(primary_key=True, max_length=24)

    # Snippet
    title = models.CharField(max_length=100, blank=True, default='placeholder')
    description = models.TextField(blank=True, default='')
    customUrl = models.CharField(max_length=100, blank=True, default='')
    publishedAt = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    thumbnails = models.JSONField(blank=True, default=dict)
    defaultLanguage = models.CharField(max_length=50, blank=True, default='')
    localized = models.JSONField(blank=True, default=dict)
    country = models.CharField(max_length=50, blank=True, default='')

    # Content details
    relatedPlaylists = models.JSONField(blank=True, default=dict)

    # Statistics
    viewCount = models.PositiveIntegerField(blank=True, default=0)
    subscriberCount = models.PositiveIntegerField(blank=True, default=0)
    hiddenSubscriberCount = models.BooleanField(blank=True, default=0)
    videoCount = models.PositiveIntegerField(blank=True, default=0)

    # Custom
    channelStatus = models.CharField(choices=ChannelStatus.choices, max_length=20, blank=True, default='')
    bannerExternalUrl = models.CharField(max_length=100, blank=True, default='')
    wiki = models.CharField(max_length=50, blank=True, default='')
    collective = models.ForeignKey(Collective, on_delete=models.PROTECT, blank=True, null=True)
    contributors = models.ManyToManyField(Contributor, blank=True, default=[])
    prodSheet = models.ForeignKey(Sheet, related_name='channels_prod_sheet', on_delete=models.PROTECT, blank=True, null=True)
    devSheet = models.ForeignKey(Sheet, related_name='channels_dev_sheet', on_delete=models.PROTECT, blank=True, null=True)

    def __str__(self):
        return self.title
