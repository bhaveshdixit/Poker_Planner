from poker_planner.apps.poker_boards import models as poker_boards_models
from poker_planner.apps.tickets import models as tickets_models
from rest_framework import serializers as rest_serializers


class BulkCreateTicketSerializer(rest_serializers.ListSerializer):
    def create(self, validated_data):
        tickets = [tickets_models.Ticket(**item) for item in validated_data]
        return tickets_models.Ticket.objects.bulk_create(tickets)


class TicketSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for savings the details of the tickets
    """

    EPIC = 0
    STORY = 1
    TASK = 2
    BUG = 3
    SUBTASK = 4
    TICKET_TYPE_CHOICES = [
        (EPIC, "Epic"),
        (STORY, "Story"),
        (TASK, "Task"),
        (BUG, "Bug"),
        (SUBTASK, "Subtask"),
    ]

    jira_ticket_id = rest_serializers.CharField(write_only=True)
    summary = rest_serializers.CharField(write_only=True)
    description = rest_serializers.CharField(allow_null=True, write_only=True)
    ticket_type = rest_serializers.ChoiceField(
        choices=TICKET_TYPE_CHOICES, write_only=True
    )
    poker_board = rest_serializers.PrimaryKeyRelatedField(
        queryset=poker_boards_models.PokerBoard.objects.all(), write_only=True
    )
    index = rest_serializers.IntegerField(min_value=0, write_only=True)

    class Meta:
        model = tickets_models.Ticket
        fields = (
            "summary",
            "jira_ticket_id",
            "description",
            "ticket_type",
            "poker_board",
            "index",
        )
        list_serializer_class = BulkCreateTicketSerializer

    def validate(self, attrs):
        jira_ticket_id = attrs["jira_ticket_id"]
        ticket = tickets_models.Ticket.objects.filter(
            jira_ticket_id=jira_ticket_id
        ).first()

        if ticket is not None:
            raise rest_serializers.ValidationError(
                f"Ticket with ID {jira_ticket_id} Already exist"
            )

        return attrs


class TicketDashboardViewSerializer(rest_serializers.ModelSerializer):
    """
    Ticket Serializer with fields to be shown in dashboard
    """

    ticket_type_display = rest_serializers.CharField(
        source="get_ticket_type_display"
    )


    class Meta:
        model = tickets_models.Ticket
        fields = (
            "summary", 
            "description", 
            "jira_ticket_id",      
            "ticket_type_display", 
            "final_estimate"
        )
