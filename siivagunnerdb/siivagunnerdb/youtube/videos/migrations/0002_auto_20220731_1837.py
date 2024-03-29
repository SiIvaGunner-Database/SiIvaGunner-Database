# Generated by Django 3.2.4 on 2022-08-01 01:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='contentRating',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='video',
            name='localized',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='video',
            name='regionRestriction',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='video',
            name='tags',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name='video',
            name='thumbnails',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
