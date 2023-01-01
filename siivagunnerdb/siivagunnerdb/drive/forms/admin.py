from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Form


@admin.register(Form)
class FormAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)
