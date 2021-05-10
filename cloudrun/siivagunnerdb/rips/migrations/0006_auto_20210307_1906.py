# Generated by Django 3.1.7 on 2021-03-08 02:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('rips', '0005_article_author'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rip',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('slug', models.SlugField()),
                ('videoId', models.CharField(blank=True, max_length=11)),
                ('description', models.TextField(blank=True)),
                ('wikiStatus', models.CharField(blank=True, choices=[('Dcumented', 'Dcumented'), ('Undocumented', 'Undocumented')], max_length=12)),
                ('thumbnail', models.ImageField(blank=True, default='default.png', upload_to='')),
                ('uploadDate', models.DateTimeField(blank=True)),
                ('addDate', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(default=None, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]