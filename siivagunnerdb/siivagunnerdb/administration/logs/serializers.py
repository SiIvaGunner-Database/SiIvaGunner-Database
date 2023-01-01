from django.contrib.admin.models import LogEntry
from siivagunnerdb.serializers import LoggedModelSerializer

from .models import Alert


class LogSerializer(LoggedModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'

class AlertSerializer(LoggedModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
