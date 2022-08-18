from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Contributor


class ContributorSerializer(LoggedModelSerializer):
    class Meta:
        model = Contributor
        fields = '__all__'
