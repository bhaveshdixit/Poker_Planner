from django.urls import path

from poker_planner.apps.groups import views as groups_views

app_name = 'groups'

urlpatterns = [
    path(
        '',
        groups_views.CreatGroupView.as_view(),
        name='groups'
    ),
]
