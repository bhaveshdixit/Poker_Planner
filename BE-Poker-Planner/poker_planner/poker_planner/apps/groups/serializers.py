from rest_framework import serializers as rest_serializers

from poker_planner.apps.accounts import models as accounts_models
from poker_planner.apps.groups import models as groups_models


class GroupDashboardViewSerializer(rest_serializers.ModelSerializer):
    """
    Group Serializer with fields to be displayed in dashbaord of a user
    """
    existing_member_count = rest_serializers.IntegerField()
    admin_name = rest_serializers.SerializerMethodField()

    class Meta:
        model = groups_models.Group
        fields = ("name", "admin_name", "existing_member_count")

    def get_admin_name(self, obj):
        admin = obj.admin
        return f"{admin.first_name} {admin.last_name}"


class UserGroupsSerializer(rest_serializers.ModelSerializer):
    """
    Serializer to get id and name of groups used when inviting groups for poker board
    """
    
    class Meta:
        model = groups_models.Group
        fields = ('id', 'name')


class CreateGroupSerializer(rest_serializers.Serializer):
    name = rest_serializers.CharField()
    members = rest_serializers.ListField(
        child=rest_serializers.IntegerField(), write_only=True
    )
    members_added = rest_serializers.ListField(read_only=True)

    class Meta:
        fields = ('name', 'members')

    def create(self, validated_data):
        users = accounts_models.User.objects.filter(
            pk__in=validated_data['members']
        )
        admin = self.context['request'].user
        group = groups_models.Group.objects.create(
            name=validated_data['name'], admin=admin
        )
        user_list = []
        if admin.id not in validated_data['members']:
            user_list.append(groups_models.GroupMember(
                member=admin, group=group
            ))
        members_added = []
        for user in users:
            user_list.append(groups_models.GroupMember(
                member=user, group=group
            ))
            members_added.append(user.id)
        groups_models.GroupMember.objects.bulk_create(user_list)
        return {'name': group.name, 'members_added': members_added}
