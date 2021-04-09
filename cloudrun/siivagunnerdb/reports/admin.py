from django.contrib import admin
from .models import Report

class ReportAdmin(admin.ModelAdmin):
    list_display = ('addDate', 'resolved',)

admin.site.register(Report, ReportAdmin)
