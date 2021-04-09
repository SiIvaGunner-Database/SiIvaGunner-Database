from django import forms
from . import models

class AddChannel(forms.ModelForm):
    class Meta:
        model = models.Channel
        fields =  ['name', 'channelId', 'description', 'joinDate',]
