# Generated by Django 3.2.4 on 2022-08-16 23:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0016_auto_20220731_1837'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='notes',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='channel',
            name='updateDate',
            field=models.DateTimeField(auto_now=True),
        ),
    ]