from django.contrib import admin


class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'shortDescription', 'addDate', 'updateDate', 'resolved',)
    search_fields = ('id', 'description', 'addDate', 'updateDate',)
