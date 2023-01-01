from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Spreadsheet, Sheet
from .serializers import SpreadsheetSerializer, SheetSerializer


class SpreadsheetViewSet(ModelViewSet):
    """
    API endpoint that allows spreadsheets to be viewed or edited.
    """
    queryset = Spreadsheet.objects.all()
    serializer_class = SpreadsheetSerializer

class SheetViewSet(ModelViewSet):
    """
    API endpoint that allows sheets to be viewed or edited.
    """
    queryset = Sheet.objects.all()
    serializer_class = SheetSerializer
