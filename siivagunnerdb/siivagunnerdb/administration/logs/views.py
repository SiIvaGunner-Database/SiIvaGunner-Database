from django.contrib.admin.models import LogEntry
from rest_framework.viewsets import ModelViewSet

from .models import Alert
from .serializers import LogSerializer, AlertSerializer


class LogViewSet(ModelViewSet):
    """
    API endpoint that allows logs to be viewed or edited.
    """
    queryset = LogEntry.objects.all()
    serializer_class = LogSerializer

class AlertViewSet(ModelViewSet):
    """
    API endpoint that allows alerts to be viewed or edited.
    """
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
