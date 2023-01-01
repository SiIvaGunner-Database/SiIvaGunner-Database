from django.db import models
from siivagunnerdb.models import StandardModel


class Collective(StandardModel):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title
