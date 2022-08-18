from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Collective


class CollectiveSerializer(LoggedModelSerializer):
    class Meta:
        model = Collective
        fields = '__all__'
