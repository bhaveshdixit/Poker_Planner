from rest_framework import serializers as rest_serializers

from poker_planner.apps.invitations import models as invitations_models
from poker_planner.apps.poker_boards import serializers as poker_boards_serializers


class GetInvitationsSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for checking the invitation status of the user for that particular poker board
    """

    board = poker_boards_serializers.PokerBoardBasicSerializer(read_only=True)
    status = rest_serializers.CharField(source="notification.get_status_display")
    key = rest_serializers.CharField(source="notification.key", read_only=True)

    class Meta:
        model = invitations_models.Invitation
        fields = ("id", "board", "key", "status")
