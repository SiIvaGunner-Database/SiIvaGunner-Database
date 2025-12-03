from django.contrib import admin
from .models import Spreadsheet
from .models import Sheet


class SpreadsheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)


class SheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)


admin.site.register(Spreadsheet, SpreadsheetAdmin)
admin.site.register(Sheet, SheetAdmin)
