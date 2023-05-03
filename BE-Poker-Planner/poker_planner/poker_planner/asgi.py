import os
import django

from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter

from poker_planner.apps.estimation_game import routers as estimation_game_routers


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'poker_planner.settings')
django.setup()

application = ProtocolTypeRouter({
  "http": AsgiHandler(),
  'websocket': URLRouter(
    estimation_game_routers.websocket_urls
  )
})
