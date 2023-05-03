from django.contrib import admin

from poker_planner.apps.poker_boards import models as poker_board_models

admin.site.register(poker_board_models.PokerBoard)
admin.site.register(poker_board_models.PokerBoardUser)
