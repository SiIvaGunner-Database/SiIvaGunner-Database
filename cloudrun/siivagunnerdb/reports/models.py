from django.contrib.auth.models import User
from django.db import models, migrations

class Report(models.Model):
    description = models.TextField()
    addDate = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, default=None)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return self.addDate.strftime("%y-%m-%d %H:%M")
