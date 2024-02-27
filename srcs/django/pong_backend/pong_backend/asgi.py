import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from .consumers import PongGameConsumer, RoomGameConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pong_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [
                re_path(r'api/pong/(?P<room_name>\w+)/$', PongGameConsumer.as_asgi()),
                re_path('api/room/(?P<room_name>\w+)/$', RoomGameConsumer.as_asgi(), name='room'),
            ]
        )
    ),
})
