from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
from django.db import models

from poker_planner.apps.accounts import constants as accounts_constants
from poker_planner.apps.common import models as common_models


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of username.
    """

    def create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email and password.
        """

        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, password, **kwargs):
        """
        Create and save a super user with the given email and password"
        """

        user = self.model(email=email, is_staff=True, is_superuser=True, **kwargs)
        user.set_password(password)
        user.save()
        return user


class User(AbstractBaseUser, common_models.TimeStampedModel, PermissionsMixin):
    """
    User model with required fields, used email(unique) as username
    """

    first_name = models.CharField(
        max_length=accounts_constants.FIRST_NAME_LENGTH,
        help_text="First name of a user",
    )
    last_name = models.CharField(
        max_length=accounts_constants.LAST_NAME_LENGTH, help_text="Last name of a user"
    )
    email = models.EmailField(unique=True, help_text="Email of a user")
    is_verified = models.BooleanField(
        default=False, help_text="Flag for email verification status of user"
    )
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
