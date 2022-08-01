from django.contrib.auth.models import User
from django.db import models

ChannelStatus = models.TextChoices('ChannelStatusChoice', 'Public Deleted')

class Channel(models.Model):
    id = models.CharField(primary_key=True, max_length=24)

    # Snippet
    title = models.CharField(max_length=100, blank=True, default='')
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
    wiki = models.CharField(max_length=50, blank=True, default='')
    bannerExternalUrl = models.CharField(max_length=100, blank=True, default='')
    channelStatus = models.CharField(choices=ChannelStatus.choices, max_length=20, blank=True, default='')

    #  Administration
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    addDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
