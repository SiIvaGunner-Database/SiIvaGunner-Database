from django.shortcuts import render

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.views import exception_handler
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from siivagunnerdb.settings import DEBUG


def generate(request):
    return render(request, 'generate.html')


def token(request):
    return render(request, 'token.html')


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
        return self.serializer_class(*args, **kwargs)

    def get_pagination_serializer(self, *args, **kwargs):
        """
        Override paginated GET serializer with modified fields parameter.
        """
        kwargs['fields'] = self.get_list_parameter('fields')
        return self.pagination_serializer_class(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Create one or more objects.
        """
        serializer = self.get_serializer(data=request.data, many=isinstance(request.data, list))

        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Update one or more objects.
        """
        dataList = request.data

        if not isinstance(dataList, list):
            dataList = [dataList]

        for object in dataList:
            instance = self.get_queryset().get(pk=object['id'])
            serializer = self.get_serializer(instance=instance, data=object)

            if serializer.is_valid():
                self.perform_update(serializer)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(request.data)

    def put(self, request, *args, **kwargs):
        """
        Call the update method from a PUT request.
        """
        return self.update(request, *args, **kwargs)
