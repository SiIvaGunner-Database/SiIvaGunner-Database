# Generated by Django 3.2.18 on 2023-04-23 22:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contributors', '0003_auto_20220918_1311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contributor',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
