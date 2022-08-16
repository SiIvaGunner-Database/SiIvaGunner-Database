from django.contrib import admin
from .models import Collective

class CollectiveAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'addDate', 'updateDate', 'visible',)
    search_fields = ('id', 'title', 'addDate', 'updateDate',)

admin.site.register(Collective, CollectiveAdmin)
