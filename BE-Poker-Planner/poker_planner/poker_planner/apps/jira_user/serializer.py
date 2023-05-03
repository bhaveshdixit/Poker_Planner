import validators
from poker_planner.apps.jira_user import constants as jira_user_constants
from poker_planner.apps.jira_user import models as jira_user_models
from poker_planner.apps.jira_user import utils as jira_user_utils
from rest_framework import serializers as rest_serializer


class JiraCredentialsSerializer(rest_serializer.ModelSerializer):
    """
    Serializer for adding the jira credentails of the user to the database
    """

    baseurl = rest_serializer.CharField(write_only=True)
    username = rest_serializer.CharField(write_only=True)
    token = rest_serializer.CharField(write_only=True)

    class Meta:
        model = jira_user_models.JiraUser
        fields = ("username", "token", "baseurl")

    def validate(self, attrs):
        """
        Validating the url format and user's provided jira credentials is valid or not via JIRA API
        """
        baseurl = attrs["baseurl"]
        username = attrs["username"]
        token = attrs["token"]

        url_valid = validators.url(baseurl)

        if not url_valid:
            raise rest_serializer.ValidationError(
                {"message": jira_user_constants.INVALID_URL_ERROR}
            )

        # splits url on basis of froward slash (/) https://example.atlassian.com -> ['https', '', 'example.atlassian.com]
        url_path_array = baseurl.split("/")
        # splits Atlassian user domain example.atlassian.com -> ['example', 'atlassian', 'com']
        jira_user_domain_name_array = url_path_array[2].split(".")

        if (
            len(jira_user_domain_name_array) < 3
            or url_path_array[0] != "https:"
            or jira_user_domain_name_array[1] != "atlassian"
            or jira_user_domain_name_array[2] != "net"
        ):
            raise rest_serializer.ValidationError(
                {"message": jira_user_constants.INVALID_URL_ERROR}
            )

        is_token_valid = jira_user_utils.jira_token_exist(baseurl, username, token)

        if not is_token_valid:
            raise rest_serializer.ValidationError(
                {"message": jira_user_constants.JIRA_USER_NOT_EXIST_ERROR}
            )

        user = self.context["request"].user
        attrs["user"] = user
        return attrs
