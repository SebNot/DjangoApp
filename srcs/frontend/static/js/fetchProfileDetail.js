// fetchUserProfile.js
function fetchProfileDetail() {
    console.log("Fetching User Profile.");
    return fetch('https://pong.42.fr/api/profile/', { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        updateProfileInfo(data);
        return data;
    })
    .catch(error => console.error('Error:', error));
}

function updateAliasInGame(alias) {
    console.log("Updating Alias in Game.");
    console.log(alias);
    let aliasElement = document.getElementById('alias1');
    if (aliasElement)
        aliasElement.textContent = alias;
}

function updateProfileInfo(profile) {
    let avatarElement = document.getElementById('profile-avatar');
    let aliasElement = document.getElementById('profile-alias');
    let usernameElement = document.getElementById('profile-username');
    let winsElement = document.getElementById('profile-wins');
    let lossesElement = document.getElementById('profile-losses');

    if (avatarElement && profile.avatar)
        avatarElement.src = profile.avatar;
    if (aliasElement && profile.alias)
        aliasElement.textContent = profile.alias;
    if (usernameElement && profile.username)
        usernameElement.textContent = profile.username;
    if (winsElement && profile.wins)
        winsElement.textContent = profile.wins;
    if (lossesElement && profile.losses)
        lossesElement.textContent = profile.losses;
}

export { fetchProfileDetail, updateAliasInGame };
