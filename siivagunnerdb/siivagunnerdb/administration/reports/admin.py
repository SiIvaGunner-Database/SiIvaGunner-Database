from django.contrib import admin
from .models import Report


class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'shortDescription', 'addDate', 'updateDate', 'resolved',)
    search_fields = ('id', 'description', 'addDate', 'updateDate',)


admin.site.register(Report, ReportAdmin)
