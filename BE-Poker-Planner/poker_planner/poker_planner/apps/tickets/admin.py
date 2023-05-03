from django.contrib import admin

from poker_planner.apps.tickets import models as tickets_models


admin.site.register(tickets_models.Ticket)
admin.site.register(tickets_models.Estimate)
