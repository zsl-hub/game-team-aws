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

const lobbyButton = document.getElementsByClassName('modalButton')[0]; 
const lobbyName = document.getElementById('text'); 
const isPrivate = document.querySelector('[type=checkbox]');
const lobbyPass = document.getElementById('passwordInput');

lobbyButton.addEventListener('click', async e => {
  try {
    let requestBody = {
      lobbyName: lobbyName.value,
      isPrivate: isPrivate.checked,
      lobbyPass: lobbyPass.value
    };

    const res = await fetch(config.host + "/lobby/createLobby", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  } 
  catch (error) {
    console.error("Error:", error);
  }
});
