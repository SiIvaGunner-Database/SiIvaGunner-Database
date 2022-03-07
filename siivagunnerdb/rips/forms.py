from django import forms
from django.utils.translation import gettext_lazy as _
from . import models

class AddRip(forms.ModelForm):
    class Meta:
        model = models.Rip
        fields =  ['title', 'id', 'description', 'uploadDate',]
        labels = {
            'id': _('Video ID'),
            'uploadDate': _('Upload Date'),
        }
