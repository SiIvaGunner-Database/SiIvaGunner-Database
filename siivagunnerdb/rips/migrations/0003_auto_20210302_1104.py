# Generated by Django 3.1.7 on 2021-03-02 18:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rips', '0002_auto_20210302_1049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='thumbnail',
            field=models.ImageField(blank=True, default='default.jpg', upload_to=''),
        ),
    ]
