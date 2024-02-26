# urls.py
from django.urls import path
from .views import UserCreate, UserDelete, LoginView, LogoutView, check_login_state, UserProfileDetail, send_friend_request, manage_friend_request, list_friends, Leaderboard, GameCreate

# This connects URLs to ViewSets.

urlpatterns = [
    # User
    path('register/', UserCreate.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileDetail.as_view(), name='user-profile'),
    path('delete_user/', UserDelete.as_view(), name='delete_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check_login_state/', check_login_state, name='check_login_state'),
    # Friends
    path('users/<int:friend_id>/send_friend_request/', send_friend_request, name='send_friend_request'),
    path('friendship/<int:friendship_id>/<str:action>/', manage_friend_request, name='manage_friend_request'),
    path('users/friends/', list_friends, name='list_friends'),
    # Leaderboard
    path('leaderboard/', Leaderboard.as_view(), name='leaderboard'),
    # Game Results
    path('game_results/', GameCreate.as_view(), name='game_results'),
]
