# Generated by Django 3.1.14 on 2022-12-21 21:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sheets', '0003_spreadsheet'),
        ('channels', '0021_auto_20220918_1438'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='channel',
            name='developmentSheet',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='productionSheet',
        ),
        migrations.AddField(
            model_name='channel',
            name='developmentSpreadsheet',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='channels_dev_spreadsheet', to='sheets.spreadsheet'),
        ),
        migrations.AddField(
            model_name='channel',
            name='productionSpreadsheet',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='channels_prod_spreadsheet', to='sheets.spreadsheet'),
        ),
    ]
