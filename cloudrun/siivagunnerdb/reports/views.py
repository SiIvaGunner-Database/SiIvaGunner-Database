from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils.text import slugify

from rest_framework import viewsets
from rest_framework import permissions

from urllib.parse import urlencode

from . import forms
from .models import Report
from .serializers import ReportSerializer



# The report submission page
def reportAdd(request):
    if request.method == 'POST':
        form = forms.AddReport(request.POST, request.FILES)

        if form.is_valid():
            instance = form.save(commit=False)

            if request.user.is_authenticated:
                instance.author = request.user

            instance.save()
            return redirect('rips:list')
    else:
        form = forms.AddReport()

    return render(request, 'reports/reportAdd.html', { 'form':form })



# The report API viewset
class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows reports to be viewed or edited.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
