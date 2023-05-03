from django.urls import path
from poker_planner.apps.accounts import views as accounts_views

app_name = "accounts"

urlpatterns = [
    path(
        "user/",
        accounts_views.UserCreateReadAPIView.as_view(),
        name="register-retrieve",
    ),
    path(
        "verify/",
        accounts_views.UserVerificationAPIView.as_view(),
        name="verify",
    ),
    path(
        "login/",
        accounts_views.UserLoginAPIView.as_view(),
        name="login",
    ),
    path(
        "logout/",
        accounts_views.UserLogoutAPIView.as_view(),
        name="logout",
    ),
    path(
        "search/",
        accounts_views.UserSearchAPIView.as_view(),
        name="search",
    ),
    path(
        "resetpassword/",
        accounts_views.UserResetPasswordView.as_view(),
        name="reset-password",
    ),
    path(
        "resetpassword/<str:key>/",
        accounts_views.UserResetPasswordView.as_view(),
        name="reset-password-valid",
    ),
    path(
        "pokerboards/",
        accounts_views.UserPokerbaordDashboardView.as_view(),
        name="user-boards",
    ),
    path(
        "tickets/",
        accounts_views.UserTicketDashboardView.as_view(),
        name="user-tickets",
    ),
    path(
        "groups/",
        accounts_views.UserGroupsDashboardView.as_view(),
        name="user-groups",
    ),
]
