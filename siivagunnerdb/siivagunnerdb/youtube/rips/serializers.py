from rest_framework.serializers import ModelSerializer
from .models import Rip


class RipSerializer(ModelSerializer):
    class Meta:
        model = Rip
        fields = '__all__'
