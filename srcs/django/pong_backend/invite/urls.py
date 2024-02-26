from django.urls import path
from . import views
from .views import invite_player_page

urlpatterns = [
    path('invite-player/', views.invite_player, name='invite_player'),
	path('invite/', invite_player_page, name='invite_player_page'),
]