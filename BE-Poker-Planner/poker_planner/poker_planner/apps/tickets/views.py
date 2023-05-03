from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics as rest_generics
from rest_framework import serializers as rest_serializers
from rest_framework.views import APIView

from poker_planner.apps.jira_user import models as jira_user_models
from poker_planner.apps.tickets import utils as tickets_utils
from poker_planner.apps.tickets import utils as tickets_utils
from poker_planner.apps.tickets import serializers as tickets_serializers
from poker_planner.apps.poker_boards import models as poker_boards_models


class TicketCreateView(rest_generics.CreateAPIView):
    serializer_class = tickets_serializers.TicketSerializer

    def get_serializer(self, *args, **kwargs):
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True

        return super(TicketCreateView, self).get_serializer(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        board = poker_boards_models.PokerBoard.objects.get(id=kwargs["board_id"])

        if isinstance(request.data, list):
            for item in request.data:
                item["poker_board"] = board.id
        else:
            raise rest_serializers.ValidationError("Invalid Input")

        board.status = board.ADDED_TICKETS
        board.save()
        return super(TicketCreateView, self).post(request, *args, **kwargs)


class TicketFetchingAPIView(APIView):
    """
    APIView for fetcing the details of the ticket
    """

    def post(self, request, *args, **kwargs):
        user = request.user
        user_jira_credentials = jira_user_models.JiraUser.objects.get(user=user)
        jira_ticket_response = tickets_utils.get_tickets(
            request.data["jql"], user_jira_credentials
        )
        if jira_ticket_response["status"] != 200:
            print("in")
            return Response(
                jira_ticket_response["data"],
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(jira_ticket_response["data"])
