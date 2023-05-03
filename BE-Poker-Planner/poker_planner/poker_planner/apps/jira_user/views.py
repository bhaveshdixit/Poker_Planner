from rest_framework import generics as rest_generics

from poker_planner.apps.jira_user import serializer as jira_user_serializer


class JiraCredentialsAPIView(rest_generics.CreateAPIView):
    """
    APIView for saving JIRA credentials of a user
    """

    serializer_class = jira_user_serializer.JiraCredentialsSerializer
