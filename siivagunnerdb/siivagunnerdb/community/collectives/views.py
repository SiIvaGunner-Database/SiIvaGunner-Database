from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Collective
from .serializers import CollectiveSerializer


class CollectiveViewSet(ModelViewSet):
    """
    API endpoint that allows collectives to be viewed or edited.
    """
    queryset = Collective.objects.all()
    serializer_class = CollectiveSerializer
