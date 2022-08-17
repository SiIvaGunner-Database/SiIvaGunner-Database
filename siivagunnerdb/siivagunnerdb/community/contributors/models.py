from django.contrib.auth.models import User
from django.db import models


class Contributor(models.Model):
    # Custom
    title = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')

    # Administration
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    visible = models.BooleanField(blank=True, default=False)
    notes = models.TextField(blank=True, default='')
    addDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
