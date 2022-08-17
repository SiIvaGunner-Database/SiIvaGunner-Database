from django.shortcuts import render


def generate(request):
    return render(request, 'generate.html')


def token(request):
    return render(request, 'token.html')
