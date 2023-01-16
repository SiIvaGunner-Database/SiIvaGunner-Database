from siivagunnerdb.views import MultipleModelViewSet

from .models import Contributor
from .serializers import ContributorSerializer


class ContributorViewSet(MultipleModelViewSet):
    """
    API endpoint that allows contributors to be viewed or edited.
    """
    queryset = Contributor.objects.all()
    serializer_class = ContributorSerializer
