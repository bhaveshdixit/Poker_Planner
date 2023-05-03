import json
from datetime import datetime

from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer

from poker_planner.apps.estimation_game import utils as estimation_game_utils
from poker_planner.apps.poker_boards import models as poker_boards_models


class EstimationConsumer(AsyncConsumer):
    """
    Async consumer for the poker planner estimation game
    """

    user_exist = {}
    pokerboard_id_exist = {}
    active_user = {}
    tickets_history = {}
    ticket = {}
    timer_status = {}
    board_user_estimates = {}
    final_estimates_status = {}

    async def initializes_dict(self, pokerboard_id):
        """ """

        self.pokerboard_id_exist.update(
            {
                pokerboard_id: poker_boards_models.PokerBoard.objects.prefetch_related(
                    "board_tickets", "users"
                ).get(id=pokerboard_id)
            }
        )
        self.timer_status.update({pokerboard_id: None})
        self.active_user.update({pokerboard_id: {}})
        self.tickets_history.update({pokerboard_id: {}})

        tickets = await estimation_game_utils.fetch_tickets_via_board(
            self.pokerboard_id_exist[pokerboard_id]
        )
        self.ticket.update({pokerboard_id: tickets})
        self.board_user_estimates.update({pokerboard_id: {}})
        self.final_estimates_status.update({pokerboard_id: {}})

    async def initialize(self, user_token, pokerboard_id):
        """
        updating the dictionaries according to new pokerboard and user
        """

        if self.user_exist.get(user_token) != None:
            await self.error_disconnect()
        else:
            self.user_exist.update({user_token: True})

        if self.pokerboard_id_exist.get(pokerboard_id) is None:
            await self.initializes_dict(pokerboard_id)

        if self.tickets_history[pokerboard_id].get(user_token) is None:
            self.tickets_history[pokerboard_id].update({user_token: []})

    async def websocket_connect(self, event):
        """
        Builting up a new connection and after accepting the connection following things will be executed
        1. All online user will be show to the new connection with estimation status and estimation(only to manager)
        2. All his previous ticket history will be shown(if existing user)
        3. A new member also needs timer, sent timer
        """

        await self.send({"type": "websocket.accept"})

        user_token = self.scope["url_route"]["kwargs"]["user_token"]
        pokerboard_id = self.scope["url_route"]["kwargs"]["pokerboard_id"]

        await self.initialize(pokerboard_id=pokerboard_id, user_token=user_token)
        await self.online_user(user_token=user_token, pokerboard_id=pokerboard_id)
        await self.send_onconnect_details(
            user_token=user_token, pokerboard_id=pokerboard_id
        )
        current_board = self.pokerboard_id_exist[pokerboard_id]
        await estimation_game_utils.update_session_started(current_board)

    async def websocket_receive(self, event):
        """
        Here server will receive the message sended by the client and call the function according to the message
        """

        text = json.loads(event["text"])
        pokerboard_id = self.scope["url_route"]["kwargs"]["pokerboard_id"]
        current_board = self.pokerboard_id_exist[pokerboard_id]

        if text["msg"] == "timer_started":
            current_user_role = self.active_user[pokerboard_id][self.channel_name][
                "user_role"
            ]
            if current_user_role != "Manager":
                self.send_message(json.dumps({"You don't have permission to start timer"}))
                return

            self.timer_status[pokerboard_id] = datetime.now()
            await self.channel_layer.group_send(
                f"{pokerboard_id}",
                {
                    "type": "timer_started",
                },
            )

        elif text["msg"] == "timer_ended":
            if self.timer_status[pokerboard_id] != 0:
                self.timer_status[pokerboard_id] = 0
                await self.channel_layer.group_send(
                    f"{pokerboard_id}",
                    {
                        "type": "timer_ended",
                    },
                )

        elif text["msg"] == "user_estimated":
            estimate = text["estimate"]
            current_user_id = self.active_user[pokerboard_id][self.channel_name][
                "user_id"
            ]
            await self.user_estimate(pokerboard_id=pokerboard_id, estimate=estimate)
            self.board_user_estimates[pokerboard_id][current_user_id] = estimate
            await self.channel_layer.group_send(
                f"{pokerboard_id}",
                {
                    "type": "user_estimated",
                    "message": json.dumps(
                        {
                            "msg": "estimation_status",
                            "user_id": current_user_id,
                        }
                    ),
                },
            )
            await self.channel_layer.group_send(
                f"{pokerboard_id}_manager",
                {
                    "type": "user_estimated_manager_end",
                    "message": json.dumps(
                        {
                            "msg": "user_estimated_card",
                            "user_id": current_user_id,
                            "estimate": estimate,
                        }
                    ),
                },
            )

        elif text["msg"] == "estimation_started":
            await self.first_ticket(pokerboard_id=pokerboard_id)

        elif text["msg"] == "next_ticket":
            await self.next_ticket(pokerboard_id=pokerboard_id)

        elif text["msg"] == "skip_ticket":
            await self.skip_ticket(pokerboard_id=pokerboard_id)

        elif text["msg"] == "final_estimate":
            current_user_role = self.active_user[pokerboard_id][self.channel_name][
                "user_role"
            ]
            if current_user_role != "Manager":
                self.send_message("You don't have permission to set final estimate of a ticket")
                return

            estimate = text["estimate"]
            comment = text["comment"]
            self.timer_status[pokerboard_id] = None
            self.board_user_estimates[pokerboard_id].clear()
            await self.final_estimate(pokerboard_id=pokerboard_id, estimate=estimate, comment=comment)

        elif text["msg"] == "session_finished":
            await estimation_game_utils.update_session_finished(current_board)

    async def websocket_disconnect(self, event):
        """
        Connection is closed here and also channel(user) will be removed from the group
        """

        user_token = self.scope["url_route"]["kwargs"]["user_token"]
        pokerboard_id = self.scope["url_route"]["kwargs"]["pokerboard_id"]
        user_channel_name = self.channel_name
        user_id = self.active_user[pokerboard_id][user_channel_name]["user_id"]

        await self.remove_user(
            user_token=user_token,
            user_id=user_id,
            user_channel_name=user_channel_name,
            pokerboard_id=pokerboard_id,
        )
        raise StopConsumer()

    async def send_onconnect_details(self, user_token, pokerboard_id):
        """
        Event to send details to a user about Current Status of Board such as ticket, timer, his/her estimation history
        """
        user_role = self.active_user[pokerboard_id][self.channel_name]["user_role"]
        user_id = self.active_user[pokerboard_id][self.channel_name]["user_id"]
        board = self.pokerboard_id_exist[pokerboard_id]
        current_ticket = self.ticket[pokerboard_id][0]
        estimation_choices = await estimation_game_utils.get_estimation_choices(board)
        estimation_time = board.estimation_time
        user_tickets = self.tickets_history[pokerboard_id][user_token]

        if (
            self.timer_status[pokerboard_id] is not None
            and self.timer_status[pokerboard_id] != 0
        ) and (
            datetime.now() - self.timer_status[pokerboard_id]
        ).total_seconds() > self.pokerboard_id_exist[
            pokerboard_id
        ].estimation_time:
            self.timer_status[pokerboard_id] = None

        current_time = (
            None
            if self.timer_status[pokerboard_id] is None
            else (
                0
                if self.timer_status[pokerboard_id] == 0
                else self.pokerboard_id_exist[pokerboard_id].estimation_time
                - (datetime.now() - self.timer_status[pokerboard_id]).total_seconds()
            )
        )

        await self.send_message(
            json.dumps(
                {
                    "msg": "onconnect_data",
                    "user_role": user_role,
                    "user_id": user_id,
                    "ticket": current_ticket,
                    "choices": estimation_choices,
                    "time": estimation_time,
                    "tickets_estimated_history": user_tickets,
                    "currentTime": current_time,
                    "final_estimate_status": self.final_estimates_status[pokerboard_id],
                }
            )
        )

    async def online_user(self, user_token, pokerboard_id):
        """
        Event which will show the new user along with all the active user in the lobby
        """
        user_details = await estimation_game_utils.fetch_user_details(
            user_token=user_token
        )
        if user_details is None:
            await self.error_disconnect()

        user_role = await estimation_game_utils.fetch_user_role(
            user_id=user_details["user_id"],
            pokerboard=self.pokerboard_id_exist[pokerboard_id],
        )

        if user_role is None:
            await self.error_disconnect()

        user_channel_name = self.channel_name

        current_user_message = {
            "msg": "add_user",
            **user_details,
            "user_role": user_role,
            "hasEstimated": False,
            "currentTicketEstimate": None,
        }

        if (
            self.board_user_estimates[pokerboard_id].get(user_details["user_id"])
            is not None
        ):
            current_user_message.update(
                {
                    "hasEstimated": True,
                    "currentTicketEstimate": self.board_user_estimates[pokerboard_id][
                        user_details["user_id"]
                    ],
                }
            )

        await self.send_message(json.dumps(current_user_message))

        if user_role == "Manager":
            await self.channel_layer.group_add(
                f"{pokerboard_id}_manager", user_channel_name
            )

        await self.channel_layer.group_send(
            f"{pokerboard_id}",
            {
                "type": "new_member",
                "message": json.dumps(current_user_message),
            },
        )
        await self.channel_layer.group_add(f"{pokerboard_id}", user_channel_name)

        current_online_users = self.active_user[pokerboard_id]

        for current_user in current_online_users:
            user = current_online_users[current_user]
            user.update({"hasEstimated": False, "currentTicketEstimate": None})
            if self.board_user_estimates[pokerboard_id].get(user["user_id"]) != None:
                user.update(
                    {
                        "hasEstimated": True,
                        "currentTicketEstimate": self.board_user_estimates[
                            pokerboard_id
                        ][user["user_id"]]
                        if user_role == "Manager"
                        else None,
                    }
                )

            user.update({"msg": "add_user"})
            await self.send_message(json.dumps(user))

        current_online_users.update(
            {user_channel_name: {**user_details, "user_role": user_role}}
        )

    async def estimation_choice(self, pokerboard_id):
        """
        Event for sending estimation choices to a user on a board
        """
        estimation_choices = estimation_game_utils.get_estimation_choices(
            pokerboard_id=pokerboard_id
        )
        await self.send_message(
            json.dumps({"msg": "estimation_choices", "choices": estimation_choices})
        )

    async def has_tickets(self, pokerboard_id):
        """ "
        Helper function to check if there are no more tickets available on a board
        """
        return len(self.ticket[pokerboard_id]) != 0

    async def next_ticket(self, pokerboard_id):
        """
        Handler to send next ticket to all user when manager sets final estimate
        """
        self.ticket[pokerboard_id].pop(0)
        await self.send_ticket(pokerboard_id=pokerboard_id)

    async def skip_ticket(self, pokerboard_id):
        """
        Handler to skip ticket and push it back to last in our queue
        """
        remove_ticket = self.ticket[pokerboard_id].pop(0)
        self.ticket[pokerboard_id].append(remove_ticket)
        await self.send_ticket(pokerboard_id=pokerboard_id)

    async def final_estimate(self, pokerboard_id, estimate, comment):
        """
        Hanlde to set the final estimate in the ticket and save it in the database and also sent next ticket of the pokerboard
        """
        ticket = self.ticket[pokerboard_id][0]
        user_channel_name = self.channel_name
        user_id = self.active_user[pokerboard_id][user_channel_name]["user_id"]

        response = await estimation_game_utils.update_final_estimate(
            ticket_id=ticket["jira_ticket_id"], estimate=estimate, user_id=user_id, comment=comment
        )

        self.final_estimates_status[pokerboard_id][ticket["jira_ticket_id"]] = estimate

        await self.channel_layer.group_send(
            f"{pokerboard_id}",
            {
                "type": "final_ticketestimate",
                "message": json.dumps(
                    {"msg": "final_estimate", **ticket, "estimate": estimate}
                ),
            },
        )
        await self.send_message(
            json.dumps({"msg": "jira_final_estimate", "response": response})
        )
        await self.next_ticket(pokerboard_id=pokerboard_id)

    async def user_estimate(self, pokerboard_id, estimate):
        """
        Handler to save user estimate to our DB and add this ticket to user's history
        """
        user_channel_name = self.channel_name
        current_ticket = self.ticket[pokerboard_id][0]
        user_id = self.active_user[pokerboard_id][user_channel_name]["user_id"]
        self.active_user[pokerboard_id][user_channel_name]["estimate"] = estimate
        user_token = self.scope["url_route"]["kwargs"]["user_token"]

        await estimation_game_utils.save_user_estimate(
            ticket_id=current_ticket["jira_ticket_id"],
            user_id=user_id,
            estimate=estimate,
        )
        self.tickets_history[pokerboard_id][user_token].append(
            {**current_ticket, "estimate": estimate}
        )
        await self.send_message(
            json.dumps({**current_ticket, "estimate": estimate, "msg": "add_ticket"})
        )

    async def remove_user(self, user_token, user_id, pokerboard_id, user_channel_name):
        """
        Handler to remove user from live board user when user disconnects
        """
        del self.user_exist[user_token]
        del self.active_user[pokerboard_id][user_channel_name]

        await self.channel_layer.group_discard(f"{pokerboard_id}", user_channel_name)
        await self.channel_layer.group_send(
            f"{pokerboard_id}",
            {
                "type": "delete_member",
                "message": json.dumps({"msg": "remove_member", "user_id": user_id}),
            },
        )

    async def error_disconnect(self):
        """
        Handler to disconnect user, called when permission denied
        """
        await self.send({"type": "websocket.close"})

        raise StopConsumer()

    async def timer_started(self, event):
        """
        handle to send timer started event to each live user on Board
        """
        await self.send_message(json.dumps({"msg": "timer_started"}))

    async def timer_ended(self, event):
        """
        Handle to send timer ended event to each live user on Board
        """
        await self.send_message(json.dumps({"msg": "timer_ended"}))

    async def user_estimated(self, event):
        """
        Handler to send  each user's estimation status to every live user on board
        """
        await self.send_message(event["message"])

    async def user_estimated_manager_end(self, event):
        """
        Handler to send each user estimate to manager on board
        """
        await self.send_message((event["message"]))

    async def new_member(self, event):
        """
        Handler for adding new member to live users on board
        """
        pokerboard_id = self.scope["url_route"]["kwargs"]["pokerboard_id"]
        event_message_dict = json.loads(event["message"])
        if self.active_user[pokerboard_id][self.channel_name]["user_role"] != "Manager":
            event_message_dict["currentTicketEstimate"]
            await self.send_message(json.dumps(event_message_dict))
        await self.send_message(event["message"])

    async def send_message(self, object):
        """
        Hanlder to send event on frontend
        """
        await self.send({"type": "websocket.send", "text": object})

    async def delete_member(self, event):
        """
        Hanlder to tell the group that user has been removed
        """
        await self.send_message(event["message"])

    async def send_ticket(self, pokerboard_id):
        """
        Hanlder to send the current ticket to all live users in groups
        """

        if not await self.has_tickets(pokerboard_id=pokerboard_id):
            await self.channel_layer.group_send(
                f"{pokerboard_id}",
                {
                    "type": "no_tickets",
                    "message": json.dumps({"msg": "no_ticket_found"}),
                },
            )
        else:
            message = {"ticket": self.ticket[pokerboard_id][0], "msg": "next_ticket"}
            await self.channel_layer.group_send(
                f"{pokerboard_id}",
                {"type": "current_ticket", "message": json.dumps(message)},
            )

    async def no_tickets(self, event):
        """
        Hanlder to notify live users when all tickets on a board have been estimated
        """
        await self.send_message(event["message"])

    async def current_ticket(self, event):
        """
        Handler to send the current ticket to all live users on board
        """

        message = event['message']
        await self.send_message(object=message)

    async def final_ticketestimate(self, event):
        """
        Hanlder to send final estimate to all live users on board
        """

        message = event["message"]
        await self.send_message(message)

    async def get_estimation_status(self, pokerboard_id, user_role):
        """
        Helper function to fetch estimation status when user connect in between game
        """
        user_status = self.board_user_estimates[pokerboard_id]
        if user_role == "Manager":
            return user_status
        else:
            participant_status = []
            for status in user_status:
                participant_status.append(status)
            return participant_status
