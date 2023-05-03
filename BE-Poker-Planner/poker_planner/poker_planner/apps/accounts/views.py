from django.contrib.auth import get_user_model
from django.db.models import Count, Value
from django.db.models.functions import Concat
from django.shortcuts import get_object_or_404

from rest_framework import generics as rest_generics
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from poker_planner.apps.accounts import (
    serializers as accounts_serializers,
    constants as accounts_constants
)
from poker_planner.apps.common import utils as common_utils
from poker_planner.apps.groups import models as groups_models
from poker_planner.apps.groups import serializers as groups_serializers
from poker_planner.apps.poker_boards import serializers as poker_boards_serializers
from poker_planner.apps.tickets import serializers as tickets_serializers


class UserSearchAPIView(rest_generics.ListAPIView):
    """
    View to search users based on first_name and last_name fields
    """

    serializer_class = accounts_serializers.UserAllFieldsSerializer

    def get_queryset(self):
        search_query = self.request.query_params.get("search", "")
        if not search_query:
            return get_user_model().objects.none()

        return get_user_model().objects.annotate(
            name=Concat('first_name', Value(' '), 'last_name')
        ).filter(name__icontains=search_query, is_verified=True)


class UserCreateReadAPIView(rest_generics.CreateAPIView, rest_generics.RetrieveAPIView):
    """
    APIView for User Registration
    Request Expected Format : {first_name, last_name, email, password}
    Response Fromat : {message in both cases i.e errors and success}
    """

    serializer_class = accounts_serializers.UserSignupSerializer
    permission_classes_by_action = {
        "default": [IsAuthenticated],
        "create": [AllowAny],
    }

    def get_permissions(self):
        if self.request.method == "POST":
            return [
                permission()
                for permission in self.permission_classes_by_action["create"]
            ]
        return [
            permission() for permission in self.permission_classes_by_action["default"]
        ]

    def get_object(self):
        """
        overiding get_object() to return object of current authenticated user
        """
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "GET":
            return accounts_serializers.UserBaseSerializer
        return super().get_serializer_class()


class UserVerificationAPIView(rest_generics.UpdateAPIView):
    """
    APIView for User Verification
    Request Expected format : {token}
    Response Format : if any validation error {message}, else empty response {}
    """

    permission_classes = [AllowAny]
    serializer_class = accounts_serializers.UserEmailVerification

    def get_object(self):
        encrypted_token_key = self.request.data["token_key"]
        token_key = common_utils.decrypt(encrypted_token_key)
        user = get_object_or_404(
            get_user_model().objects.select_related("auth_token"),
            auth_token__key=token_key,
        )
        return user


class UserLoginAPIView(APIView):
    """
    APIView for User login
    Request Expected format : {email, password}
    Response Format : if any validation error {message}, else {token and user is exist in jirauser model or not}
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = accounts_serializers.UserLoginSerializer(
            data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class UserLogoutAPIView(rest_generics.DestroyAPIView):
    """
    APIView for User login
    Request Expected format : {token}
    Response Format : an empty response {}
    """

    queryset = Token.objects.all()

    def get_object(self):
        return self.get_queryset().get(user=self.request.user)


class UserResetPasswordView(APIView):
    """
    APIView for updating password
    GET Request : Checks if the request made is valid on first render
    POST Request : Updates the password
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = accounts_serializers.UserResetPasswordSerializer(
            data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.create(validated_data=serializer.validated_data)
        return Response({})

    def get(self, request, *args, **kwargs):
        key = kwargs.get("key")
        if key is None:
            return Response(
                {"message": [
                    accounts_constants.PASSWORD_RESET_CODE_NOT_PROVIDED]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = accounts_serializers.UserResetPasswordLinkExpirationSerializer(
            data=request.data, context={"key": key}
        )
        serializer.is_valid(raise_exception=True)
        return Response({})


class UserPokerbaordDashboardView(rest_generics.ListAPIView):
    """
    List View for showing the poker boards corresponding to a user in which user is participant, spectator or manager
    """

    serializer_class = poker_boards_serializers.PokerBoardDashboardDetails
    queryset = get_user_model().objects.all()

    def get_serializer(self, *args, **kwargs):
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True

        return super(UserPokerbaordDashboardView, self).get_serializer(*args, **kwargs)

    def filter_queryset(self, queryset):
        queryset = (
            self.request.user.owned_boards.all() |
            self.request.user.participated_boards.all()
        ).order_by("-id")
        return super(UserPokerbaordDashboardView, self).filter_queryset(queryset)


class UserTicketDashboardView(rest_generics.ListAPIView):
    """
    List View for showing tickets user has estimated upon
    """

    serializer_class = tickets_serializers.TicketDashboardViewSerializer
    queryset = get_user_model().objects.all()

    def get_serializer(self, *args, **kwargs):
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True

        return super(UserTicketDashboardView, self).get_serializer(*args, **kwargs)

    def filter_queryset(self, queryset):
        queryset = self.request.user.user_tickets.all().order_by("-created_at")
        return super(UserTicketDashboardView, self).filter_queryset(queryset)


class UserGroupsDashboardView(rest_generics.ListAPIView):
    """
    List View for showing groups of user in which user is participant or admin
    """

    serializer_class = groups_serializers.GroupDashboardViewSerializer
    queryset = get_user_model().objects.all()

    def get_serializer(self, *args, **kwargs):
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True

        return super(UserGroupsDashboardView, self).get_serializer(*args, **kwargs)

    def filter_queryset(self, queryset):
        groups = self.request.user.member_of_group.values_list('id')
        participating_groups = groups_models.Group.objects.filter(id__in=groups).select_related('admin').annotate(
            existing_member_count=Count("members")
        )
        queryset = participating_groups
        return super(UserGroupsDashboardView, self).filter_queryset(queryset)
