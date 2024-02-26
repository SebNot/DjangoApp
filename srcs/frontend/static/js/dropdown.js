// dropdown.js - Update the dropdown based on the user's login state
document.addEventListener('DOMContentLoaded', checkLoginState);

function checkLoginState() {
    console.log('Checking login state');
    fetch('https://pong.42.fr/api/check_login_state/', {
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Server response was not ok');
        }
    })
    .then(data => {
        updateDropdownBasedOnLoginState(data.isLoggedIn);
    })
    .catch(error => {
        console.error('Error:', error);
        updateDropdownBasedOnLoginState(false);
    });
}
function updateDropdownBasedOnLoginState(isLoggedIn) {
    console.log('Updating dropdown based on login state:', isLoggedIn);
    const loginItem = document.querySelector('.dropdown-item[href="#login"]');
    const profileItem = document.querySelector('.dropdown-item[href="#account"]');
    const logoutItem = document.querySelector('.dropdown-item[id="logout-btn"]');

    loginItem.style.display = isLoggedIn ? 'none' : 'block';
    profileItem.style.display = isLoggedIn ? 'block' : 'none';
    logoutItem.style.display = isLoggedIn ? 'block' : 'none';

    if (logoutItem) {
        logoutItem.removeEventListener('click', logoutUser);
        logoutItem.addEventListener('click', logoutUser);
    }
}

function getCookie(name) {
    const cookieValue = document.cookie
        .split(';')
        .find(row => row.trim().startsWith(name))
        .split('=')[1];
    return decodeURIComponent(cookieValue);
}

function logoutUser() {
    console.log('Logging out');
    const csrftoken = getCookie('csrftoken');

    fetch('https://pong.42.fr/api/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => response.json())
    .then(data => {
        updateDropdownBasedOnLoginState(false);
        window.dispatchEvent(new Event('loginStateChange'));
        window.location.reload();
    });
}

export { checkLoginState, updateDropdownBasedOnLoginState, logoutUser, getCookie };