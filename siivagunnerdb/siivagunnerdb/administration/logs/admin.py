from django.contrib import admin
from django.contrib.admin.models import LogEntry


class LogAdmin(admin.ModelAdmin):
    list_display = ('action_time', 'user', 'content_type', 'object_id', 'action_flag', 'change_message',)
    search_fields = ('action_time', 'user', 'object_id', 'action_flag', 'change_message',)


admin.site.register(LogEntry, LogAdmin)
