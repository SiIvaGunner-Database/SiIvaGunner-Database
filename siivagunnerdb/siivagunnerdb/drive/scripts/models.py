from django.db import models
from siivagunnerdb.models import StandardModel


class Script(StandardModel):
    id = models.CharField(primary_key=True, max_length=57)
    title = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title
