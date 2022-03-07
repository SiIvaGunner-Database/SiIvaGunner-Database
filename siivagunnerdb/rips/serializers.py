from rest_framework import serializers
from .models import Rip

class RipSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Rip
        fields = '__all__'
