"""
Custom serializer classes. Experimental.
"""

from rest_framework.serializers import ModelSerializer
from siivagunnerdb.administration.logs.utils import log_addition, log_change

import reversion


class LoggedModelSerializer(ModelSerializer):
    """
    A serializer with overriding create and update methods that create a LogEntry and Reversion for each request.
    Otherwise, this class is identical to the ModelSerializer class.
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
        Create an addition LogEntry and Reversion.
        """
        request = self.context['request']

        with reversion.create_revision():
            instance = super().create(validated_data)
            reversion.set_user(request.user)
            reversion.set_comment('Created revision from POST request')

        log_addition(request, instance)
        return instance

    def update(self, instance, validated_data):
        """
        Create a change LogEntry and Reversion.
        """
        request = self.context['request']
        new_instance = super().update(instance, validated_data)
        log_change(request, instance, new_instance)
        return new_instance
