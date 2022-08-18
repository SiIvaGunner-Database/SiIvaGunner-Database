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

    def create(self, validated_data):
        """
        Creates an addition LogEntry and Reversion.
        Returns ModelSerializer.create(validated_data).
        """
        request = self.context['request']

        with reversion.create_revision():
            instance = super().create(validated_data)
            reversion.set_user(request.user)
            reversion.set_comment("Created revision from POST request")

        log_addition(request, instance)
        return instance

    def update(self, instance, validated_data):
        """
        Creates a change LogEntry and Reversion.
        Returns ModelSerializer.update(instance, validated_data).
        """
        request = self.context['request']

        with reversion.create_revision():
            new_instance = super().update(instance, validated_data)
            reversion.set_user(request.user)
            reversion.set_comment("Created revision from PUT request")

        log_change(request, instance, new_instance)
        return new_instance
