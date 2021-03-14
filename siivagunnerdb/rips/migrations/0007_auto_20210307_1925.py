# Generated by Django 3.1.7 on 2021-03-08 02:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rips', '0006_auto_20210307_1906'),
    ]

    operations = [
        migrations.AddField(
            model_name='rip',
            name='commentCount',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AddField(
            model_name='rip',
            name='dislikeCount',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AddField(
            model_name='rip',
            name='length',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='rip',
            name='likeCount',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AddField(
            model_name='rip',
            name='videoStatus',
            field=models.CharField(blank=True, choices=[('Public', 'Public'), ('Unlisted', 'Unlisted'), ('Private', 'Private'), ('Deleted', 'Deleted'), ('Unavailable', 'Unavailable')], max_length=20),
        ),
        migrations.AddField(
            model_name='rip',
            name='viewCount',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='rip',
            name='wikiStatus',
            field=models.CharField(blank=True, choices=[('Documented', 'Documented'), ('Undocumented', 'Undocumented')], max_length=20),
        ),
        migrations.DeleteModel(
            name='Article',
        ),
    ]
