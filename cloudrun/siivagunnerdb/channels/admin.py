from django.contrib import admin
from .models import Channel

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'addDate', 'visible',)
    search_fields = ('name', 'id', 'addDate',)

admin.site.register(Channel, ChannelAdmin)
