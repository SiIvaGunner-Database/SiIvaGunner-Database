from django.db import models, migrations
from django.contrib.auth.models import User
from channels.models import Channel

class Rip(models.Model):
    WikiStatus = models.TextChoices('WikiStatusChoice', 'Documented Undocumented')
    VideoStatus = models.TextChoices('WikiStatusChoice', 'Public Unlisted Private Deleted Unavailable')
    videoId = models.CharField(blank=True, max_length=11)
    title = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, max_length=100)
    wikiStatus = models.CharField(blank=True, choices=WikiStatus.choices, max_length=20)
    videoStatus = models.CharField(blank=True, choices=VideoStatus.choices, max_length=20)
    uploadDate = models.DateTimeField(auto_now_add=False, blank=True, null=True)
    description = models.TextField(blank=True, null=True, default="")
    length = models.CharField(blank=True, null=True, max_length=20)
    viewCount = models.PositiveIntegerField(blank=True, null=True, default=0)
    likeCount = models.PositiveIntegerField(blank=True, null=True, default=0)
    dislikeCount = models.PositiveIntegerField(blank=True, null=True, default=0)
    commentCount = models.PositiveIntegerField(blank=True, null=True, default=0)
    addDate = models.DateTimeField(auto_now_add=True)
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT, blank=True, null=True, default=None)
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True, default=None)
    visible = models.BooleanField(default=False)

    def __str__(self):
        return self.title
