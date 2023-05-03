from django.db import transaction

from rest_framework import generics as rest_generics
from rest_framework.permissions import AllowAny

from poker_planner.apps.notifications import models as notifications_models
from poker_planner.apps.notifications import serializers as notifications_serializers


class GetEmailAPIView(rest_generics.RetrieveAPIView):
    """
    APIView for fetching the email id
    """

    permission_classes = [AllowAny]
    serializer_class = notifications_serializers.GetEmailSerailzer
    queryset = notifications_models.Notification.objects.all()
    lookup_field = "key"


class InviteUsersAPIView(rest_generics.CreateAPIView):
    """
    APIView for sending the invitation to the user of a particular role i.e participant or spectator
    """

    serializer_class = notifications_serializers.InviteUserSerializer


class UpdateStatusAPIView(rest_generics.UpdateAPIView):
    """
    APIView for updating the status of the invitation of the user
    """

    queryset = notifications_models.Notification.objects.select_related('invitation__board')
    serializer_class = notifications_serializers.UpdateStatusSerializer

    def get_object(self):
        return self.get_queryset().filter(key=self.request.data["key"]).first()

    def get_serializer_context(self):
        context = super(UpdateStatusAPIView, self).get_serializer_context()
        context["key"] = context["request"].data["key"]
        return context

class ForgotPasswordAPIView(rest_generics.CreateAPIView):
    """
    View for creating a notification instance corresponding to a user
    Request format : {email of user whose password is to be reset}
    Response : {}
    """
    permission_classes = []
    serializer_class = notifications_serializers.ForgotPasswordSerializer
