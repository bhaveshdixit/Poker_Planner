"""BEPokerplanner URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

api_urls = [
    path('accounts/', include('poker_planner.apps.accounts.urls')),
    path('groups/', include('poker_planner.apps.groups.urls')),
    path('invitations/', include('poker_planner.apps.invitations.urls')),
    path('jira/', include('poker_planner.apps.jira_user.urls')),
    path('notifications/', include('poker_planner.apps.notifications.urls')),
    path('pokerboards/', include('poker_planner.apps.poker_boards.urls')),
    path('tickets/', include('poker_planner.apps.tickets.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_urls)),
]
