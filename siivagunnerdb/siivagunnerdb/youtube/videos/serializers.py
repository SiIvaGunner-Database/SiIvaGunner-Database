from rest_framework import serializers
from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Video, COMMON_VIDEO_FIELDS


class VideoSerializer(LoggedModelSerializer):
    class Meta:
        model = Video
        fields = COMMON_VIDEO_FIELDS
