from django.shortcuts import render

from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response


def generate(request):
    return render(request, 'generate.html')


def token(request):
    return render(request, 'token.html')


class MultipleModelViewSet(ModelViewSet):
    """
    A view set with overriding create and update methods that allow content to be received as a single object or a list.
    Otherwise, this class is identical to the ModelViewSet class.
    """

    def create(self, request, *args, **kwargs):
        """
        Create one or more objects.
        Returns the response.
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
        Returns the response.
        """
        if isinstance(request.data, list):
            for object in request.data:
                instance = self.get_queryset().get(pk=object["id"])
                serializer = self.get_serializer(instance=instance, data=object)

                if serializer.is_valid():
                    self.perform_update(serializer)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(request.data)
        else:
            return super().update(request, *args, **kwargs)
