# Generated by Django 3.2.4 on 2022-08-01 01:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.CharField(max_length=34, primary_key=True, serialize=False)),
                ('publishedAt', models.DateTimeField()),
                ('title', models.CharField(blank=True, default='', max_length=100)),
                ('description', models.TextField(blank=True, default='')),
                ('thumbnails', models.JSONField(blank=True, default='')),
                ('channelTitle', models.CharField(blank=True, default='', max_length=100)),
                ('defaultLanguage', models.CharField(blank=True, default='', max_length=50)),
                ('localized', models.JSONField(blank=True, default='')),
                ('itemCount', models.PositiveIntegerField()),
            ],
        ),
    ]
