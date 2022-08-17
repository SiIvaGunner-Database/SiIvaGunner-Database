from rest_framework import serializers
from .models import Channel


class ChannelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Channel
        fields = '__all__'
