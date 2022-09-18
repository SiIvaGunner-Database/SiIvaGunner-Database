from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Form


class FormSerializer(LoggedModelSerializer):
    class Meta:
        model = Form
        fields = '__all__'
