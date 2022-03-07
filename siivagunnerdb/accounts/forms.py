from django import forms
from django.contrib.auth.models import User
from . import models

class ChangeUsername(forms.ModelForm):
    class Meta:
        model = User
        fields =  ['username',]
