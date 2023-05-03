# Generated by Django 2.2.10 on 2023-04-16 06:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('poker_boards', '0001_initial'),
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('email', models.EmailField(max_length=254)),
                ('role', models.IntegerField(choices=[(0, 'participant'), (1, 'spectator')], default=0)),
                ('board', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitation', to='poker_boards.PokerBoard')),
                ('notification', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='invitation', to='notifications.Notification')),
            ],
            options={
                'unique_together': {('board', 'email')},
            },
        ),
    ]
