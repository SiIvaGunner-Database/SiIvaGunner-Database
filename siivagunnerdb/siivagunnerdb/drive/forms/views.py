from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet

from .models import Form
from .serializers import FormSerializer


class FormViewSet(ModelViewSet):
    """
    API endpoint that allows forms to be viewed or edited.
    """
    queryset = Form.objects.all()
    serializer_class = FormSerializer
