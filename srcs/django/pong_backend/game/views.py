# views.py
import secrets, requests, urllib.parse
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .models import UserProfile, Game
from .serializers import UserSerializer, UserProfileSerializer, GameSerializer
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.exceptions import NotAuthenticated, NotFound
from django.core.files.base import ContentFile

# These classes provide logic to handle requests to the API. 
# They work with serializers to validate and process incoming data and prepare it for models.
# ModelViewSet is used to automatically provide implementations for common actions like list, create, retrieve, update, and destroy.

import logging

logger = logging.getLogger(__name__)

# User Stuff (Profile CRUD, Authentication)
# Create User
class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        bot_user, created = User.objects.get_or_create(username='Bot')
        if created:
            UserProfile.objects.create(user=bot_user, alias='Bot')
        print("Received POST data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "message": "User created successfully",
            "user_id": user.id,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

# Log User In
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            response = Response({
                "message": "User logged in successfully",
                'token': token.key
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                'authToken', 
                token.key, 
                httponly=True, 
                secure=True, # secure=True sends the cookie over HTTPS only
                samesite='Strict', # Helps prevent CSRF attacks
                domain='.pong.42.fr',
                path='/'
            )
            return response
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

# Log User Out
class LogoutView(APIView):
    def post(self, request):
        print(request.COOKIES)
        logout(request)
        response = Response({"message": "Logged out successfully"})
        response.delete_cookie('authToken', domain='.pong.42.fr', path='/')
        response.delete_cookie('csrftoken', domain='pong.42.fr', path='/')
        return response

# Check if user is logged in
@api_view(['GET'])
def check_login_state(request):
    if request.user.is_authenticated:
        return Response({"isLoggedIn": True, "username": request.user.username})
    else:
        return Response({"isLoggedIn": False})

# Profile Details
class UserProfileDetail(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Read User Profile
    def get_queryset(self):
        # Filter the queryset based on the authenticated user
        return self.queryset.filter(user=self.request.user)
    def get_object(self):
        try:
            return self.get_queryset().get()
        except UserProfile.DoesNotExist:
            raise NotFound("UserProfile not found")

# Update User Profile
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

# Delete User + UserProfile using cascading delete
class UserDelete(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        try:
            user.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)



# Leaderboard View
class Leaderboard(generics.ListAPIView):
    queryset = UserProfile.objects.all().order_by('-wins')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]


# API endpoint to save game results in the database
class GameCreate(generics.CreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        player1_username = serializer.validated_data.pop('player1')
        player2_username = serializer.validated_data.pop('player2')
        winner_username = serializer.validated_data.pop('winner')

        try:
            player1 = User.objects.get(username=player1_username)
            player2 = User.objects.get(username=player2_username)
            winner = User.objects.get(username=winner_username)
        except User.DoesNotExist:
            raise ValidationError("One or more users do not exist")

        serializer.save(player1=player1, player2=player2, winner=winner)





# Friendship Views
# Send Friend Request
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_friend_request(request, friend_id):
    try:
        friend = User.objects.get(pk=friend_id)
        if request.user == friend:
            return Response({"error": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing friend request
        if Friendship.objects.filter(requester=request.user, friend=friend).exists():
            return Response({"error": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

        Friendship.objects.create(requester=request.user, friend=friend)
        return Response({"message": "Friend request sent."}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# Manage Friend Request
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def manage_friend_request(request, friendship_id, action):
    try:
        friendship = Friendship.objects.get(pk=friendship_id, friend=request.user)
        
        if action == 'accept':
            friendship.status = 'accepted'
            friendship.save()
            return Response({"message": "Friend request accepted."}, status=status.HTTP_200_OK)
        elif action == 'reject':
            friendship.delete()
            return Response({"message": "Friend request rejected."}, status=status.HTTP_204_NO_CONTENT)

    except Friendship.DoesNotExist:
        return Response({"error": "Friendship request not found."}, status=status.HTTP_404_NOT_FOUND)

# List Friends
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_friends(request):
    friends = User.objects.filter(
        Q(friendship_requests_sent__friend=request.user, friendship_requests_sent__status='accepted') |
        Q(friendship_requests_received__requester=request.user, friendship_requests_received__status='accepted')
    ).distinct()
    serializer = UserSerializer(friends, many=True)
    return Response(serializer.data)

