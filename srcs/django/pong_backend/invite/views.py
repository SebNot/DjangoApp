from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
from channels.layers import get_channel_layer
from pong_backend.consumers import PongGameConsumer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from datetime import datetime


def invite_player_page(request):
    return render(request, 'invite/invite_player.html')

@csrf_exempt
def invite_player(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        player_nickname = data.get('nickname')
        user = User.objects.filter(username=player_nickname).first()
        if not user or user == request.user:
            return JsonResponse({'status': 'error', 'message': 'Player not found'}, status=404)

        # Here, implement your logic to handle the invitation
        # This could involve checking if the player exists, creating a game session, etc.
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        room_id = f'{request.user.username}_{player_nickname}_{timestamp}'

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            user.username,  # Group name
            {
                "type": "invite_message",
                "message": "You have been invited to a game!",
            }
        )
        return JsonResponse({'status': 'success', 'room_id': f'{room_id}', 'user_id': f'{user.id}'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
