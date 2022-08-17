from rest_framework.viewsets import ModelViewSet

from .models import Contributor
from .serializers import ContributorSerializer


class ContributorViewSet(ModelViewSet):
    """
    API endpoint that allows contributors to be viewed or edited.
    """
    queryset = Contributor.objects.all()
    serializer_class = ContributorSerializer
