# Generated by Django 3.2.25 on 2024-08-04 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0008_auto_20230730_1321'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='wikiTitle',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
