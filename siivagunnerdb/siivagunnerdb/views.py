from django.shortcuts import render

from rest_framework import status
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
        if isinstance(request.data, list):
            return self.updateList(self, request, *args, **kwargs)
        else:
            return super().update(request, *args, **kwargs)

    def updateList(self, request, *args, **kwargs):
        """
        Update a list of objects.
        """
        for object in request.data:
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
