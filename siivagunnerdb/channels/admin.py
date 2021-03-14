from django.contrib import admin
from .models import Channel

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'addDate', 'visible',)

admin.site.register(Channel, ChannelAdmin)
