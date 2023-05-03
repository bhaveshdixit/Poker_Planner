from rest_framework import (
    mixins as rest_mixins,
    viewsets as rest_viewsets,
)

from poker_planner.apps.poker_boards import (
    models as poker_boards_models,
    serializers as poker_boards_serializer,
    permissions as poker_boards_permissions
)


class PokerBoardViewSet(
    rest_mixins.CreateModelMixin,
    rest_mixins.RetrieveModelMixin,
    rest_mixins.UpdateModelMixin,
    rest_viewsets.GenericViewSet
):
    """
    APIView for creating, updating and retrieving the pokerboard
    """

    serializer_classes = {
        'GET': poker_boards_serializer.PokerBoardTicketsSerializer,
        'POST': poker_boards_serializer.PokerBoardCreationSerializer,
        'PATCH': poker_boards_serializer.PokerBoardUpdateSerializer,
        'PUT': poker_boards_serializer.PokerBoardUpdateSerializer
    }
    permission_classes_dict = {
        'GET': poker_boards_permissions.IsBoardMember,
        'PATCH': poker_boards_permissions.IsBoardOwner,
        'PUT': poker_boards_permissions.IsBoardOwner
    }

    queryset = poker_boards_models.PokerBoard.objects.all()

    def get_serializer_class(self, *args, **kwargs):
        return self.serializer_classes[self.request.method]

    def get_permissions(self):
        method = self.request.method
        self.permission_classes.append(
            self.permission_classes_dict[method]
        ) if method in self.permission_classes_dict.keys() else None
        return super().get_permissions()
