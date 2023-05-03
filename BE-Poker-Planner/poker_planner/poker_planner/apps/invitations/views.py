from rest_framework.generics import ListAPIView

from poker_planner.apps.invitations import (
    models as invitations_models,
    serializers as invitations_serializers,
)


class GetInvitationsAPIView(ListAPIView):
    """
    API View for listing the status of the invitations of the user for that particular pokerboard
    """

    queryset = (
        invitations_models.Invitation.objects.only("id", "board", "notification")
        .select_related("notification", "board", "board__manager")
        .order_by("-id")
    )

    def filter_queryset(self, queryset):
        return super().filter_queryset(queryset)

    serializer_class = invitations_serializers.GetInvitationsSerializer

    def filter_queryset(self, queryset):
        return queryset.filter(email=self.request.user.email, notification__status=0)
