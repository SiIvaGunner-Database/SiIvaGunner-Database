from django.contrib import admin
from .models import Rip

class RipAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'addDate', 'visible',)

admin.site.register(Rip, RipAdmin)
