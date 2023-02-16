from django.db import models
from django.template.defaultfilters import truncatechars
from siivagunnerdb.models import StandardModel


class Alert(StandardModel):
    description = models.TextField()

    @property
    def shortDescription(self):
        return truncatechars(self.description, 100)

    def __str__(self):
        return self.addDate.strftime('%y-%m-%d %H:%M')
