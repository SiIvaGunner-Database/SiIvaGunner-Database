from django.contrib.auth.models import User
from django.db import models, migrations

class Channel(models.Model):
    ChannelStatus = models.TextChoices('WikiStatusChoice', 'Public Deleted')
    channelId = models.CharField(blank=True, max_length=24)
    name = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, max_length=100)
    channelStatus = models.CharField(blank=True, choices=ChannelStatus.choices, max_length=20)
    joinDate = models.DateTimeField(auto_now_add=False, blank=True)
    description = models.TextField(blank=True, default="")
    subscriberCount = models.PositiveIntegerField(blank=True, default=0)
    profilePicture = models.ImageField(blank=True, default='default.png')
    addDate = models.DateTimeField(auto_now_add=True)
    wiki = models.CharField(blank=True, max_length=100)
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, default=None)
    visible = models.BooleanField(default=False)

    def __str__(self):
        return self.name
