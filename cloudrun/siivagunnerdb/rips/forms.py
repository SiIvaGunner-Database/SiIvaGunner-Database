from django import forms
from . import models

class AddRip(forms.ModelForm):
    class Meta:
        model = models.Rip
        fields =  ['title', 'videoId', 'description', 'uploadDate',]
