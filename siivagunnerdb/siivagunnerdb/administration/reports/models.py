from django.db import models
from django.template.defaultfilters import truncatechars
from siivagunnerdb.models import StandardModel


class Report(StandardModel):
    description = models.TextField()
    resolution = models.TextField(blank=True, default='')
    resolved = models.BooleanField(blank=True, default=False)

    @property
    def shortDescription(self):
        return truncatechars(self.description, 100)

    def __str__(self):
        return self.addDate.strftime('%y-%m-%d %H:%M')
