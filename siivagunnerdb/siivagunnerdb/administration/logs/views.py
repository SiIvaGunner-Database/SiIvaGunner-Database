from django.contrib.admin.models import LogEntry
from rest_framework.viewsets import ModelViewSet

from .serializers import LogSerializer


class LogViewSet(ModelViewSet):
    """
    API endpoint that allows logs to be viewed or edited.
    """
    queryset = LogEntry.objects.all()
    serializer_class = LogSerializer
