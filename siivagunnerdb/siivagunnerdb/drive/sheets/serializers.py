from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Spreadsheet, Sheet


class SpreadsheetSerializer(LoggedModelSerializer):
    class Meta:
        model = Spreadsheet
        fields = '__all__'

class SheetSerializer(LoggedModelSerializer):
    class Meta:
        model = Sheet
        fields = '__all__'
