import { getCookie } from "./dropdown.js";

function saveProfile() {
    let aliasElement = document.getElementById("profile-alias");
    let aliasText = aliasElement.innerText;
    aliasElement.setAttribute("contenteditable", "false");
    aliasElement.classList.remove("editableText");

    let btn = document.getElementById("edit-profile-btn");
    btn.innerHTML = '<button class="btn btn-lg btn-outline-success mt-1 p-4" onclick="editProfile()">Edit Profile</button>';

    updateUserProfile({ alias: aliasText });
}

function editProfile() {
    let alias = document.getElementById("profile-alias");
    alias.setAttribute("contenteditable", true);
    alias.classList.add("editableText");
    let btn = document.getElementById("edit-profile-btn");
    btn.innerHTML = '<button class="btn btn-lg btn-outline-success mt-1 p-4" onclick="saveProfile()">Save Profile</button>';
}

function updateUserProfile(updatedData) {
    const csrftoken = getCookie('csrftoken');

    fetch('https://pong.42.fr/api/profile/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile updated successfully:', data);
    })
    .catch(error => console.error('Error:', error));
}

window.editProfile = editProfile;
window.saveProfile = saveProfile;

export { saveProfile, editProfile }