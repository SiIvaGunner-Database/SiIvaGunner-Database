from django.contrib.auth.models import User
from django.db import models

class Channel(models.Model):
    #  Custom field types
    ChannelStatus = models.TextChoices('ChannelStatusChoice', 'Public Deleted')

    #  Normal fields
    id = models.CharField(primary_key=True, max_length=24)
    name = models.CharField(max_length=100)
    wiki = models.CharField(max_length=100)
    channelStatus = models.CharField(choices=ChannelStatus.choices, max_length=20)
    joinDate = models.DateTimeField(auto_now_add=False)
    description = models.TextField()
    videoCount = models.PositiveIntegerField()
    subscriberCount = models.PositiveIntegerField()
    viewCount = models.PositiveIntegerField()

    #  Hidden fields
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    addDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
