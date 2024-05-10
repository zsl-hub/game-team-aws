// const dotenv = require('dotenv').config();
import config from "../../config/config.json";

document.addEventListener('DOMContentLoaded', function() {
  checkOverflow();

  window.addEventListener('resize', function() {
      checkOverflow();
  });

  // Add event listener for the switch toggle
  var switchInput = document.querySelector('.switch input');
  switchInput.addEventListener('change', togglePasswordInput);

  // Change icon based on switch state
  switchInput.addEventListener('change', function() {
      var iconSpan = document.querySelector('.material-symbols-outlined');
      if (this.checked) {
          iconSpan.textContent = 'lock';
      } else {
          iconSpan.textContent = 'lock_open'; // unlock icon
      }
  });
});

function checkOverflow() {
  var lobby = document.querySelector('.lobby');

  if (lobby.scrollHeight > lobby.clientHeight) {
      lobby.style.overflowY = 'scroll';
  } else {
      lobby.style.overflowY = 'hidden';
  }
}

document.getElementById("openmodal").addEventListener("click", () => { openModal(); });
document.getElementsByClassName("modalne-przycisk")[0].addEventListener("click", () => { createLobby() });
document.getElementsByClassName("modalne-przycisk")[1].addEventListener("click", () => { closeModla() });

function openModal() {
  var modal = document.getElementById("ModalneID");
  modal.style.display = "block";
}

function closeModal() {
  var modal = document.getElementById("ModalneID");
  modal.style.display = "none";
}

function createLobby() {
  var lobbyName = document.getElementById("text").value;
  var switchInput = document.querySelector('.switch input');
  var passwordInput = document.getElementById("password-input");
  var switchChecked = switchInput.checked;

  if (switchChecked) {
      var password = passwordInput.value;
      if (password.length < 4) {
          alert("Hasło musi mieć co najmniej 4 znaki!");
          return;
      }
  }

  var newLobbyContainer = document.createElement("div");
  newLobbyContainer.className = "gry";

  var newLobbyLink = document.createElement("a");
  newLobbyLink.className = "lobby-link";
  newLobbyLink.href = "#";
  newLobbyLink.textContent = lobbyName;

  var joinButton = document.createElement("button");
  joinButton.className = "join1";
  joinButton.textContent = "JOIN";

  var iconSpan = document.createElement("span");
  iconSpan.className = "material-symbols-outlined";
  if (switchChecked) {
      iconSpan.textContent = "lock";
  } else {
      iconSpan.textContent = "lock_open"; 
  }

  newLobbyContainer.appendChild(newLobbyLink);
  newLobbyContainer.appendChild(joinButton);
  newLobbyContainer.appendChild(iconSpan);

  var lobbyContainer = document.querySelector(".lobby");
  lobbyContainer.appendChild(newLobbyContainer);

  closeModal();
}

function togglePasswordInput() {
  var passwordInputContainer = document.querySelector('.password-input-container');
  var switchChecked = this.checked;

  if (switchChecked) {
      passwordInputContainer.style.display = "block";
  } else {
      passwordInputContainer.style.display = "none";
  }
}



const lobbyButton = document.getElementsByClassName('modalne-przycisk')[0]; 
const lobbyName = document.getElementById('text'); 
const isPrivate = document.querySelector('[type=checkbox]');
const lobbyPass = document.getElementById('password-input');

lobbyButton.addEventListener('click', async e => {
  try {
    const res = await fetch(config.host + "/api/createLobby", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lobbyName: lobbyName.value,
        isPrivate: isPrivate.checked,
        lobbyPass: lobbyPass.value
      })
    });
  } catch (error) {
    console.error("Wystąpił błąd:", error);
  }
});
