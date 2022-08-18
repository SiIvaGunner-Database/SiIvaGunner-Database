from django.contrib import admin
from .models import Report


class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'addDate', 'updateDate', 'resolved',)
    search_fields = ('id', 'addDate', 'updateDate',)


admin.site.register(Report, ReportAdmin)
