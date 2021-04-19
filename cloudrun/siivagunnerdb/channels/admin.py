from django.contrib import admin
from .models import Channel

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'addDate', 'visible',)
    search_fields = ('name', 'slug', 'addDate',)

admin.site.register(Channel, ChannelAdmin)
