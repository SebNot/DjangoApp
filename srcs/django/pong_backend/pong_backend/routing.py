# routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path, re_path
from .consumers import PongGameConsumer

websocket_urlpatterns = [
    re_path(r'ws/pong/$', PongGameConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})
