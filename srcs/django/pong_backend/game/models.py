# models.py
from django.contrib.auth.models import User
from django.db import models

# The classes below define the structure of the database tables. 
# Each class represents a table, and each attribute of the class is a field in the table.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    alias = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars', default='avatars/user-avatar.png')
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

# Game Model
class Game(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2')
    score_player1 = models.IntegerField()
    score_player2 = models.IntegerField()
    end_time = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_won')

# Frienship Model
class Friendship(models.Model):
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
    )

    requester = models.ForeignKey(User, related_name='friendship_requests_sent', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friendship_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='requested')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'friend')

    def __str__(self):
        return f"{self.requester.username} - {self.friend.username}"
