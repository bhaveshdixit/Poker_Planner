from django.urls import path

from poker_planner.apps.estimation_game import consumer as estimation_game_consumer


websocket_urls = [
    path('ws/estimation/pokerboard/<int:pokerboard_id>/user/<str:user_token>/', estimation_game_consumer.EstimationConsumer.as_asgi())
]
