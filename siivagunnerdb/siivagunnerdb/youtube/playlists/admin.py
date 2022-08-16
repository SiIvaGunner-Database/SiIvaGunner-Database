from django.contrib import admin
from .models import Playlist

class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)

admin.site.register(Playlist, PlaylistAdmin)
