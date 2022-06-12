from django.contrib.auth.models import User
from django.db import models

class Report(models.Model):
    #  Normal fields
    description = models.TextField()

    #  Hidden fields
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    resolved = models.BooleanField(blank=True, default=False)
    notes = models.TextField(null=True)
    addDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.addDate.strftime("%y-%m-%d %H:%M")
