from rest_framework.viewsets import ModelViewSet

from .models import Playlist
from .serializers import PlaylistSerializer


class PlaylistViewSet(ModelViewSet):
    """
    API endpoint that allows playlists to be viewed or edited.
    """
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
