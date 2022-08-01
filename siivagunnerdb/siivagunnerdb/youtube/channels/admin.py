from django.contrib import admin
from .models import Channel

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('title', 'id', 'addDate', 'visible',)
    search_fields = ('title', 'id', 'addDate',)

admin.site.register(Channel, ChannelAdmin)
