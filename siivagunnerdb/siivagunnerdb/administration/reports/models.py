from django.contrib.auth.models import User
from django.db import models


class Report(models.Model):
    # Custom
    description = models.TextField()
    resolution = models.TextField(blank=True, default='')
    resolved = models.BooleanField(blank=True, default=False)

    # Administration
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    notes = models.TextField(blank=True, default='')
    addDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.addDate.strftime('%y-%m-%d %H:%M')
