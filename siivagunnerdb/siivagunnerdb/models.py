from django.contrib.auth.models import User
from django.db import models


class StandardModel(models.Model):
    addDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)
    visible = models.BooleanField(blank=True, default=False)
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        abstract=True
