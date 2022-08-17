from rest_framework.serializers import ModelSerializer
from django.contrib.admin.models import LogEntry


class LogSerializer(ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'
