from django.contrib.auth import get_user_model
from django.db import models

from poker_planner.apps.common import models as common_models
from poker_planner.apps.poker_boards import constants as poker_boards_constants


class PokerBoard(common_models.TimeStampedModel):
    """
    Poker Board Model representing a session of poker planning
    """

    CREATED = 0
    ADDED_TICKETS = 1
    INVITED_USERS = 2
    STARTED = 3
    FINISHED = 4
    STATUS_CHOICES = [
        (CREATED, 'created'),
        (ADDED_TICKETS, 'added tickets'),
        (INVITED_USERS, 'invited users'),
        (STARTED, 'started'),
        (FINISHED, 'finished')
    ]

    ODD = 0
    EVEN = 1
    FIBONACCI = 2
    CUSTOM = 3
    ESTIMATION_TYPE_CHOICES = [
        (ODD, 'Odd'),
        (EVEN, 'Even'),
        (FIBONACCI, 'Fibonacci'),
        (CUSTOM, 'Custom')
    ]

    name = models.CharField(
        max_length=poker_boards_constants.POKER_BOARD_NAME_LENGTH
    )
    description = models.TextField(help_text='Description of board')
    manager = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        help_text='Only owner of the board',
        related_name='owned_boards'
    )
    status = models.SmallIntegerField(
        choices=STATUS_CHOICES,
        default=CREATED,
        help_text='Status of the board: [created | added tickets | invited users | started | finished]'
    )
    users = models.ManyToManyField(
        get_user_model(),
        through='PokerBoardUser',
        related_name='participated_boards'
    )
    estimation_time = models.PositiveIntegerField(help_text='Time in seconds')
    estimation_type = models.SmallIntegerField(
        choices=ESTIMATION_TYPE_CHOICES, default=ODD
    )

    def __str__(self):
        return self.name


class PokerBoardUser(models.Model):
    """
    PokerBoardUser model for creating a throughtable between poker_board and user
    """

    PARTICIPANT = 0
    SPECTATOR = 1
    USER_ROLE_CHOICES = [
        (SPECTATOR, 'Spectator'),
        (PARTICIPANT, 'Participant')
    ]

    poker_board = models.ForeignKey(PokerBoard, on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    user_role = models.SmallIntegerField(
        choices=USER_ROLE_CHOICES, default=PARTICIPANT
    )

    class Meta:
        unique_together = ('poker_board', 'user')
