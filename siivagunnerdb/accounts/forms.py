from django import forms
from . import models
from django.contrib.auth.models import User

class ChangeUsername(forms.ModelForm):
    class Meta:
        model = User
        fields =  ['username',]
