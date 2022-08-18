from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Collective


@admin.register(Collective)
class CollectiveAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)
