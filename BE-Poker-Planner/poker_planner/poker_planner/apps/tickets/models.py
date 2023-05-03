from django.contrib.auth import get_user_model
from django.db import models

from poker_planner.apps.common import models as common_models
from poker_planner.apps.poker_boards import models as poker_boards_models
from poker_planner.apps.tickets import constants as tickets_constants


class Ticket(common_models.TimeStampedModel):
    """
    Ticket model representing issue of JIRA
    """

    EPIC = 0
    STORY = 1
    TASK = 2
    BUG = 3
    SUBTASK = 4
    TICKET_TYPE_CHOICES = [
        (EPIC, "Epic"),
        (STORY, "Story"),
        (TASK, "Task"),
        (BUG, "Bug"),
        (SUBTASK, "Subtask"),
    ]

    jira_ticket_id = models.CharField(
        primary_key=True, max_length=tickets_constants.TICKET_ID_LENGTH
    )
    summary = models.CharField(max_length=tickets_constants.TICKET_SUMMARY_LENGTH)
    description = models.TextField(null=True)
    poker_board = models.ForeignKey(
        poker_boards_models.PokerBoard,
        on_delete=models.CASCADE,
        related_name="board_tickets",
    )
    users = models.ManyToManyField(
        get_user_model(), through="Estimate", related_name="user_tickets"
    )
    final_estimate = models.PositiveIntegerField(null=True)
    ticket_type = models.IntegerField(choices=TICKET_TYPE_CHOICES)
    index = models.PositiveIntegerField(
        help_text="This field is used for maintaining order of ticket per board"
    )

    def __str__(self):
        return self.jira_ticket_id


class Estimate(common_models.TimeStampedModel):
    """
    Estimate model for creating a throughtable between user and the ticket
    """

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    user_estimate = models.PositiveIntegerField()

    class Meta:
        unique_together = ("user", "ticket")

    def __str__(self):
        return f'{self.ticket.jira_ticket_id} -- {self.user.first_name} {self.user.last_name}'
