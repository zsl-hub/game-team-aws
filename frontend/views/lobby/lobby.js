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
document.getElementsByClassName("modalButton")[0].addEventListener("click", () => { createLobby() });
document.getElementsByClassName("modalButton")[1].addEventListener("click", () => { closeModal() });

function openModal() {
  var modal = document.getElementById("modalID");
  modal.style.display = "block";
}

function openJoinModal() {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "block";
}

function closeModal() {
  var modal = document.getElementById("modalID");
  modal.style.display = "none";
}

function createLobby() {
  var lobbyName = document.getElementById("text").value;
  var switchInput = document.querySelector('.switch input');
  var passwordInput = document.getElementById("passwordInput");
  var switchChecked = switchInput.checked;

  if (switchChecked) {
      var password = passwordInput.value;
      if (password.length < 4) {
          alert("Password must consist of at least 4 letters!");
          return;
      }
  }

  var newLobbyContainer = document.createElement("div");
  newLobbyContainer.className = "room";

  var newLobbyLink = document.createElement("a");
  newLobbyLink.className = "lobbyLink";
  newLobbyLink.href = "#";
  newLobbyLink.textContent = lobbyName;

  var joinButton = document.createElement("button");
  joinButton.className = "joinLobbyButton";
  joinButton.textContent = "JOIN";
  joinButton.onclick = openJoinModal;

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
  var passwordInputContainer = document.querySelector('.passwordContainer');
  var switchChecked = this.checked;

  if (switchChecked) {
      passwordInputContainer.style.display = "block";
  } else {
      passwordInputContainer.style.display = "none";
  }
}

function joinLobby() {
  var playerName = document.getElementById("player-name").value;
  var joinPassword = document.getElementById("join-password-input").value;

  // Your logic to join the lobby with the provided information goes here
  // You can implement this logic based on your requirements
  // For example, you can send an HTTP request to a server to validate the password and join the lobby
  // Or you can perform any other action that is necessary for joining the lobby

  // Once the player is successfully joined, you can close the join modal
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "none";
}


function openJoinModal() {
  var joinModal = document.getElementById("JoinModal");
  var switchInput = document.querySelector('.switch input');
  var passwordInputContainer = document.querySelector('.password-input-container');

  // Pobierz ikonę (lock lub unlock) w zależności od stanu przełącznika
  var iconSpan = document.querySelector('.material-symbols-outlined');
  var iconType = iconSpan.textContent;

  // Sprawdź typ ikony
  if (iconType === 'lock') {
      // Jeśli lobby jest prywatne (lock), wyświetl pole na hasło
      passwordInputContainer.style.display = "block";
  } else {
      // Jeśli lobby jest publiczne (unlock), ukryj pole na hasło
      passwordInputContainer.style.display = "none";
  }

  joinModal.style.display = "block";
}

const lobbyButton = document.getElementsByClassName('modalButton')[0]; 
const lobbyName = document.getElementById('text'); 
const isPrivate = document.querySelector('[type=checkbox]');
const lobbyPass = document.getElementById('passwordInput');

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
    console.error("Error:", error);
  }
});
