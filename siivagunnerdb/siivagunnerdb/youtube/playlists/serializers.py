from rest_framework.serializers import ModelSerializer
from .models import Playlist


class PlaylistSerializer(ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'
