from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Sheet
from .serializers import SheetSerializer


class SheetViewSet(ModelViewSet):
    """
    API endpoint that allows sheets to be viewed or edited.
    """
    queryset = Sheet.objects.all()
    serializer_class = SheetSerializer
