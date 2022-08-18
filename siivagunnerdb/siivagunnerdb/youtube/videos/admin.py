from django.contrib import admin
from reversion.admin import VersionAdmin
from .models import Video


@admin.register(Video)
class VideoAdmin(VersionAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)
