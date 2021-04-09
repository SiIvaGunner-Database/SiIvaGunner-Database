from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

def about(request):
    return render(request, 'about.html')

def generate(request):
    return render(request, 'generate.html')

def report(request):
    return render(request, 'report.html')
