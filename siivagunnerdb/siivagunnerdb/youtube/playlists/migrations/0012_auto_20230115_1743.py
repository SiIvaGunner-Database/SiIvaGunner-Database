# Generated by Django 3.1.14 on 2023-01-16 00:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('playlists', '0011_auto_20230108_1851'),
    ]

    operations = [
        migrations.AlterField(
            model_name='playlist',
            name='title',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
