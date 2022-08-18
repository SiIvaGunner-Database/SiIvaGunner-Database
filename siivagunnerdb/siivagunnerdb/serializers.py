"""
Custom serializer classes. Experimental and incomplete.
"""

from rest_framework.serializers import ModelSerializer
from siivagunnerdb.administration.logs.utils import log_addition, log_change


class LoggedModelSerializer(ModelSerializer):
    """
    A serializer with overriding create and update methods that create a LogEntry for the change being made.
    Otherwise, this class is identical to the ModelSerializer class.
    """

    def create(self, validated_data):
        """
        Creates an addition LogEntry and returns ModelSerializer.create(validated_data).
        """
        request = self.context['request']
        instance = super().create(validated_data)
        log_addition(request, instance)
        return instance

    def update(self, instance, validated_data):
        """
        Creates a change LogEntry and returns ModelSerializer.update(instance, validated_data).
        """
        request = self.context['request']
        new_instance = super().update(instance, validated_data)
        log_change(request, instance, new_instance)
        return new_instance
