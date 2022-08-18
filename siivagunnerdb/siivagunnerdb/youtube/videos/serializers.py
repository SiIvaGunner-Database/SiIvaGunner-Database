from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Video


class VideoSerializer(LoggedModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'
