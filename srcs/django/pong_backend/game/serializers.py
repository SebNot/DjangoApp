# serializer.py
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import serializers
from .models import UserProfile, Game, Friendship
from django.conf import settings

# These classes are responsible for converting complex data types, like querysets and model instances, 
# to native Python datatypes that can then be easily rendered into JSON/XML, and vice versa. 
# This serialization/deserialization is crucial for sending data to a front-end application.
# Each serializer corresponds to a model, specifying which fields should be included in the serialized data.

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, alias=user.username)
        Token.objects.create(user=user)
        return user

    def get_username(self, obj):
        return obj.user.username

    def get_avatar_url(self, obj):
        if obj.avatar:
            return self.context['request'].build_absolute_uri(settings.MEDIA_URL + str(obj.avatar))
        else:
            return None


# UserProfile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'alias', 'avatar', 'wins', 'losses']

    def get_username(self, obj):
        return obj.user.username


# GameResult Serializer
class GameSerializer(serializers.ModelSerializer):
    player1 = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username'
    )
    player2 = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username'
    )
    winner = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username'
    )

    class Meta:
        model = Game
        fields = ['player1', 'player2', 'score_player1', 'score_player2', 'winner']


# Friendship Serializer
class FriendshipSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    friend = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ['requester', 'friend', 'status', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        requester = self.context['request'].user
        friend = User.objects.get(pk=validated_data['friend_id'])
        friendship = Friendship.objects.create(requester=requester, friend=friend)
        return friendship
