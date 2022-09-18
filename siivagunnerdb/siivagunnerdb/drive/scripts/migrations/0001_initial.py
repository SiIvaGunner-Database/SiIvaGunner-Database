# Generated by Django 3.1.14 on 2022-09-18 20:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Script',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('addDate', models.DateTimeField(auto_now_add=True)),
                ('updateDate', models.DateTimeField(auto_now=True)),
                ('visible', models.BooleanField(blank=True, default=False)),
                ('notes', models.TextField(blank=True, default='')),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, default='')),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
