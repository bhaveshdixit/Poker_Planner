from django.contrib import admin

from poker_planner.apps.invitations import models as invitation_models


admin.site.register(invitation_models.Invitation)
