import requests

from django.db.models import Q

from rest_framework.authtoken.models import Token

from poker_planner.apps.common import utils as common_utils
from poker_planner.apps.estimation_game import constants as estimation_game_constants
from poker_planner.apps.jira_user import models as jira_user_models
from poker_planner.apps.poker_boards import models as poker_boards_models
from poker_planner.apps.tickets import models as tickets_models


async def fetch_user_details(user_token):
    """
    Function to get details of the user : {user_id, user_name}
    """

    user_token = Token.objects.select_related("user").filter(key=user_token).first()

    if user_token is None or not user_token.user.is_verified:
        return {}

    user_details = {
        "user_id": user_token.user.id,
        "user_name": f"{user_token.user.first_name} {user_token.user.last_name}",
    }

    return user_details


async def fetch_user_role(user_id, pokerboard):
    """
    Function to get role of user via user_id on a board
    """
    pokerboard_id = pokerboard.id
    if pokerboard.manager_id == user_id:
        return "Manager"

    pokerboard_user_dict = poker_boards_models.PokerBoardUser.objects.filter(
        poker_board_id=pokerboard_id, user_id=user_id
    ).first()
    if pokerboard_user_dict is None:
        return None

    return pokerboard_user_dict.get_user_role_display()


async def fetch_tickets_via_board(pokerboard):
    """
    Function to fetch all tickets on board via board object
    """
    ticket_objects = pokerboard.board_tickets.filter(final_estimate__isnull=True).order_by("index")
    ticket_array = []

    for ticket in ticket_objects:
        ticket_array.append(
            {
                "jira_ticket_id": ticket.jira_ticket_id,
                "summary": ticket.summary,
                "description": ticket.description,
                "ticket_type": ticket.get_ticket_type_display(),
            }
        )

    return ticket_array


async def save_user_estimate(user_id, ticket_id, estimate):
    """
    Function to save user's estimate for user corresponding to user_id and ticket corresponding to ticket_id with estimate
    """

    tickets_models.Estimate.objects.create(
        user_id=user_id, ticket_id=ticket_id, user_estimate=estimate
    )


async def get_estimation_choices(pokerboard):
    """
    Function to fetch choices available for pokerboard object passed as parameters
    """

    return estimation_game_constants.choices_options[
        pokerboard.get_estimation_type_display()
    ]


async def get_board(pokerboard_id):
    """
    Function to get pokerboard object to a corresponding pokerboard_id
    """
    return poker_boards_models.PokerBoard.objects.prefetch_related("board_tickets").get(
        id=pokerboard_id
    )


async def update_jira_story_points(user_id, ticket_id, estimate, comment):
    """
    Function to update story point on JIRA for a ticket using user's credentials according to estimate
    """
    details = jira_user_models.JiraUser.objects.get(user_id=user_id)
    details = vars(details)

    story_points_url = f"{details['baseurl']}rest/api/3/issue/{ticket_id}/"
    comments_url = f"{details['baseurl']}rest/api/2/issue/{ticket_id}/comment/"

    HEADER = common_utils.get_jira_auth_header(
        username=details["username"], token=details["token"]
    )

    story_points_body = {"fields": {"customfield_10033": int(estimate)}}
    comments_body = {"body": comment}

    story_points_response = requests.put(
        url=story_points_url, headers=HEADER, json=story_points_body
    )

    response = {'comment': None, 'story_points': None}

    if comment:
        comments_response = requests.post(
            url=comments_url, headers=HEADER, json=comments_body
        )

        response.update({'comment': estimation_game_constants.JIRA_COMMENT_SUCCESS
        if comments_response.status_code == 201
        else estimation_game_constants.JIRA_COMMENT_ERROR})

    response.update({'story_points': estimation_game_constants.JIRA_STORY_POINTS_SUCCESS
        if story_points_response.status_code == 204
        else estimation_game_constants.JIRA_STORY_POINTS_ERROR})

    return response


async def update_final_estimate(ticket_id, estimate, user_id, comment):
    """
    Function to update final estimate of the ticket in our DB
    """

    ticket = tickets_models.Ticket.objects.get(jira_ticket_id=ticket_id)
    ticket.final_estimate = estimate
    ticket.save()

    response = await update_jira_story_points(
        user_id=user_id, ticket_id=ticket_id, estimate=estimate, comment=comment
    )
    return response


async def update_session_started(pokerboard):
    pokerboard.status = 3  # started status
    pokerboard.save()


async def update_session_finished(pokerboard):
    pokerboard.status = 4  # finished status
    pokerboard.save()
