from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Sheet


class SheetSerializer(LoggedModelSerializer):
    class Meta:
        model = Sheet
        fields = '__all__'
