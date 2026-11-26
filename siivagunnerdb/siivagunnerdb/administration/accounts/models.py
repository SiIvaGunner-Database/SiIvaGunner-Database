from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video


class Favorite(models.Model):
    """
    A video or channel favorited by a user. Exactly one of video or channel is set.
    """
    addDate = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, blank=True, null=True, related_name='favorites')
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, blank=True, null=True, related_name='favorites')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'video'], name='unique_user_video_favorite'),
            models.UniqueConstraint(fields=['user', 'channel'], name='unique_user_channel_favorite'),
            models.CheckConstraint(
                condition=(Q(video__isnull=False, channel__isnull=True) | Q(video__isnull=True, channel__isnull=False)),
                name='favorite_video_xor_channel',
            ),
        ]

    def __str__(self):
        return f'{self.user} - {self.video or self.channel}'
