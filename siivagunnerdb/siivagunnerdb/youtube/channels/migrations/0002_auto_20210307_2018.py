# Generated by Django 3.1.7 on 2021-03-08 03:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='channel',
            name='addDate',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='author',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='channelId',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='channelStatus',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='description',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='publishedAt',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='profilePicture',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='slug',
        ),
        migrations.RemoveField(
            model_name='channel',
            name='subscriberCount',
        ),
    ]
