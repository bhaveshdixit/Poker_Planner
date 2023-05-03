from collections import OrderedDict
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase

from poker_planner.apps.poker_boards import models as poker_boards_models


class UpdatePokerBoardTestCase(APITestCase):
    fixtures = ["test_data.json"]

    def test_successful_update(self):
        """
        Test to verfiy successful update of pokerboard details
        """
        manager = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="manager@mail.com")
        )
        token = manager.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        board = poker_boards_models.PokerBoard.objects.get(pk=1)
        request_data = {"status": 2, "name": "New name"}
        expected_data = {
            "id": board.id,
            "name": request_data["name"],
            "description": board.description,
            "status": request_data["status"],
            "estimation_time": board.estimation_time,
            "estimation_type": board.estimation_type,
            "manager": manager.id,
        }

        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.patch(url, request_data)
        self.assertEqual(200, response.status_code)
        self.assertDictEqual(expected_data, response.data)

    def test_unauthorized_update(self):
        """
        Test to verfiy unauthorized update of pokerboard details
        """

        member = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="member@mail.com")
        )
        token = member.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        request_data = {"status": 2, "name": "New name"}
        expected_data = {"detail": "You do not have permission to perform this action."}

        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.patch(url, request_data)
        self.assertEqual(403, response.status_code)
        self.assertDictEqual(response.data, expected_data)


class GetPokerBoardDetailsTestCase(APITestCase):
    fixtures = ["test_data.json"]

    def test_fetching_board_details_by_manager(self):
        """
        Test to verfiy successful fetching of poker board details
        along with all the tickets related to the board by manager
        """

        manager = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="manager@mail.com")
        )
        token = manager.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        board = poker_boards_models.PokerBoard.objects.get(pk=1)
        expected_data = {
            "id": board.id,
            "name": board.name,
            "manager_name": "manager lname",
            "status": "created",
            "description": board.description,
            "estimation_time": board.estimation_time,
            "estimation_type": "Fibonacci",
            "tickets": [
                OrderedDict(
                    [
                        ("summary", "ticket for testing"),
                        ("description", None),
                        ("jira_ticket_id", "TEST1"),
                        ("ticket_type_display", "Bug"),
                    ]
                )
            ],
        }
        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertDictEqual(response.data, expected_data)

    def test_fetching_board_details_by_member(self):
        """
        Test to verfiy successful fetching of poker board details
        along with all the tickets related to the board by member
        """

        member = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="member@mail.com")
        )
        token = member.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        board = poker_boards_models.PokerBoard.objects.get(pk=1)
        expected_data = {
            "id": board.id,
            "name": board.name,
            "manager_name": "manager lname",
            "status": "created",
            "description": board.description,
            "estimation_time": board.estimation_time,
            "estimation_type": "Fibonacci",
            "tickets": [
                OrderedDict(
                    [
                        ("summary", "ticket for testing"),
                        ("description", None),
                        ("jira_ticket_id", "TEST1"),
                        ("ticket_type_display", "Bug"),
                    ]
                )
            ],
        }
        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(200, response.status_code)
        self.assertDictEqual(response.data, expected_data)

    def test_fetching_board_details_by_other_user(self):
        """
        Test to verfiy unsuccessful fetching of poker board details
        by some random user
        """

        user = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="user@mail.com")
        )
        token = user.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        expected_data = {"detail": "You do not have permission to perform this action."}
        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(403, response.status_code)
        self.assertDictEqual(response.data, expected_data)

    def test_delete_method_not_allowed_for_detail_url(self):
        """
        Test to check DELETE method is not alowed for detailed url
        """
        user = (
            get_user_model()
            .objects.select_related("auth_token")
            .get(email="user@mail.com")
        )
        token = user.auth_token.key
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        url = reverse("poker_boards:pokerboards-detail", kwargs={"pk": 1})
        response = self.client.delete(url)
        self.assertEqual(405, response.status_code)
