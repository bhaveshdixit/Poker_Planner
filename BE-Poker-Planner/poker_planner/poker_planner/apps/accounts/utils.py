from datetime import timedelta

from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

from rest_framework import serializers as rest_serializers
from rest_framework.authtoken.models import Token

from poker_planner.apps.accounts import constants as accounts_constants
from poker_planner.apps.common import tasks as common_tasks
from poker_planner.apps.notifications import models as notifications_models


def validate_token(token):
    """
    checking that token is expired or not and creating new token if expired
    """

    is_expired = (timezone.now() - token.created) > timedelta(
        seconds=accounts_constants.TOKEN_EXPIRED_AFTER_SECONDS
    )
    if is_expired:
        token.delete()
        token = Token.objects.create(user=token.user)

    return is_expired, token


def send_verification_mail(email, token_key):
    """
    Function for sending the verification mail to the user email id
    """
    subject = accounts_constants.VERIFICATION_MAIL_SUBJECT
    message = render_to_string('verification_mail.txt', {
        'fe_base_url': settings.FRONTEND_BASE_URL,
        'token_key': token_key
    })
    recipient_list = [email]
    common_tasks.send_mail_to_user.apply_async(
        args=[subject, message, recipient_list]
    )

def reset_password_validation(key):
    notification = notifications_models.Notification.objects.filter(key=key).first()

    if notification is None:
        raise rest_serializers.ValidationError({"message": accounts_constants.INVALID_PASSWORD_RESET_CODE})

    if (timezone.now() - notification.created_at).seconds > accounts_constants.RESET_KEY_EXPIRED_AFTER_SECONDS:
        raise rest_serializers.ValidationError(
            {"message": accounts_constants.RESET_PASSWORD_LINK_EXPIRED}
        )

    return notification.email
