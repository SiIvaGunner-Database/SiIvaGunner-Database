from django.shortcuts import render
from siivagunnerdb.views import MultipleModelViewSet

from .models import Form
from .serializers import FormSerializer


class FormViewSet(MultipleModelViewSet):
    """
    API endpoint that allows forms to be viewed or edited.
    """
    queryset = Form.objects.all()
    serializer_class = FormSerializer
