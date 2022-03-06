# Generated by Django 3.2.4 on 2021-11-20 00:39

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0013_auto_20211119_1739'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('rips', '0020_auto_20210310_1127'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rip',
            name='slug',
        ),
        migrations.AlterField(
            model_name='rip',
            name='author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='rip',
            name='channel',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='channels.channel'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='rip',
            name='commentCount',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='rip',
            name='description',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='rip',
            name='dislikeCount',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='rip',
            name='length',
            field=models.CharField(max_length=10),
        ),
        migrations.AlterField(
            model_name='rip',
            name='likeCount',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='rip',
            name='uploadDate',
            field=models.DateTimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='rip',
            name='videoId',
            field=models.CharField(max_length=11),
        ),
        migrations.AlterField(
            model_name='rip',
            name='videoStatus',
            field=models.CharField(choices=[('Public', 'Public'), ('Unlisted', 'Unlisted'), ('Unavailable', 'Unavailable'), ('Private', 'Private'), ('Deleted', 'Deleted')], max_length=20),
        ),
        migrations.AlterField(
            model_name='rip',
            name='viewCount',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='rip',
            name='visible',
            field=models.BooleanField(blank=True, default=False),
        ),
        migrations.AlterField(
            model_name='rip',
            name='wikiStatus',
            field=models.CharField(choices=[('Documented', 'Documented'), ('Undocumented', 'Undocumented')], max_length=20),
        ),
    ]