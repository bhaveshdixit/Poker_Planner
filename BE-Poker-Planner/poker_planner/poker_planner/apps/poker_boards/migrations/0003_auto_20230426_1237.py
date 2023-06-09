# Generated by Django 2.2.10 on 2023-04-26 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('poker_boards', '0002_auto_20230415_1132'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pokerboard',
            name='status',
            field=models.SmallIntegerField(choices=[(0, 'created'), (1, 'added tickets'), (2, 'invited users'), (3, 'started'), (4, 'finished')], default=0, help_text='Status of the board: [created | added tickets | invited users | started | finished]'),
        ),
    ]
