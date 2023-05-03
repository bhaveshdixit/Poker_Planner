from django.urls import path

from poker_planner.apps.jira_user import views as jira_user_views

app_name = 'jira_user'

urlpatterns = [
    path(
        'create/',
        jira_user_views.JiraCredentialsAPIView.as_view(),
        name='save-jira-auth'
    ),
]
