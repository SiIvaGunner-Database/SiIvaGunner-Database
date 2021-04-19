from django import forms
from django.utils.translation import gettext_lazy as _
from . import models

class AddChannel(forms.ModelForm):
    class Meta:
        model = models.Channel
        fields =  ['name', 'channelId', 'description', 'joinDate',]
        labels = {
            'channelId': _('Channel ID'),
            'joinDate': _('Join Date'),
        }
