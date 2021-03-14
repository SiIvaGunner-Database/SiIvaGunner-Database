# Generated by Django 3.1.7 on 2021-03-08 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rips', '0011_auto_20210307_2003'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rip',
            name='commentCount',
            field=models.PositiveIntegerField(blank=True),
        ),
        migrations.AlterField(
            model_name='rip',
            name='dislikeCount',
            field=models.PositiveIntegerField(blank=True),
        ),
        migrations.AlterField(
            model_name='rip',
            name='likeCount',
            field=models.PositiveIntegerField(blank=True),
        ),
        migrations.AlterField(
            model_name='rip',
            name='slug',
            field=models.SlugField(max_length=100),
        ),
        migrations.AlterField(
            model_name='rip',
            name='viewCount',
            field=models.PositiveIntegerField(blank=True),
        ),
    ]
