import base64
import json

from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import serializers as rest_serializers

from poker_planner.apps.groups import models as groups_models
from poker_planner.apps.invitations import models as invitations_models
from poker_planner.apps.notifications import (
    constants as notifications_constants,
    models as notifications_models,
    utils as notifications_utils,
)
from poker_planner.apps.poker_boards import models as poker_boards_models


class GetEmailSerailzer(rest_serializers.ModelSerializer):
    """
    Serializer for fetching the email id
    """

    class Meta:
        model = notifications_models.Notification
        fields = ("email",)


class InviteUserSerializer(rest_serializers.Serializer):
    """
    Serializer for inviting the user as a participant or spectator with validations
    """

    PARTICIPANT = invitations_models.Invitation.PARTICIPANT
    SPECTATOR = invitations_models.Invitation.SPECTATOR

    board_id = rest_serializers.IntegerField(write_only=True)
    emails = rest_serializers.ListField(
        write_only=True,
        child=rest_serializers.EmailField(),
        allow_empty=False,
        min_length=1,
        required=False,
    )
    groups = rest_serializers.ListField(
        child=rest_serializers.IntegerField(),
        required=False,
        write_only=True,
        min_length=1,
    )
    role = rest_serializers.ChoiceField(
        choices=[PARTICIPANT, SPECTATOR], write_only=True
    )
    data = rest_serializers.ReadOnlyField()

    def validate(self, attrs):
        """
        Check if poker board exists and owner of board is requesting to add members
        """

        user = self.context["request"].user
        poker_board = (
            poker_boards_models.PokerBoard.objects.select_related("manager")
            .filter(pk=attrs["board_id"])
            .first()
        )

        if not poker_board:
            raise rest_serializers.ValidationError(
                {"poker_board": notifications_constants.BOARD_EXIST_ERROR}
            )

        if user != poker_board.manager:
            raise PermissionDenied()

        if "emails" not in attrs and "groups" not in attrs:
            raise rest_serializers.ValidationError(
                {"invite": notifications_constants.EMAILS_OR_GROUPS_REQUIRED}
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        response = {}
        notifications_to_be_created = []
        invitations_to_be_created = []
        emails = set()
        group_ids = validated_data.get("groups")

        if group_ids:
            group_emails = list(
                groups_models.Group.objects.prefetch_related("members")
                .values_list("members__email", flat=True)
                .filter(pk__in=group_ids)
                .distinct()
            )
            validated_data["emails"] = validated_data.get("emails", []) + group_emails

        board = poker_boards_models.PokerBoard.objects.get(
            pk=validated_data["board_id"]
        )

        for email in validated_data["emails"]:
            if email == user.email:
                response[email] = "User cannot invite himself"
                continue

            board_invite = invitations_models.Invitation.objects.filter(
                email=email, board=board
            ).first()

            if email in emails or board_invite:
                response[email] = "User already invited"
                continue

            emails.add(email)

            token_key = base64.urlsafe_b64encode(
                json.dumps(timezone.now().timestamp()).encode()
            ).decode()

            notifications_utils.send_invitation_mail(email, token_key, user.email)

            current_notification_instance = notifications_models.Notification(
                email=email, key=token_key, type=1
            )

            notifications_to_be_created.append(current_notification_instance)

            current_inviation_instance = invitations_models.Invitation(
                email=email,
                board=board,
                role=validated_data["role"],
            )

            invitations_to_be_created.append(current_inviation_instance)

            response[email] = "invited successfully"

        notification_created_objects = (
            notifications_models.Notification.objects.bulk_create(
                notifications_to_be_created
            )
        )

        for index in range(0, len(notification_created_objects)):
            invitations_to_be_created[
                index
            ].notification = notification_created_objects[index]

        invitations_models.Invitation.objects.bulk_create(invitations_to_be_created)
        board.status = board.INVITED_USERS
        board.save()

        return {"data": response}


class UpdateStatusSerializer(rest_serializers.ModelSerializer):
    # ModelSerializer to get field validation for key and status
    """
    Serializer for updating the status of the invitation
    and on acceptance of invitation create poker board user
    """

    ACCEPTED = notifications_models.Notification.ACCEPTED
    REJECTED = notifications_models.Notification.REJECTED
    board_id = rest_serializers.IntegerField(read_only=True)

    class Meta:
        model = notifications_models.Notification
        # To find: why fields = ["status", "key"] causes error but fields = ["status"] does not
        fields = ["status", "board_id"]

    def validate(self, attrs):
        notification = self.instance

        if not notification:
            raise rest_serializers.ValidationError(
                {"error": notifications_constants.INVALID_KEY_ERROR}
            )

        if self.context["request"].user.email != notification.email:
            raise rest_serializers.ValidationError(
                {"error": notifications_constants.REQUEST_OR_ACCEPT_ERROR}
            )

        if notification.status == self.ACCEPTED:
            raise rest_serializers.ValidationError(
                {"error": notifications_constants.ALREADY_ACCEPTED_ERROR}
            )

        if notification.status == self.REJECTED:
            raise rest_serializers.ValidationError(
                {"error": notifications_constants.ALREADY_REJECTED_ERROR}
            )

        return attrs
    @transaction.atomic
    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.save()
        if validated_data["status"] == self.ACCEPTED:
            board = instance.invitation.board
            user = get_user_model().objects.get(email=instance.email)
            poker_boards_models.PokerBoardUser.objects.create(
                poker_board=board, user=user, user_role=instance.invitation.role
            )
        
        return{"board_id": instance.invitation.board.id}

class ForgotPasswordSerializer(rest_serializers.Serializer):
    """
    Serializer for sending reset password mail with creating corresponding notifications object
    """
    email = rest_serializers.EmailField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        get_object_or_404(get_user_model(), email=email)
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        key = base64.urlsafe_b64encode(json.dumps(
            timezone.now().timestamp()).encode()).decode()
        notification = notifications_models.Notification.objects.create(
            key=key,
            type=notifications_models.Notification.CHANGE_PASS,
            email=email
        )
        notifications_utils.send_reset_password_mail(
            email, notification.key
        )

        return notification
