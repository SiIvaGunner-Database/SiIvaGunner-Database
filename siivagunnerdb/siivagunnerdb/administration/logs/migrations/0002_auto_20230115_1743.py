# Generated by Django 3.1.14 on 2023-01-16 00:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logs', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alert',
            name='description',
            field=models.TextField(),
        ),
    ]
