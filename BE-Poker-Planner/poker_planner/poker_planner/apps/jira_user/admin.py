from django.contrib import admin

from poker_planner.apps.jira_user import models as jira_user_models


admin.site.register(jira_user_models.JiraUser)
