import { fetchProfileDetail, updateAliasInGame } from './fetchProfileDetail.js';
import { getCookie } from './dropdown.js';

let gameOn = 0;

export function isGameOn() {
  return gameOn === 1;
}

function initData(alias1, alias2) {
  let canvas = document.getElementById("pongCanvas");
  canvas.tabIndex = 1;
  if (!canvas) {
    console.error("Cannot find element with ID 'pongCanvas'");
    return;
  }
  canvas.width = 1000;
  canvas.height = canvas.width / 1.7;
  let ctx = canvas.getContext("2d");
  let gameOver = 0;

  resizeCanvas(canvas);
  let assets = new Assets(canvas, alias1, alias2);
  addGameEventListeners(assets);

  console.log(canvas.width);
  let data = {
    canvas: canvas,
    ctx: ctx,
    gameOver: gameOver,
    assets: assets,
  };
  data.assets.gameOver = gameOver;
  return data;
  play(data.assets, data.canvas, data.ctx);
}

class Assets {
  constructor(canvas, alias1, alias2) {
    this.randomBallDy = Math.random();
    this.randomBallDy = 1;
    if (this.randomBallDy < 0.3 && this.randomBallDy >= 0)
      this.randomBallDy = 1;
    if (this.randomBallDy > -0.3 && this.randomBallDy < 0)
      this.randomBallDy = -1;

    this.ballSpeed = canvas.width / 180;
    this.paddleSpeed = canvas.width / 200;
    // this.ballSpeed = 0;

    // this.ballSpeed = 4;
    // this.paddleSpeed = 4;

    this.paddleWidth = canvas.width / 100;
    this.paddleHeight = canvas.height / 5;
    this.ballSize = canvas.width / 110;
    this.leftPaddle = {
      x: 0,
      y: canvas.height / 2 - this.paddleHeight / 2,
      dy: 0,
    };
    this.rightPaddle = {
      x: canvas.width - this.paddleWidth,
      y: canvas.height / 2 - this.paddleHeight / 2,
      dy: 0,
    };
	this.ballStartDirection = -1;
    this.ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: this.ballStartDirection * this.ballSpeed,
      dy: this.ballSpeed * this.randomBallDy,
    };

	this.score1 = 0;
    this.score2 = 0;
    this.alias1 = alias1 || 'Player 1';
    this.alias2 = alias2 || 'Bot';
  }
}

// function adaptAssetsToCanvasSize(assets, canvas) {
// 	assets.paddleWidth = canvas.width / 100;
// 	assets.paddleHeight = canvas.height / 5;
// 	assets.leftPaddle.x = 0;
// 	assets.rightPaddle.x = canvas.width - assets.paddleWidth;
// 	assets.ballSize = canvas.width / 110;
// 	assets.ball.dx /= assets.ballSpeed;
// 	assets.ballSpeed = canvas.width / 300;
// 	assets.ball.dx *= assets.ballSpeed;
// 	assets.paddleSpeed = canvas.width / 180;
// }

function addBot(assets, canvas) {
  if (assets.ball.x > canvas.width / 2 && assets.ball.dx > 0) {
    if (assets.ball.y <= assets.rightPaddle.y + assets.paddleHeight / 2)
      assets.rightPaddle.dy = -assets.paddleSpeed;
    else if (assets.ball.y >= assets.rightPaddle.y + assets.paddleHeight / 2)
      assets.rightPaddle.dy = assets.paddleSpeed;
  } else assets.rightPaddle.dy = 0;
}

function displayScores(assets, ctx, canvas) {
	ctx.fillText(assets.score1, canvas.width / 4, 50);
	ctx.fillText(assets.score2, canvas.width * 3 / 4, 50);
}

function play(assets, canvas, ctx) {
  assets.gameOver = 0;
  gameOn = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  displayScores(assets, ctx, canvas);

  // adaptAssetsToCanvasSize(assets, canvas);

  ctx.fillStyle = "antiquewhite";
  // ctx.shadowColor = "green";
  // ctx.shadowBlur = 80;

  ctx.beginPath();
  ctx.roundRect(
    assets.leftPaddle.x,
    assets.leftPaddle.y,
    assets.paddleWidth,
    assets.paddleHeight,
    10,
  );
  ctx.roundRect(
    assets.rightPaddle.x,
    assets.rightPaddle.y,
    assets.paddleWidth,
    assets.paddleHeight,
    10,
  );
  ctx.fill();
  ctx.closePath();

  // Draw the ball
  ctx.beginPath();
  ctx.arc(assets.ball.x, assets.ball.y, assets.ballSize, 0, Math.PI * 2);

  ctx.fill();
  ctx.closePath();

  // Update ball position
  assets.ball.x += assets.ball.dx;
  assets.ball.y += assets.ball.dy;

  // Bounce off the top and bottom walls
  if (
    assets.ball.y + assets.ball.dy > canvas.height - assets.ballSize ||
    assets.ball.y + assets.ball.dy < assets.ballSize
  ) {
    assets.ball.dy = -assets.ball.dy;
  }

  // Check paddle collisions
  if (
    assets.ball.x - assets.ballSize < assets.leftPaddle.x &&
    assets.ball.y > assets.leftPaddle.y &&
    assets.ball.y < assets.leftPaddle.y + assets.paddleHeight
  ) {
    assets.ball.dx = -assets.ball.dx;
    if (assets.leftPaddle.dy > 0) {
      assets.ball.dy += 1;
      assets.ball.dx -= 1;
    } else if (assets.leftPaddle.dy < 0) assets.ball.dy -= 1;
  }

  if (
    assets.ball.x > assets.rightPaddle.x &&
    assets.ball.y > assets.rightPaddle.y &&
    assets.ball.y < assets.rightPaddle.y + assets.paddleHeight
  ) {
    assets.ball.dx = -assets.ball.dx;
    if (assets.rightPaddle.dy > 0) {
      assets.ball.dy += 1;
      assets.ball.dx -= 1;
    } else if (assets.rightPaddle.dy < 0) {
      assets.ball.dy -= 1;
    }
  }

  // Check game over
  if (assets.ball.x > canvas.width + 2) {
    assets.gameOver = 1;
    assets.score1 += 1;
    displayScores(assets, ctx, canvas);
    if (assets.score1 === 2) {
      showGameOver(assets, canvas, ctx);
      return;
    }
  } else if (assets.ball.x < -2) {
    assets.gameOver = 1;
    assets.score2 += 1;
    displayScores(assets, ctx, canvas);
    if (assets.score2 === 2) {
      showGameOver(assets, canvas, ctx);
      return;
    }
  }

  // Move paddles
  assets.leftPaddle.y += assets.leftPaddle.dy;
  assets.rightPaddle.y += assets.rightPaddle.dy;

  // Keep paddles within canvas bounds
  assets.leftPaddle.y = Math.max(
    0,
    Math.min(canvas.height - assets.paddleHeight, assets.leftPaddle.y),
  );
  assets.rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - assets.paddleHeight, assets.rightPaddle.y),
  );

  addBot(assets, canvas);

  // Request the next frame if game continues
  if (assets.gameOver == 0)
    requestAnimationFrame(() => play(assets, canvas, ctx));
  else if (assets.gameOver == 1) {
    setTimeout(() => {
      assets.gameOver = 0;
      assets.ball.x = canvas.width / 2;
      assets.ball.y = canvas.height / 2;
      assets.ballStartDirection *= -1;
      assets.ball.dx = assets.ballStartDirection * assets.ballSpeed;
      requestAnimationFrame(() => play(assets, canvas, ctx));
    }, 1500);
  }
}

// Handle keydown events
function eventKeydown(assets) {
  window.addEventListener("keydown", function (e) {
    e.preventDefault();
    switch (e.key) {
      case "ArrowUp":
        assets.rightPaddle.dy = -assets.paddleSpeed;
        break;
      case "ArrowDown":
        assets.rightPaddle.dy = assets.paddleSpeed;
        break;
      case "w":
        assets.leftPaddle.dy = -assets.paddleSpeed;
        break;
      case "s":
        assets.leftPaddle.dy = assets.paddleSpeed;
        break;
    }
  });
}

// Handle keyup events
function eventKeyup(assets) {
  window.addEventListener("keyup", function (e) {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
        assets.rightPaddle.dy = 0;
        break;
      case "w":
      case "s":
        assets.leftPaddle.dy = 0;
        break;
    }
  });
}

function addGameEventListeners(assets) {
  eventKeydown(assets);
  eventKeyup(assets);
}

function resizeCanvas(canvas) {
  const canvasParent = document.getElementById("canvasParent");
  canvas.width = canvasParent.clientWidth;
  canvas.height = canvasParent.clientWidth / 1.7;

  let header = document.getElementById("header");
  if (!header) return;
  if (canvas.height > window.innerHeight - header.offsetHeight) {
    canvas.height = window.innerHeight - header.offsetHeight;
    canvas.width = canvas.height * 1.7;
  }

  // if (canvas.height > window.innerHeight) {
  // 	canvas.height = window.innerHeight;
  // 	canvas.width = canvas.height * 1.7;
  // }
}

function showHeader() {
  let header = document.getElementById("header");
  header.classList.add("d-none");
}

function hideHeader() {
  let header = document.getElementById("header");
  header.classList.remove("d-none");
}

export function loadPongCanvas() {
	let pong = document.getElementById("page-content");
	pong.innerHTML =
	  '<div class="row justify-content-center"><div class="d-flex justify-content-center" id="canvasParent"><canvas id="pongCanvas" class="p-0"></canvas></div>';
	// updatePageContent("#game");
	if (window.innerHeight < 800) showHeader();
	// window.location.hash = '#game';
  
	fetchProfileDetail().then(profile => {
	  updateAliasInGame(profile.alias);
	  let data = initData(profile.alias, 'Bot');
	  console.log("Got profile.");
	  play(data.assets, data.canvas, data.ctx);
	});
}

window.loadPongCanvas = loadPongCanvas;

// Display game over screen and send the game result to the server
function showGameOver(assets, canvas, ctx) {
  gameOn = 0;
  if (window.innerHeight < 800) hideHeader();
  let winner = assets.score1 > assets.score2 ? assets.alias1 : assets.alias2;
  const event = new CustomEvent("gameOver", { 
    detail: {
      winner: winner,
      loser: winner === assets.alias1 ? assets.alias2 : assets.alias1,
      score1: assets.score1,
      score2: assets.score2,
      alias1: assets.alias1,
      alias2: assets.alias2
    } 
  });
  window.dispatchEvent(event);
  displayScores(assets, ctx, canvas);
}

// Logic to send game result to the server
window.addEventListener('gameOver', function(e) {
  const { winner, loser, score1, score2, alias1, alias2 } = e.detail;
  const winnerScore = winner === alias1 ? score1 : score2;
  const loserScore = winner === alias1 ? score2 : score1;
  sendGameResult(winner, loser, winnerScore, loserScore);
});

function sendGameResult(winner, loser, winnerScore, loserScore) {
  console.log('Sending game result to server.');
  const url = '/api/game_results/';
  const data = {
      player1: winner,
      player2: loser,
      score_player1: winnerScore,
      score_player2: loserScore,
      winner: winner
  };
  const csrftoken = getCookie('csrftoken');

  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
      },
      credentials: 'include',
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });
}

export { initData };

// function addPlayButtonEventListeners() {
// 	console.log('hello');
// 	let button = document.getElementById("btn-play-vs-ai");
// 	button.addEventListener("click", function() {
// 		let data = initData();
// 		updatePageContent("#game");
// 		play();
// 	});
// }


