# Generated by Django 3.1.14 on 2023-01-16 00:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scripts', '0002_auto_20220918_1424'),
    ]

    operations = [
        migrations.AlterField(
            model_name='script',
            name='title',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]