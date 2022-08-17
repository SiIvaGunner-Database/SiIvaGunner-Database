from django.contrib.auth.models import User
from django.db import models
from siivagunnerdb.youtube.channels.models import Channel

WikiStatus = models.TextChoices('WikiStatusChoice', 'Documented Undocumented')
VideoStatus = models.TextChoices('VideoStatusChoice', 'Public Unlisted Unavailable Private Deleted')


class Video(models.Model):
    id = models.CharField(primary_key=True, max_length=11)

    # Snippet
    publishedAt = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    # channelId: string
    title = models.CharField(max_length=100, blank=True, default='')
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
    viewCount = models.PositiveIntegerField()
    likeCount = models.PositiveIntegerField()
    dislikeCount = models.PositiveIntegerField()
    favoriteCount = models.PositiveIntegerField()
    commentCount = models.PositiveIntegerField()

    # Custom
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    wikiStatus = models.CharField(choices=WikiStatus.choices, max_length=20)
    videoStatus = models.CharField(choices=VideoStatus.choices, max_length=20)

    # Administration
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    notes = models.TextField(blank=True, default='')
    addDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# class VideoCategory(models.Model):
#     id = models.CharField(primary_key=True, max_length=50)
#
#     # Snippet
#     title = models.CharField(max_length=100, blank=True, default='')
#     # channelId: string -> 'UCBR8-60-B28hp2BmDPdntcQ'
#     assignable = models.BooleanField(blank=True, default=True)
#
#     def __str__(self):
#         return self.title
