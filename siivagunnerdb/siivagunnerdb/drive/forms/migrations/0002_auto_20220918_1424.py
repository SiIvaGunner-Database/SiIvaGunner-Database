# Generated by Django 3.1.14 on 2022-09-18 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='form',
            name='id',
            field=models.CharField(max_length=44, primary_key=True, serialize=False),
        ),
    ]