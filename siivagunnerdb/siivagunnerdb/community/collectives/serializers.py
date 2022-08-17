from rest_framework.serializers import ModelSerializer
from .models import Collective


class CollectiveSerializer(ModelSerializer):
    class Meta:
        model = Collective
        fields = '__all__'
