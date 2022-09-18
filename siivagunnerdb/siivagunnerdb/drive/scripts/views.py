from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Script
from .serializers import ScriptSerializer


class ScriptViewSet(ModelViewSet):
    """
    API endpoint that allows scripts to be viewed or edited.
    """
    queryset = Script.objects.all()
    serializer_class = ScriptSerializer
