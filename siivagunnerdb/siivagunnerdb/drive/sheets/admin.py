from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Spreadsheet, Sheet


@admin.register(Spreadsheet)
class SpreadsheetAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)

@admin.register(Sheet)
class SheetAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)
