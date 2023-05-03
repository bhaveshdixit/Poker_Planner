from django.urls import path

from poker_planner.apps.invitations import views as invitations_views

app_name = 'invitations'

urlpatterns = [
    path(
        'invites/',
        invitations_views.GetInvitationsAPIView.as_view(),
        name='invites'
    )
]
