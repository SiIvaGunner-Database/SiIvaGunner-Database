from django.shortcuts import render
from siivagunnerdb.views import MultipleModelViewSet

from .models import Spreadsheet, Sheet
from .serializers import SpreadsheetSerializer, SheetSerializer


class SpreadsheetViewSet(MultipleModelViewSet):
    """
    API endpoint that allows spreadsheets to be viewed or edited.
    """
    queryset = Spreadsheet.objects.all()
    serializer_class = SpreadsheetSerializer

class SheetViewSet(MultipleModelViewSet):
    """
    API endpoint that allows sheets to be viewed or edited.
    """
    queryset = Sheet.objects.all()
    serializer_class = SheetSerializer
