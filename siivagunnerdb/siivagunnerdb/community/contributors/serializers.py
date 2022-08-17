from rest_framework.serializers import ModelSerializer
from .models import Contributor


class ContributorSerializer(ModelSerializer):
    class Meta:
        model = Contributor
        fields = '__all__'
