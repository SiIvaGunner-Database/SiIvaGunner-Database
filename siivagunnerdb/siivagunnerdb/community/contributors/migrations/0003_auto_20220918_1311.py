# Generated by Django 3.1.14 on 2022-09-18 20:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contributors', '0002_alter_contributor_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contributor',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
