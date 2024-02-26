# tests.py
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import UserProfile

class UserRegistrationTest(APITestCase):
    def test_user_registration(self):
        data = {"username": "testuser", "password": "testpassword123"}
        response = self.client.post(reverse('user-register'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())
        self.assertTrue(UserProfile.objects.filter(user__username="testuser").exists())

class UserProfileTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword123")
        self.profile = UserProfile.objects.create(user=self.user, alias="testalias")
        self.url = reverse('user-profile')

    def test_profile_update_unauthenticated(self):
        data = {"alias": "newalias"}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_profile_update_authenticated(self):
        self.client.force_authenticate(user=self.user)
        data = {"alias": "newalias"}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.alias, "newalias")
