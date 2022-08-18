from django.contrib.admin.models import LogEntry
from siivagunnerdb.serializers import LoggedModelSerializer


class LogSerializer(LoggedModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'
