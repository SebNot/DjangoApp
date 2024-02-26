// router.js
import { updateDropdownBasedOnLoginState } from './dropdown.js';
import { handleFormSubmission } from './handleFormSubmission.js';
import { fetchProfileDetail } from './fetchProfileDetail.js';
import { editProfile, saveProfile } from './editProfileDetail.js';
import { checkLoginState } from './dropdown.js';
import { initData, isGameOn } from './pong.js';

function updatePageContent(path, winner) {
	if (isGameOn())
		return ;

	let routes = {
		404: "pages/404.html",
		"#": "pages/welcome.html",
		"#new-account": "pages/new-account.html",
		"#account": "pages/account.html",
		"#new-game": "pages/new-game.html",
		"#game": "pages/pong-game.html",
		"#game-over": "pages/game-over.html",
		"#leaderboard": "pages/leaderboard.html",
		"#stats": "pages/player-stats.html",
		"#login": "pages/login.html",
	}

	let hash;
	if (path) {
		hash = path;
		window.history.pushState({}, "", path);
	}
	else
		hash = window.location.hash;
	if (hash.length == 0)
		hash = "#";
	let element = document.getElementById("page-content");
	
	console.log(window.location.pathname);

	let route = routes[hash] || routes[404];
	console.log(route);
	fetch(route)
	.then(response => response.text())
	.then(html => {
		// console.log(html);
		element.innerHTML = html;
		checkLoginState();
		if (hash === '#new-account') {
			handleFormSubmission('registration-form');
		}
		if (hash === '#login') {
			handleFormSubmission('login-form');
		}
		if (hash === '#account') {
			editProfile();
			saveProfile();
			fetchProfileDetail();
		}
		if (hash === '#game') {
			initData('Player1', 'Bot');
		}
		if (hash === '#game-over' && winner) {
			document.getElementById('gameover-winner-display-tag').textContent = winner.winner;
		}
		updateDropdownBasedOnLoginState();
		return element.innerHTML
	})
	.catch(error => {
		console.error(error);
	});
}

updatePageContent(window.location.hash);

window.addEventListener("hashchange", function(e) {
	e.preventDefault();
	updatePageContent(null);
});

window.addEventListener('gameOver', function (e) {
	updatePageContent("#game-over", e.detail);
});

window.addEventListener('loginStateChange', updateDropdownBasedOnLoginState);

export { updatePageContent };