from django.db import models

from poker_planner.apps.common import models as common_models
from poker_planner.apps.notifications import constants as notifications_constants


class Notification(common_models.TimeStampedModel):
    """
    Invitations model with required fields
    """

    SIGNUP = 0
    BOARD_INVITE = 1
    CHANGE_PASS = 2
    TYPE_CHOICES = [
        (SIGNUP, "sign up token"),
        (BOARD_INVITE, "poker board invitation"),
        (CHANGE_PASS, "change password"),
    ]

    INVITED = 0
    ACCEPTED = 1
    REJECTED = 2
    STATUS_CHOICES = [
        (INVITED, "invited"),
        (ACCEPTED, "accepted"),
        (REJECTED, "rejected"),
    ]

    key = models.CharField(max_length=notifications_constants.TOKEN_LENGTH)
    email = models.EmailField()
    type = models.IntegerField(choices=TYPE_CHOICES)
    status = models.IntegerField(choices=STATUS_CHOICES, default=INVITED)

    def __str__(self) -> str:
        return f"Notification Model Instance with email {self.email} and status {self.get_status_display()}"
