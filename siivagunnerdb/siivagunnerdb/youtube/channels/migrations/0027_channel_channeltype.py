# Generated by Django 3.2.25 on 2024-10-13 19:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0026_alter_channel_bannerexternalurl'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='channelType',
            field=models.CharField(blank=True, choices=[('Original', 'Original'), ('Derivative', 'Derivative'), ('Influenced', 'Influenced')], default='', max_length=20),
        ),
    ]
