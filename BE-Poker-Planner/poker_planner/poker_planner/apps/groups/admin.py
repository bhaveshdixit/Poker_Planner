from django.contrib import admin
from django.contrib.auth.models import Group

from poker_planner.apps.groups import models as group_models

admin.site.unregister(Group)
admin.site.register(group_models.Group)
admin.site.register(group_models.GroupMember)
