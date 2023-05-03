from django.urls import path

from poker_planner.apps.tickets import views as tickets_views

app_name = "tickets"

urlpatterns = [
    path(
        "fetch/",
        tickets_views.TicketFetchingAPIView.as_view(),
        name="fetch-ticket"
    ),
    path(
        "create/<int:board_id>/",
        tickets_views.TicketCreateView.as_view(),
        name="create-ticket",
    ),
]
