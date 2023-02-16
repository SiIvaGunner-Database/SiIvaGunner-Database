from django.contrib.admin.models import LogEntry
from siivagunnerdb.views import MultipleModelViewSet

from .models import Alert
from .serializers import LogSerializer, AlertSerializer


class LogViewSet(MultipleModelViewSet):
    """
    API endpoint that allows logs to be viewed or edited.
    """
    queryset = LogEntry.objects.all()
    serializer_class = LogSerializer

class AlertViewSet(MultipleModelViewSet):
    """
    API endpoint that allows alerts to be viewed or edited.
    """
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
