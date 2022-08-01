from django import forms
from django.utils.translation import gettext_lazy as _
from . import models

class AddChannel(forms.ModelForm):
    class Meta:
        model = models.Channel
        fields =  ['title', 'id', 'description', 'publishedAt',]
        labels = {
            'id': _('Channel ID'),
            'publishedAt': _('Join Date'),
        }
