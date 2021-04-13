from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.text import slugify
from .models import Report
from . import forms



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
