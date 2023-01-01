from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Report


@admin.register(Report)
class ReportAdmin(VersionAdmin):
    list_display = ('id', 'shortDescription', 'addDate', 'updateDate', 'resolved',)
    search_fields = ('id', 'description', 'addDate', 'updateDate',)
