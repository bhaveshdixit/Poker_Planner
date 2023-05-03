from rest_framework import serializers as rest_serializers

from poker_planner.apps.poker_boards import (
    models as poker_boards_models,
    constants as poker_boards_constants,
)
from poker_planner.apps.tickets import serializers as tickets_serializers


class PokerBoardCreationSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for creating a pokerboard with some basic details
    """

    name = rest_serializers.CharField(write_only=True)
    description = rest_serializers.CharField(write_only=True)
    estimation_time = rest_serializers.IntegerField(
        min_value=0, write_only=True)
    estimation_type = rest_serializers.IntegerField(
        min_value=0, max_value=3, write_only=True
    )

    class Meta:
        model = poker_boards_models.PokerBoard
        fields = (
            "id", "name", "description", "estimation_time", "estimation_type"
        )

    def create(self, validated_data):
        user = self.context["request"].user
        pokerboard = poker_boards_models.PokerBoard.objects.create(
            manager=user, **validated_data
        )

        return pokerboard


class PokerBoardBasicSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for fetching basic details of the pokerboard
    """

    status = rest_serializers.CharField(
        source="get_status_display", read_only=True)
    manager_name = rest_serializers.SerializerMethodField()

    class Meta:
        model = poker_boards_models.PokerBoard
        fields = ("id", "name", "manager_name", "status")
        read_only_fields = ("id", "name", "manager_name", "status")

    def get_manager_name(self, obj):
        return f"{obj.manager.first_name} {obj.manager.last_name}"


class PokerBoardDashboardDetails(PokerBoardBasicSerializer):
    """
    Poker Board Details Serializer with fields to be shown in dashboard
    """

    class Meta(PokerBoardBasicSerializer.Meta):
        fields = PokerBoardBasicSerializer.Meta.fields + ("description",)


class PokerBoardUpdateSerializer(rest_serializers.ModelSerializer):
    """
    Serializer to update poker board details
    """

    class Meta:
        model = poker_boards_models.PokerBoard
        optional_fields = "__all__"
        exclude = ["users", "created_at", "updated_at"]


class PokerBoardTicketsSerializer(PokerBoardDashboardDetails):
    """
    Serializer to get boards details and tickets estimated in it
    """
    estimation_type = rest_serializers.CharField(
        source='get_estimation_type_display'
    )
    tickets = tickets_serializers.TicketDashboardViewSerializer(
        source='board_tickets', many=True
    )

    class Meta(PokerBoardDashboardDetails.Meta):
        fields = PokerBoardDashboardDetails.Meta.fields + (
            'estimation_time', 'estimation_type', 'tickets'
        )
