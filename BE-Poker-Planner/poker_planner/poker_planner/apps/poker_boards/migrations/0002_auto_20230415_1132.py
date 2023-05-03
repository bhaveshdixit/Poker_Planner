# Generated by Django 2.2.10 on 2023-04-15 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('poker_boards', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pokerboarduser',
            name='user_role',
            field=models.SmallIntegerField(choices=[(1, 'Spectator'), (0, 'Participant')], default=0),
        ),
    ]
