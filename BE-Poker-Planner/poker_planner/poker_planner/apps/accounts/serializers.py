from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.utils import timezone
from poker_planner.apps.accounts import constants as accounts_constants
from poker_planner.apps.accounts import models as accounts_models
from poker_planner.apps.accounts import utils as accounts_utils
from poker_planner.apps.common import utils as common_utils
from poker_planner.apps.notifications import models as notifications_models
from rest_framework import serializers as rest_serializers
from rest_framework.authtoken.models import Token


class UserBaseSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for fetching details of user
    """

    class Meta:
        model = get_user_model()
        fields = ("first_name", "last_name", "email")


class UserAllFieldsSerializer(UserBaseSerializer):
    """
    Serializer for fields = [id, first_name, last_name, email]
    """

    class Meta(UserBaseSerializer.Meta):
        fields = UserBaseSerializer.Meta.fields + ("id",)


class UserSignupSerializer(rest_serializers.ModelSerializer):
    """
    Serializer for registering user with validations
    """

    password = rest_serializers.CharField(min_length=8, write_only=True)
    key = rest_serializers.CharField(required=False)
    message = rest_serializers.SerializerMethodField()

    class Meta:
        model = accounts_models.User
        fields = ("first_name", "last_name", "email", "password", "key", "message")
        extra_kwargs = {
            "email": {"write_only": True},
            "first_name": {"write_only": True},
            "last_name": {"write_only": True},
        }

    def get_message(self, obj):
        """
        Adds a message to be displayed to if invited user is successfully created
        """
        user = get_user_model().objects.get(email=obj.email)
        if user.is_verified:
            return accounts_constants.VERIFIED_USER_CREATED

        return accounts_constants.VERIFICATION_MAIL_QUEUED

    @transaction.atomic
    def create(self, validated_data):
        """
        Saving the details of the user in the database
        """

        key = validated_data.pop("key", None)
        user = accounts_models.User.objects.create_user(**validated_data)

        # verifying and accepting board invitation if sign up is done with valid key
        if key:
            notification = notifications_models.Notification.objects.filter(
                key=key
            ).first()
            if notification and notification.email == validated_data["email"]:
                user.is_verified = True
                user.save()
                return user

        # making token object for this user
        token = Token.objects.create(user=user)
        encrypted_token_key = common_utils.encrypt(token.key)
        accounts_utils.send_verification_mail(user.email, encrypted_token_key)

        return user


class UserEmailVerification(rest_serializers.Serializer):
    """
    Serializer for email verification of a user with field message showing the message return for
    """

    token_key = rest_serializers.CharField(write_only=True)

    class Meta:
        fields = ("token_key",)

    def validate(self, attrs):
        """
        Checking for the token expiration and the user verification details
        """

        user = self.instance
        token = user.auth_token
        is_expired, token = accounts_utils.validate_token(token)

        if user.is_verified:
            raise rest_serializers.ValidationError(
                {"message": accounts_constants.MAIL_ALREADY_VERIFIED_ERROR}
            )

        if is_expired:
            encrypted_token_key = common_utils.encrypt(token.key)
            accounts_utils.send_verification_mail(user.email, encrypted_token_key)
            raise rest_serializers.ValidationError(
                {"message": accounts_constants.RESEND_EMAIL_MESSAGE}
            )

        attrs["token"] = token

        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Updating the verified field of the user in the database
        """

        token = validated_data["token"]
        instance.is_verified = True
        instance.save()
        token.delete()
        return instance


class UserLoginSerializer(rest_serializers.Serializer):
    """
    Serializer for login the user with validations
    """

    password = rest_serializers.CharField(write_only=True)
    email = rest_serializers.EmailField()
    token = rest_serializers.SerializerMethodField()
    has_jira_credentials = rest_serializers.BooleanField(source='user.jira_credentials', read_only=True)
    first_name = rest_serializers.CharField(source='user.first_name',read_only=True)
    last_name = rest_serializers.CharField(source='user.last_name',read_only=True)

    class Meta:
        fields = (
            "email",
            "password",
            "token",
            "has_jira_credentials",
            "first_name",
            "last_name"
        )


    def get_token(self, obj):
        token, created = Token.objects.get_or_create(user=self.validated_data["user"])
        return token.key

    def validate(self, attr):
        """
        Checks for the user authentication credentials and verification status
        """
        password = attr["password"]
        email = attr["email"]

        user = authenticate(email=email, password=password)

        if user is None:
            raise rest_serializers.ValidationError(
                {"message": accounts_constants.AUTHENTICATION_FAILED_ERROR}
            )

        if not user.is_verified:
            token = Token.objects.get(user=user)
            encrypted_token_key = common_utils.encrypt(token.key)
            accounts_utils.send_verification_mail(email, encrypted_token_key)
            raise rest_serializers.ValidationError(
                {"message": accounts_constants.USER_NOT_VERIFIED_ERROR}
            )

        attr["user"] = (
            get_user_model()
            .objects.select_related("jira_credentials")
            .get(email=user.email)
        )
        return attr


class UserResetPasswordSerializer(rest_serializers.Serializer):
    """
    Serializer for updating the password of the user with validations on key expiration and key existence
    """

    password = rest_serializers.CharField(write_only=True)
    key = rest_serializers.CharField(write_only=True)

    def validate(self, attrs):
        key = attrs["key"]
        email = accounts_utils.reset_password_validation(key)
        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        user = get_user_model().objects.get(email=email)
        user.set_password(raw_password=password)
        user.save()
        return user


class UserResetPasswordLinkExpirationSerializer(rest_serializers.Serializer):
    """
    Serializer for checking the existence of key, when page rendered
    """

    def validate(self, attrs):
        key = self.context["key"]
        accounts_utils.reset_password_validation(key)
        return attrs


class UserSerializer(rest_serializers.ModelSerializer):
    """
    Serializer with all fields of user model
    """

    class Meta:
        model = get_user_model()
        fields = "__all__"
