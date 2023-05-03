from rest_framework import generics as rest_generics

from poker_planner.apps.groups import serializers as groups_serializers


class CreatGroupView(rest_generics.CreateAPIView, rest_generics.ListAPIView):
    def get_queryset(self):
        return self.request.user.member_of_group

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return groups_serializers.CreateGroupSerializer
        return groups_serializers.UserGroupsSerializer
