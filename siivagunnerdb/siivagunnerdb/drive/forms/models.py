from django.db import models
from siivagunnerdb.models import StandardModel


class Form(StandardModel):
    id = models.CharField(primary_key=True, max_length=44)
    title = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title
