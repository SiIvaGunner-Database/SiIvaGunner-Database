from django.db import models

from siivagunnerdb.models import StandardModel
from siivagunnerdb.community.contributors.models import Contributor
from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.playlists.models import Playlist

WikiStatus = models.TextChoices('WikiStatusChoice', 'Documented Undocumented')
VideoStatus = models.TextChoices('VideoStatusChoice', 'Public Unlisted Unavailable Private Deleted')


class Video(StandardModel):
    id = models.CharField(primary_key=True, max_length=11)

    # Snippet
    publishedAt = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, default='placeholder')
    description = models.TextField(blank=True, default='')
    thumbnails = models.JSONField(blank=True, default=dict)
    channelTitle = models.CharField(max_length=100, blank=True, default='')
    tags = models.JSONField(blank=True, default=dict)
    categoryId = models.CharField(max_length=50, blank=True, default='')
    liveBroadcastContent = models.CharField(max_length=20, blank=True, default='')
    defaultLanguage = models.CharField(max_length=50, blank=True, default='')
    localized = models.JSONField(blank=True, default=dict)
    defaultAudioLanguage = models.CharField(max_length=50, blank=True, default='')

    # Content details
    duration = models.CharField(max_length=20, blank=True, default='')
    dimension = models.CharField(max_length=20, blank=True, default='')
    definition = models.CharField(max_length=20, blank=True, default='')
    caption = models.CharField(max_length=20, blank=True, default='')
    licensedContent = models.BooleanField(blank=True, default=False)
    regionRestriction = models.JSONField(blank=True, default=dict)
    contentRating = models.JSONField(blank=True, default=dict)
    projection = models.CharField(max_length=20, blank=True, default='')

    # Statistics
    viewCount = models.PositiveIntegerField(blank=True, default=0)
    likeCount = models.PositiveIntegerField(blank=True, default=0)
    dislikeCount = models.PositiveIntegerField(blank=True, default=0)
    favoriteCount = models.PositiveIntegerField(blank=True, default=0)
    commentCount = models.PositiveIntegerField(blank=True, default=0)

    # Custom
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT, blank=True, null=True)
    contributors = models.ManyToManyField(Contributor, blank=True, default=[])
    playlists = models.ManyToManyField(Playlist, blank=True, default=[])
    wikiStatus = models.CharField(choices=WikiStatus.choices, max_length=20, blank=True, default='')
    videoStatus = models.CharField(choices=VideoStatus.choices, max_length=20, blank=True, default='')

    def __str__(self):
        return self.title


# # To be implemented later
# class VideoCategory(StandardModel):
#     id = models.CharField(primary_key=True, max_length=50)
#
#     # Snippet
#     title = models.CharField(max_length=100, blank=True, default='')
#     assignable = models.BooleanField(blank=True, default=True)
#
#     # Custom
#     # Channel ID should always be 'UCBR8-60-B28hp2BmDPdntcQ' (YouTube)
#     channel = models.ForeignKey(Channel, on_delete=models.PROTECT, blank=True, null=True)
#
#     def __str__(self):
#         return self.title
