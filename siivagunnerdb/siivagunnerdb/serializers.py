"""
Custom serializer classes. Experimental.
"""

from django.contrib.admin.models import ADDITION, LogEntry
from rest_framework.exceptions import ValidationError
from rest_framework.relations import ManyRelatedField, PrimaryKeyRelatedField
from rest_framework.serializers import ListSerializer, ModelSerializer
from rest_framework.validators import UniqueValidator

from siivagunnerdb.administration.logs.utils import log_addition, log_change


class CachedPrimaryKeyRelatedField(PrimaryKeyRelatedField):
    """
    A primary key related field that looks up each related object only once per request.
    Bulk requests often reference the same few objects (e.g. one channel and one author for
    hundreds of videos), so this avoids a query per object for every foreign key.
    """

    def to_internal_value(self, data):
        request = self.context.get('request')
        if request is None:
            return super().to_internal_value(data)

        cache = request.__dict__.setdefault('_relatedObjectCache', {})
        key = (self.get_queryset().model, str(data))
        if key not in cache:
            cache[key] = super().to_internal_value(data)
        return cache[key]


def removeUniqueValidator(field):
    """
    Remove and return the UniqueValidator of a serializer field, or None if it has none.
    """
    for validator in field.validators:
        if isinstance(validator, UniqueValidator):
            field.validators = [v for v in field.validators if v is not validator]
            return validator
    return None


class BulkListSerializer(ListSerializer):
    """
    A list serializer that checks primary key uniqueness with one query and creates all objects
    with one bulk insert, instead of one query of each kind per object.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pkName = self.child.Meta.model._meta.pk.name
        self.uniquePkValidator = None
        if self.pkName in self.child.fields:
            self.uniquePkValidator = removeUniqueValidator(self.child.fields[self.pkName])

    def to_internal_value(self, data):
        validatedData = super().to_internal_value(data)

        if self.uniquePkValidator is not None:
            model = self.child.Meta.model
            pks = [item[self.pkName] for item in validatedData if self.pkName in item]
            existing = set(model._default_manager.filter(pk__in=pks).values_list('pk', flat=True))
            errors = []
            seen = set()
            for item in validatedData:
                pk = item.get(self.pkName)
                if pk is not None and (pk in existing or pk in seen):
                    errors.append({self.pkName: [self.uniquePkValidator.message]})
                else:
                    errors.append({})
                seen.add(pk)
            if any(errors):
                raise ValidationError(errors)

        return validatedData

    def create(self, validatedData):
        # Many-to-many fields need each object saved first, so fall back to creating one at a time
        if any(isinstance(field, ManyRelatedField) for field in self.child.fields.values()):
            return super().create(validatedData)

        model = self.child.Meta.model
        instances = model._default_manager.bulk_create([model(**item) for item in validatedData], batch_size=500)

        request = self.context.get('request')
        if request is not None and instances:
            LogEntry.objects.log_actions(
                user_id=request.user.pk,
                queryset=instances,
                action_flag=ADDITION,
                change_message=[{'added': {}}],
            )
        return instances


class LoggedModelSerializer(ModelSerializer):
    """
    Originally designed as a model serializer with overriding create and update
    methods to create a LogEntry and Reversion for each request. However, most
    of this functionality has been removed because of the amount of database
    storage it was taking up.
    """
    serializer_related_field = CachedPrimaryKeyRelatedField

    def __init_subclass__(cls, **kwargs):
        """
        Use the bulk list serializer for every subclass, since each declares its own Meta.
        """
        super().__init_subclass__(**kwargs)
        if not hasattr(cls.Meta, 'list_serializer_class'):
            cls.Meta.list_serializer_class = BulkListSerializer

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
