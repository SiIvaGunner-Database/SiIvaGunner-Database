# Generated by Django 3.2.4 on 2022-08-18 19:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0004_auto_20220818_1102'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='title',
            field=models.CharField(blank=True, default='placeholder', max_length=100),
        ),
    ]
