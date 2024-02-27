import { loadPongCanvas, mainSocket } from './pong.js';


export function invitePlayer() {

    let nickname = prompt("Please enter nickname of user" );
    if (nickname == null) {
        return;
    }

    fetch('https://pong.42.fr/api/invite-player/', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({nickname: nickname}),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Server response was not ok');
        }
    })
    .then(data => {
        console.log(data);
        sendInvite(data.room_id, data.user_id);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

window.invitePlayer = invitePlayer;

function joinRoom(roomId) {
  var room_name = roomId;
  var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
  var ws_path = ws_scheme + '://' + window.location.host + "/api/room/" + room_name + "/";
  console.log("Connecting to " + ws_path);
  var socket = new WebSocket(ws_path);

  socket.onopen = function() {
      console.log("WebSocket connection to room " + room_name + " opened.");

      loadPongCanvas();
  };

  socket.onmessage = function(e) {
      var data = JSON.parse(e.data);
      console.log("Message from server: ", data);
  };

  socket.onclose = function(e) {
      console.error('WebSocket connection closed.');
  };

  socket.onerror = function(e) {
      console.error('WebSocket encountered error: ', e.message, 'Closing socket');
      socket.close();
  };

  // You can store the socket variable globally if you need to access it from other functions
  window.socket = socket;
  return socket;
}

function sendInvite(roomId, user_id) {
    mainSocket.send(JSON.stringify({
        type: 'invite',
        room_id: roomId,
        user_id: user_id,
    }));
    joinRoom(roomId);
}

mainSocket.onmessage = function(e) {
    var data = JSON.parse(e.data);
    console.log("Message from server: ", data);
    if (data.message.type === 'invite') {
        console.log(localStorage.getItem('current_user'));
        if (data.message.user_id != localStorage.getItem('current_user'))
            return;
        var accept = confirm("You have been invited to play a game by " + data.nickname + ". Do you accept?");
        if (accept) {
            joinRoom(data.message.room_id);
        }
    }
}
