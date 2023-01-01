from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Script


class ScriptSerializer(LoggedModelSerializer):
    class Meta:
        model = Script
        fields = '__all__'
