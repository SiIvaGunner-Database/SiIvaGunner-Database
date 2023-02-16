from siivagunnerdb.views import MultipleModelViewSet

from .models import Playlist
from .serializers import PlaylistSerializer


class PlaylistViewSet(MultipleModelViewSet):
    """
    API endpoint that allows playlists to be viewed or edited.
    """
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
