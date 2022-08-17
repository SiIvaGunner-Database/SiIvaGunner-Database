from django import forms
from .models import Report


class ReportAddForm(forms.ModelForm):
    class Meta:
        model = Report
        fields =  ['description',]
