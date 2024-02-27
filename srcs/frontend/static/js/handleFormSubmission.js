// handleFormSubmission.js
import { updateDropdownBasedOnLoginState, checkLoginState, logoutUser } from './dropdown.js';

// This file is responsible for handling form submissions.
// It listens for form submissions and prevents the default form submission behavior.
// It then extracts the form data and sends it to the backend to be processed.
// It also updates the UI based on the user's login state.
// It is used in the router.js file to handle form submissions for the registration and login forms.

function handleFormSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.log('Form not found:', formId);
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (formId === 'login-form') {
            const username = form.querySelector('#loginNickname').value;
            const password = form.querySelector('#loginPassword').value;
            loginUser(username, password);
        } else if (formId === 'registration-form') {
            const username = form.querySelector('#inputNickname').value;
            const password = form.querySelector('#inputPassword').value;
            registerUser(username, password);
        }
    });
}

function loginUser(username, password) {
    console.log('Logging in:', username);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('https://pong.42.fr/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // update UI
            window.location.href = '/#account';
            updateDropdownBasedOnLoginState();
            window.dispatchEvent(new Event('loginStateChange'));
            localStorage.setItem('current_user', data.user_id);
        } else {
            console.error('Login failed:', data.error);
            // Display error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.addEventListener('click', logoutUser);
    }
    checkLoginState();
});

function registerUser(username, password) {
    fetch('https://pong.42.fr/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'

    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // update UI
            window.location.href = '/#account';
            updateDropdownBasedOnLoginState();
            localStorage.setItem('current_user', data.user_id);
        } else {
            console.error('Registration failed:', data.error);
            // Display error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export { handleFormSubmission };
