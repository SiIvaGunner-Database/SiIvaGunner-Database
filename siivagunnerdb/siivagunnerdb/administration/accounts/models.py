from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video


class UserListItem(models.Model):
    """
    A video or channel saved to one of a user's lists. Exactly one of video or channel is set.
    """
    addDate = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='%(class)ss')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, blank=True, null=True, related_name='%(class)ss')
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, blank=True, null=True, related_name='%(class)ss')

    class Meta:
        abstract = True
        constraints = [
            models.UniqueConstraint(fields=['user', 'video'], name='unique_user_video_%(class)s'),
            models.UniqueConstraint(fields=['user', 'channel'], name='unique_user_channel_%(class)s'),
            models.CheckConstraint(
                condition=(Q(video__isnull=False, channel__isnull=True) | Q(video__isnull=True, channel__isnull=False)),
                name='%(class)s_video_xor_channel',
            ),
        ]

    def __str__(self):
        return f'{self.user} - {self.video or self.channel}'


class Favorite(UserListItem):
    """
    A video or channel favorited by a user.
    """
    class Meta(UserListItem.Meta):
        pass


class BlacklistItem(UserListItem):
    """
    A video or channel blacklisted by a user.
    """
    class Meta(UserListItem.Meta):
        pass
