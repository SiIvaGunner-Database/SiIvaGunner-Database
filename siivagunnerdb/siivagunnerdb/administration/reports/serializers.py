from siivagunnerdb.serializers import LoggedModelSerializer
from .models import Report


class ReportSerializer(LoggedModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
