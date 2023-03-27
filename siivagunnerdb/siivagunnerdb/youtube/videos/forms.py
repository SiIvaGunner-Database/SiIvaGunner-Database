from django import forms
from django.utils.translation import gettext_lazy as _
from . import models


class AddVideo(forms.ModelForm):
    class Meta:
        model = models.Video
        fields =  ['title', 'id', 'description', 'publishedAt',]
        labels = {
            'id': _('Video ID'),
            'publishedAt': _('Upload Date'),
        }
