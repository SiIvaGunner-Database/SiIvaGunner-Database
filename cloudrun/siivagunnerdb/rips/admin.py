from django.contrib import admin
from .models import Rip

class RipAdmin(admin.ModelAdmin):
    list_display = ('title', 'id', 'addDate', 'visible',)
    search_fields = ('title', 'id', 'addDate',)

admin.site.register(Rip, RipAdmin)
