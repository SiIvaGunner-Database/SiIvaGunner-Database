from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Contributor


@admin.register(Contributor)
class ContributorAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)
