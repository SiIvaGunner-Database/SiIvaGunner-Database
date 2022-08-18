from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Channel


class ChannelSerializer(LoggedModelSerializer):
    class Meta:
        model = Channel
        fields = '__all__'
