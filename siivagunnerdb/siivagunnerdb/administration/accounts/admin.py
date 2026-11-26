from django.contrib import admin
from .models import Favorite


class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'channel', 'addDate',)
    search_fields = ('user__username', 'video__id', 'video__title', 'channel__id', 'channel__title',)
    raw_id_fields = ('video', 'channel',)


admin.site.register(Favorite, FavoriteAdmin)
