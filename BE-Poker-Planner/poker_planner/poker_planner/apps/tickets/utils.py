import requests
from django.core.exceptions import ObjectDoesNotExist
from poker_planner.apps.common import utils as common_utils
from poker_planner.apps.poker_boards import models as poker_boards_models
from rest_framework import serializers as rest_serializers


def get_tickets(jql, user_jira_credentials):
    """
    Utility function that takes JQL query, user's jira baseurl, user's jira
    username and user's jira token to extract tickets based on JQL query
    """

    URL = f"{user_jira_credentials.baseurl}rest/api/latest/search"

    PARAMS = {"jql": jql}

    HEADERS = common_utils.get_jira_auth_header(
        user_jira_credentials.username, user_jira_credentials.token
    )

    response_obj = requests.get(url=URL, params=PARAMS, headers=HEADERS)

    if response_obj.status_code != 200:
        return {"data": response_obj.json(), "status": response_obj.status_code}

    response = response_obj.json()["issues"]

    TICKET_TYPE = {
        "Epic": 0,
        "Strory": 1,
        "Task": 2,
        "Bug": 3,
    }

    return {
        "data": [
            dict(
                summary=ticket["fields"]["summary"],
                description=ticket["fields"]["description"],
                jira_ticket_id=ticket["key"],
                ticket_type=TICKET_TYPE.get(ticket["fields"]["issuetype"]["name"], 4),
            )
            for ticket in response
        ],
        "status": response_obj.status_code,
    }
