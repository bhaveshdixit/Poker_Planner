import requests
from poker_planner.apps.common import utils as common_utils


def jira_token_exist(baseurl, username, token):
    """
    Api calling to the jira app so as to get that this token is right/authenticated to the app or not
    """

    URL = f"{baseurl}rest/auth/1/session/"

    HEADERS = common_utils.get_jira_auth_header(username, token)

    response = requests.get(url=URL, headers=HEADERS)

    return response.status_code == 200

