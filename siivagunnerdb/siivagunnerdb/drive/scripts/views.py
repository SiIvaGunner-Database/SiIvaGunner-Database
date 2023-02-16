from django.shortcuts import render
from siivagunnerdb.views import MultipleModelViewSet

from .models import Script
from .serializers import ScriptSerializer


class ScriptViewSet(MultipleModelViewSet):
    """
    API endpoint that allows scripts to be viewed or edited.
    """
    queryset = Script.objects.all()
    serializer_class = ScriptSerializer
