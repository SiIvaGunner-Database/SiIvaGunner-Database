"""
Custom serializer classes. Experimental.
"""

from rest_framework.serializers import ModelSerializer
from siivagunnerdb.administration.logs.utils import log_addition, log_change


class LoggedModelSerializer(ModelSerializer):
    """
    Originally designed as a model serializer with overriding create and update
    methods to create a LogEntry and Reversion for each request. However, most
    of this functionality has been removed because of the amount of database
    storage it was taking up.
    """

    def __init__(self, *args, **kwargs):
        """
        Override the init method to allow dynamic field setting.
        See https://www.django-rest-framework.org/api-guide/serializers/#dynamically-modifying-fields
        """
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)

            # Remove any invalid fields
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def create(self, validated_data):
        """
        Create an addition LogEntry.
        """
        request = self.context['request']
        instance = super().create(validated_data)
        log_addition(request, instance)
        return instance

    def update(self, instance, validated_data):
        """
        Identical to ModelSerializer.update().
        """
        request = self.context['request']
        new_instance = super().update(instance, validated_data)
        return new_instance
