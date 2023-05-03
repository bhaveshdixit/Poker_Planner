from django.contrib.auth import get_user_model
from django.db import models
from poker_planner.apps.common import models as commons_models
from poker_planner.apps.groups import constants as groups_constants


class Group(commons_models.TimeStampedModel):
    """
    Poker group model with the required fields and have the many to many relationship with the poker user
    """

    name = models.CharField(
        max_length=groups_constants.GROUP_NAME_LENGTH, help_text="Name of the Group"
    )
    admin = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        help_text="only owner of the group",
        related_name="owned_group",
    )
    members = models.ManyToManyField(
        get_user_model(),
        related_name='member_of_group',
        through='GroupMember'
    )

    def __str__(self):
        return f'{self.id} {self.name}'


class GroupMember(commons_models.TimeStampedModel):
    member = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('member', 'group')

    def __str__(self):
        return f'{self.group} - {self.member}'
