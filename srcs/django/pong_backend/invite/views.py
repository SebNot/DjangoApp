from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def invite_player_page(request):
    return render(request, 'invite/invite_player.html')

@csrf_exempt
def invite_player(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        player_nickname = data.get('nickname')
        
        # Here, implement your logic to handle the invitation
        # This could involve checking if the player exists, creating a game session, etc.

        return JsonResponse({'status': 'success', 'message': f'Invitation sent to {player_nickname}'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

