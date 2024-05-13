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

function openModal() {
  var modal = document.getElementById("ModalneID");
  modal.style.display = "block";
}

function openJoinModal() {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "block";
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
  var passwordInputContainer = document.querySelector('.password-input-container');
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
