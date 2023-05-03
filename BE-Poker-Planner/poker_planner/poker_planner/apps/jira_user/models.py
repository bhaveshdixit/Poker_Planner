from django.db import models
from django.contrib.auth import get_user_model

from poker_planner.apps.jira_user import constants as jira_user_constants


class JiraUser(models.Model):
    """
    Invitations model with required fields
    """

    user = models.OneToOneField(
        get_user_model(), on_delete=models.CASCADE, related_name="jira_credentials"
    )
    baseurl = models.CharField(max_length=jira_user_constants.JIRA_URL_LENGTH)
    username = models.CharField(max_length=jira_user_constants.USERNAME_LENGTH)
    token = models.CharField(max_length=jira_user_constants.JIRA_TOKEN_LENGTH)
