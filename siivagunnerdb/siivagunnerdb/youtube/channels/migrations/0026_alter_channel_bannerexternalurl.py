# Generated by Django 3.2.23 on 2024-04-21 18:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0025_auto_20230423_1514'),
    ]

    operations = [
        migrations.AlterField(
            model_name='channel',
            name='bannerExternalUrl',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
    ]
