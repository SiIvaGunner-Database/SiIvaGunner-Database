from django.shortcuts import render
from siivagunnerdb.views import MultipleModelViewSet

from .models import Collective
from .serializers import CollectiveSerializer


class CollectiveViewSet(MultipleModelViewSet):
    """
    API endpoint that allows collectives to be viewed or edited.
    """
    queryset = Collective.objects.all()
    serializer_class = CollectiveSerializer
