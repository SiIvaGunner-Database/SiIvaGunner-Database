from django.db import migrations

# PostgreSQL trigram indexes that let the video search's icontains lookups use an index.
# Django runs icontains on PostgreSQL as UPPER("column"::text) LIKE UPPER('%term%'),
# so each index is built on that exact expression. Skipped on other databases (e.g. local SQLite).
INDEXES = {
    'videos_video_title_trgm': 'title',
    'videos_video_id_trgm': 'id',
}


def createIndexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    for name, column in INDEXES.items():
        schema_editor.execute(
            f'CREATE INDEX IF NOT EXISTS "{name}" ON "videos_video" USING gin (UPPER("{column}"::text) gin_trgm_ops)'
        )


def dropIndexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    for name in INDEXES:
        schema_editor.execute(f'DROP INDEX IF EXISTS "{name}"')


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0012_video_videos_video_lower_title'),
    ]

    operations = [
        # The pg_trgm extension is left installed on reverse, since other objects may depend on it
        migrations.RunPython(createIndexes, dropIndexes),
    ]
