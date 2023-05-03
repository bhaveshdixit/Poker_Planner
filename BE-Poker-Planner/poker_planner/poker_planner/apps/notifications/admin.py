from django.contrib import admin

from poker_planner.apps.notifications import models as notifications_models


admin.site.register(notifications_models.Notification)
