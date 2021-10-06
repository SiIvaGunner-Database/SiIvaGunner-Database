from django.shortcuts import render

def generate(request):
    return render(request, 'generate.html')
