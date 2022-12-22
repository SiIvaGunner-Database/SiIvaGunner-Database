from django.contrib import admin
from django.contrib.admin.models import LogEntry
from .models import Alert


class LogAdmin(admin.ModelAdmin):
    list_display = ('action_time', 'user', 'content_type', 'object_id', 'action_flag', 'change_message',)
    search_fields = ('action_time', 'user', 'object_id', 'action_flag', 'change_message',)

class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'shortDescription', 'addDate', 'updateDate',)
    search_fields = ('id', 'description', 'addDate', 'updateDate',)


admin.site.register(LogEntry, LogAdmin)
admin.site.register(Alert, AlertAdmin)
