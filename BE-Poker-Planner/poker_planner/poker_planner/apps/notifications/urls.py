from django.urls import path

from poker_planner.apps.notifications import views as notifications_views

app_name = 'notifications'

urlpatterns = [
    path(
        'invite/',
        notifications_views.InviteUsersAPIView.as_view(),
        name='invite'
    ),
    path(
        'invite/status/',
        notifications_views.UpdateStatusAPIView.as_view(),
        name='invite-status'
    ),
    path(
        'getemail/<str:key>',
        notifications_views.GetEmailAPIView.as_view(),
        name='get-email'
    ),
    path(
        'forgotpassword/',
        notifications_views.ForgotPasswordAPIView.as_view(),
        name='forgot-password'
    )
]
