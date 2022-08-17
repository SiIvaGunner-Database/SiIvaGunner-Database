from django import forms
from . import models


class AddReport(forms.ModelForm):
    class Meta:
        model = models.Report
        fields =  ['description',]
