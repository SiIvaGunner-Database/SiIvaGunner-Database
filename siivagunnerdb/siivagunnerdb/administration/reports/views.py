from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from rest_framework import viewsets
from urllib.parse import urlencode

from . import forms
from .models import Report
from .serializers import ReportSerializer


def reportAdd(request):
    """
    The report submission page.
    """
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


class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows reports to be viewed or edited.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
