from django.contrib.auth.models import User
from django.db import models
from channels.models import Channel

class Rip(models.Model):
    #  Custom field types
    WikiStatus = models.TextChoices('WikiStatusChoice', 'Documented Undocumented')
    VideoStatus = models.TextChoices('VideoStatusChoice', 'Public Unlisted Unavailable Private Deleted')

    #  Normal fields
    id = models.CharField(primary_key=True, max_length=11)
    title = models.CharField(max_length=100)
    wikiStatus = models.CharField(choices=WikiStatus.choices, max_length=20)
    videoStatus = models.CharField(choices=VideoStatus.choices, max_length=20)
    uploadDate = models.DateTimeField(auto_now_add=False)
    length = models.CharField(max_length=10)
    description = models.TextField()
    viewCount = models.PositiveIntegerField()
    likeCount = models.PositiveIntegerField()
    dislikeCount = models.PositiveIntegerField()
    commentCount = models.PositiveIntegerField()

    #  Hidden fields
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    addDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
