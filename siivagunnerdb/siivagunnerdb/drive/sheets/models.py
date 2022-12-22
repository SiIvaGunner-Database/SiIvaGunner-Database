from django.db import models
from siivagunnerdb.models import StandardModel


class Spreadsheet(StandardModel):
    id = models.CharField(primary_key=True, max_length=44)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title

class Sheet(StandardModel):
    id = models.PositiveIntegerField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title
