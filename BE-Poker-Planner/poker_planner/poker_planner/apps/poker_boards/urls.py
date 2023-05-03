from rest_framework import routers

from poker_planner.apps.poker_boards import views as pokerboard_views

app_name = 'poker_boards'
router = routers.SimpleRouter()

router.register('', pokerboard_views.PokerBoardViewSet, 'pokerboards')

urlpatterns = router.urls
