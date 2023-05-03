from django.conf import settings
from django.template.loader import render_to_string

from poker_planner.apps.accounts import models as accounts_models
from poker_planner.apps.common import tasks as common_tasks
from poker_planner.apps.notifications import constants as notifications_constants
from poker_planner.apps.notifications import models as notifications_models
from poker_planner.apps.poker_boards import models as poker_boards_models


def send_invitation_mail(email, token_key, invitor):
    subject = notifications_constants.INVITATION_MAIL_SUBJECT
    message = render_to_string('invitation_mail.txt', {
        'fe_base_url': settings.FRONTEND_BASE_URL,
        'token_key': token_key,
        'invitor': invitor
    })
    recipient_list = [email]
    common_tasks.send_mail_to_user.apply_async(
        args=[subject, message, recipient_list]
    )


def add_poker_board_user_from_notification(notification, status):
    if (
        notification.type == notifications_models.Notification.BOARD_INVITE
        and status == notifications_models.Notification.ACCEPTED
    ):
        invitation = notification.invitation
        user = accounts_models.User.objects.get(email=notification.email)
        poker_boards_models.PokerBoardUser.objects.create(
            poker_board=invitation.board, user=user, user_role=invitation.role
        )


def send_reset_password_mail(email, token_key):
    """
    Util to send password reset mail that accepts arguments user email and user token whose password is to be reset
    """
    subject = notifications_constants.RESET_PASSWORD_MAIL_SUBJECT
    message = render_to_string('reset_password_mail.txt', {
        'fe_base_url': settings.FRONTEND_BASE_URL,
        'token_key': token_key,
    })
    recipient_list = [email]
    common_tasks.send_mail_to_user.apply_async(
        args=[subject, message, recipient_list]
    )
