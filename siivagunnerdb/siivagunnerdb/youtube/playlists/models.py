from django.contrib.auth.models import User
from django.db import models


class Playlist(models.Model):
    id = models.CharField(primary_key=True, max_length=34)

    # Snippet
    publishedAt = models.DateTimeField(auto_now_add=False)
    # channelId: string
    title = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    thumbnails = models.JSONField(blank=True, default=dict)
    channelTitle = models.CharField(max_length=100, blank=True, default='')
    defaultLanguage = models.CharField(max_length=50,blank=True, default='')
    localized = models.JSONField(blank=True, default=dict)

    # Content details
    itemCount = models.PositiveIntegerField()

    # Custom
    # (nothing yet!)

    # Administration
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    notes = models.TextField(blank=True, default='')
    addDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
