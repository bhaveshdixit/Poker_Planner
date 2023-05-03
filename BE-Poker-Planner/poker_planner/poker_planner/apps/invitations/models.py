from django.db import models

from poker_planner.apps.common import models as common_models
from poker_planner.apps.notifications import models as notifications_models
from poker_planner.apps.poker_boards import models as poker_boards_models


class Invitation(common_models.TimeStampedModel):
    """
    Invitations model with required fields
    """

    PARTICIPANT = 0
    SPECTATOR = 1
    ROLE_CHOICES = [(PARTICIPANT, "participant"), (SPECTATOR, "spectator")]

    notification = models.OneToOneField(
        notifications_models.Notification,
        related_name="invitation",
        on_delete=models.CASCADE,
    )
    board = models.ForeignKey(
        poker_boards_models.PokerBoard,
        related_name="invitation",
        on_delete=models.CASCADE,
    )
    email = models.EmailField()
    role = models.IntegerField(choices=ROLE_CHOICES, default=PARTICIPANT)

    class Meta:
        unique_together = ("board", "email")

    def __str__(self) -> str:
        return f"Invitation Model Instance with Email {self.email}"
