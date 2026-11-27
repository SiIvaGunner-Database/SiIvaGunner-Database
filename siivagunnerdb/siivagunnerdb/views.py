import json
import random

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.shortcuts import render

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import SAFE_METHODS
from rest_framework.relations import ManyRelatedField
from rest_framework.views import exception_handler
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from siivagunnerdb.administration.accounts.models import BlacklistItem
from siivagunnerdb.serializers import removeUniqueValidator
from siivagunnerdb.settings import DEBUG
from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video


def index(request):
    # Find a random channel
    channels = Channel.objects.filter(visible=True, subscriberCount__gte=100, channelStatus='Public', channelType__in=['Original', 'Derivative'])
    blacklist = BlacklistItem.objects.filter(user=request.user) if request.user.is_authenticated else BlacklistItem.objects.none()
    channels = channels.exclude(id__in=blacklist.filter(channel__isnull=False).values('channel_id'))
    channel = None
    if channels.count() > 0:
        channel = channels[random.randrange(channels.count())]
    else:
        channel = Channel.objects.get(visible=True, id='UC9ecwl3FTG66jIKA9JRDtmg') # SiIvaGunner

    # Find a random video
    videos = Video.objects.filter(visible=True, channel__id=channel.id, videoStatus__in=['Public', 'Unlisted'])
    videos = videos.exclude(id__in=blacklist.filter(video__isnull=False).values('video_id'))
    video = None
    if videos.count() > 0:
        video = videos[random.randrange(videos.count())]
    else:
        channel = Channel.objects.get(visible=True, id='UC9ecwl3FTG66jIKA9JRDtmg') # SiIvaGunner
        video = Video.objects.get(visible=True, id='NzoneDE0A2o') # The Inn - Fire Emblem

    # Get the channel profile picture thumbnail
    thumbnail = None
    if channel.thumbnails and channel.thumbnails != "":
        thumbnail = json.loads(channel.thumbnails)["high"]["url"]

    # Return the page with the randomized channel and video
    context = {
        'channel': channel,
        'video': video,
        'thumbnail': thumbnail,
    }
    return render(request, 'index.html', context)


def generate(request):
    return render(request, 'generate.html', { 'title':'Rip Templates' })


def reports(request):
    return render(request, 'reports.html', { 'title':'Forms' })


def token(request):
    return render(request, 'token.html', { 'title':'Authentication Tokens' })


def jsonExceptionHandler(exc, context):
    response = exception_handler(exc, context)

    if response is None and not DEBUG:
        data = {'detail': 'The server encountered an error.'}
        response = Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if response is not None:
        response.data['code'] = response.status_code

    return response


class MultipleModelViewSet(ModelViewSet):
    """
    A view set with overriding create and update methods that allow content to be received as a single object or a list.
    Otherwise, this class is identical to the ModelViewSet class.
    """
    filter_backends = [DjangoFilterBackend, OrderingFilter,]
    filterset_fields = '__all__'
    ordering_fields = '__all__'
    ordering = 'id'

    def get_list_parameter(self, key):
        """
        Return a list from a GET parameter.
        """
        fields = self.request.GET.get(key, None)
        return fields.split(',') if fields else None

    def get_serializer(self, *args, **kwargs):
        """
        Override GET serializer with modified fields parameter.
        """
        kwargs['fields'] = self.get_list_parameter('fields')
        return super().get_serializer(*args, **kwargs)

    def get_pagination_serializer(self, *args, **kwargs):
        """
        Override paginated GET serializer with modified fields parameter.
        """
        kwargs['fields'] = self.get_list_parameter('fields')
        return super().get_pagination_serializer(*args, **kwargs)

    def get_queryset(self):
        """
        When a GET request limits the returned fields, load only the matching columns.
        """
        queryset = super().get_queryset()
        fields = self.get_list_parameter('fields')

        if fields and self.request.method in SAFE_METHODS:
            serializerFields = self.get_serializer_class()().fields
            columnNames = {field.name for field in queryset.model._meta.concrete_fields}
            sources = [serializerFields[name].source for name in fields if name in serializerFields]

            # Only defer columns when every requested field reads one column directly;
            # otherwise deferred columns would be loaded with an extra query per object
            if sources and all(source in columnNames for source in sources):
                queryset = queryset.only(queryset.model._meta.pk.name, *sources)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Create one or more objects.
        """
        serializer = self.get_serializer(data=request.data, many=isinstance(request.data, list))

        if serializer.is_valid():
            with transaction.atomic():
                self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Update one or more objects.
        Every object is validated before any are saved, and all of them are saved together,
        so a request either updates every object or none of them.
        """
        dataList = request.data

        if not isinstance(dataList, list):
            dataList = [dataList]
        if not dataList:
            return Response(request.data)

        queryset = self.get_queryset()
        model = queryset.model
        pkField = model._meta.pk

        # Load every object being updated with one query
        try:
            pks = [pkField.to_python(object['id']) for object in dataList]
        except (KeyError, TypeError, DjangoValidationError):
            return Response({'detail': 'Each object must include a valid id.'}, status=status.HTTP_400_BAD_REQUEST)
        instances = queryset.in_bulk(pks)
        missing = [str(pk) for pk in pks if pk not in instances]
        if missing:
            return Response({'detail': 'No objects found with the ids: ' + ', '.join(missing)}, status=status.HTTP_404_NOT_FOUND)

        # Validate every object before saving any
        serializers = []
        for object, pk in zip(dataList, pks):
            serializer = self.get_serializer(instance=instances[pk], data=object)
            # The id was used to find this object, so it can't belong to a different one
            if 'id' in serializer.fields:
                removeUniqueValidator(serializer.fields['id'])
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializers.append(serializer)

        # Bulk updates can only write plain columns, so fall back to saving one at a time when a
        # writable field is anything else (e.g. a many-to-many field)
        columnNames = {field.name for field in model._meta.concrete_fields}
        writableFields = [field for field in serializers[0].fields.values() if not field.read_only]
        canBulkUpdate = all(
            not isinstance(field, ManyRelatedField) and field.source in columnNames for field in writableFields
        )

        with transaction.atomic():
            if canBulkUpdate:
                self.bulkUpdate(model, serializers)
            else:
                for serializer in serializers:
                    self.perform_update(serializer)

        return Response(request.data)

    def bulkUpdate(self, model, serializers):
        """
        Apply each serializer's validated data to its object, then save all of the objects
        with one bulk update that writes only the changed columns.
        """
        changedFields = set()

        for serializer in serializers:
            instance = serializer.instance
            for name, value in serializer.validated_data.items():
                field = model._meta.get_field(name)
                if field.many_to_one or field.one_to_one:
                    # Compare foreign keys by ID to avoid loading the related object
                    oldValue = getattr(instance, field.attname)
                    newValue = value.pk if value is not None else None
                else:
                    oldValue = getattr(instance, name)
                    newValue = value
                if oldValue != newValue:
                    setattr(instance, name, value)
                    changedFields.add(name)

        # Keep updating auto_now fields (e.g. updateDate) on every saved object, as save() does
        instances = list({id(s.instance): s.instance for s in serializers}.values())
        for field in model._meta.concrete_fields:
            if getattr(field, 'auto_now', False):
                for instance in instances:
                    field.pre_save(instance, add=False)
                changedFields.add(field.name)

        if changedFields:
            model._default_manager.bulk_update(instances, sorted(changedFields), batch_size=500)

    def put(self, request, *args, **kwargs):
        """
        Call the update method from a PUT request.
        """
        return self.update(request, *args, **kwargs)
