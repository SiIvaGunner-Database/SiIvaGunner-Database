from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Playlist


class PlaylistSerializer(LoggedModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'
