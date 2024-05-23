import config from "../../config/config.json";

assignOpenJoinModalListeners();
document.getElementById("open-modal").addEventListener("click", () => { openModal(); });
document.getElementById("close-modal").addEventListener("click", () => { closeModal(); });
document.getElementById("join-lobby").addEventListener("click", () => { joinLobby(); });
document.getElementById("modal-button-cancel").addEventListener("click", () => { CancelLobby(); });
document.getElementById("create-lobby").addEventListener("click", () => { createLobby(); });

function assignOpenJoinModalListeners() {
  const elements = document.getElementsByClassName("open-join-modal");
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", () => { openJoinModal(elements[i].parentNode); });
  }
}

// asdfsa
// asdasd

document.addEventListener('DOMContentLoaded', function() {
  var switchInput = document.querySelector('#privacyCheckbox');
  switchInput.addEventListener('change', togglePasswordInput);

  switchInput.addEventListener('change', function() {
    var iconSpan = document.querySelector('.material-symbols-outlined');
    if (this.checked) {
      iconSpan.textContent = 'lock';
    } else {
      iconSpan.textContent = 'lock_open';
    }
  });

  // SDFNSDUATYFVSAVFYASFVACTRSADFASF

  const container = document.querySelector('.container');
  if (container) {
    container.scrollLeft += 20;
  }

  getAllLobbies();
}); 

function openModal() {
  var modal = document.getElementById("ModalID");
  modal.style.display = "block";
}

/**
 * 
 * @param {HTMLElement} ele 
 */
function openJoinModal(ele) {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "block";

  const element = document.createElement("div");
  element.style.display = "none";
  element.innerText = ele.children[0].textContent;
  element.id = "data";
  joinModal.appendChild(element);
}

function closeModal() {
  var modal = document.getElementById("ModalID");
  modal.style.display = "none";
}

function createLobby() {
  var lobbyName = document.getElementById("text").value;
  var switchInput = document.querySelector('#privacyCheckbox');
  var passwordInput = document.getElementById("password-input");
  var switchChecked = switchInput.checked;

  if (switchChecked) {
    var password = passwordInput.value;
    if (password.length < 4) {
      alert("Hasło musi mieć co najmniej 4 znaki!");
      return;
    }
  }

  var lobbyTemplate = document.getElementById("lobbyTemplate");
  var newLobbyContainer = lobbyTemplate.cloneNode(true);
  newLobbyContainer.removeAttribute("id");
  newLobbyContainer.style.display = "block";

  // Set lobby name
  var lobbyNameSpan = newLobbyContainer.querySelector(".text123");
  lobbyNameSpan.textContent = lobbyName;

  // Create and set number of players
  var nrOfPplSpan = document.createElement("span");
  nrOfPplSpan.className = "nr_of_ppl";
  nrOfPplSpan.textContent = "1/2";

  // Create and set lobby status
  var lobbyStatusSpan = document.createElement("span");
  lobbyStatusSpan.className = "isFull";
  lobbyStatusSpan.textContent = "Waiting";

  // Create join button
  var joinButton = document.createElement("button");
  joinButton.textContent = "Join";
  joinButton.className = "join-button";

  // Set lock icon
  var iconSpan = newLobbyContainer.querySelector(".material-symbols-outlined");
  iconSpan.textContent = switchChecked ? "lock" : "lock_open";

  // Append elements in the correct order
  var lobbyContent = newLobbyContainer.querySelector("a");
  lobbyContent.appendChild(lobbyNameSpan);
  lobbyContent.appendChild(nrOfPplSpan);
  lobbyContent.appendChild(lobbyStatusSpan);
  lobbyContent.appendChild(joinButton);
  lobbyContent.appendChild(iconSpan);

  // Append the new lobby container to the lobby list
  var lobbyContainer = document.querySelector(".lobby");
  lobbyContainer.appendChild(newLobbyContainer);

  // Reassign event listeners to the new join buttons
  assignOpenJoinModalListeners();

  // Close the modal after creating the lobby
  closeModal();
}


function createLobbyFromDatabase(data) {
  if (Array.isArray(data.Items)) {
    data.Items.forEach(lobby => {
      var lobbyName = lobby.lobbyName;
      var passwordInput = lobby.lobbyPass;
      var switchChecked = lobby.isPrivate;
      let lobbyStatus = lobby.lobbyStatus; 

      if (switchChecked) {
        var password = passwordInput;
        /*if (password.length < 4) {
            //alert("Hasło musi mieć co najmniej 4 znaki!");
            return;
        }*/
      }
      var lobbyTemplate = document.getElementById("lobbyTemplate");
      var newLobbyContainer = lobbyTemplate.cloneNode(true);
      newLobbyContainer.removeAttribute("id");
      newLobbyContainer.style.display = "block";

      var lobbyNameSpan = newLobbyContainer.querySelector(".text123");
      lobbyNameSpan.textContent = lobbyName;

      var nrOfPplSpan = document.createElement("span");
      nrOfPplSpan.className = "nr_of_ppl";
      if (lobbyStatus === 'waiting'){
        nrOfPplSpan.textContent = "1/2";
      } else if (lobbyStatus === 'playing') {
        nrOfPplSpan.textContent = "2/2";
      }

      var lobbyStatusSpan = document.createElement("span");
      lobbyStatusSpan.className = "isFull";
      lobbyStatusSpan.textContent = lobbyStatus;

      var joinButton = document.createElement("button");
      joinButton.textContent = "Join";
      joinButton.className = "join-button open-join-modal";

      var iconSpan = newLobbyContainer.querySelector(".material-symbols-outlined");
      iconSpan.textContent = switchChecked ? "lock" : "lock_open";

      var lobbyContainer = document.querySelector(".lobby");
      lobbyContainer.appendChild(newLobbyContainer);

      var lobbyContent = newLobbyContainer.querySelector("a");
      lobbyContent.appendChild(lobbyNameSpan);
      lobbyContent.appendChild(nrOfPplSpan);
      lobbyContent.appendChild(lobbyStatusSpan);
      lobbyContent.appendChild(joinButton);
      lobbyContent.appendChild(iconSpan);

      var lobbyContainer = document.querySelector(".lobby");
      lobbyContainer.appendChild(newLobbyContainer);

      assignOpenJoinModalListeners();

      closeModal();
    });
  } 
  else {
    console.error('Invalid data format: Items property is not an array.');
  }
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

async function joinLobby() {
  var playerName = document.getElementById("player-name").value;
  var joinPassword = document.getElementById("join-password-input").value;

  var joinModal = document.getElementById("JoinModal");

  let dataEle = document.getElementById("data");
  let data = dataEle.innerText;

  let requestData = {
    lobbyName: data,
    player2: playerName,
    lobbyPass: joinPassword
  }
  dataEle.remove();
  joinModal.style.display = "none";

  try {
    const res = await fetch(config.host + "/lobby/joinLobby", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const responseData = await res.json();

    if (res.ok) {
      console.log("Successfully joined lobby:", responseData.message);
      console.log(responseData);
      window.location.href = "../game/index.html?lobbyId=" + responseData.lobbyId + "&playerId=" + responseData.player2;
    } 
    else {
      if (res.status === 401) {
        console.error("Failed to join lobby:", responseData.message);
      } 
      else if (res.status === 403) {
        console.error("Failed to join lobby:", responseData.message);
      } 
      else {
        console.error("Failed to join lobby - Unknown error:");
      }
    }
  } 
  catch (error) {
    console.error("Network error or exception:", error);
  }
}

let x1=0, y1=0;
window.client
const 
  vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  dist_to_draw = 50,
  delay = 1000,
  fsize = [
    '1.1rem', '1.4rem', '.8rem', '1.7rem'
  ],
  colors = [
  '#E23636',
  '#F9F3EE',
  '#E1F8DC',
  '#B8AFE6',
  '#AEE1CD',
  '#5EB0E5'
],
  rand = (min, max) => 
    Math.floor(Math.random() * (max - min + 1)) + min,
  selRand = (o) => o[rand(0, o.length -1)],
  distanceTo =  (x1, y1, x2, y2) => 
    Math.sqrt((Math.pow(x2-x1,2))+(Math.pow(y2-y1,2))),
  shouldDraw = (x, y) => 
    (distanceTo(x1, y1, x, y) >= dist_to_draw),
  addStr = (x, y) => {
    const str = document.createElement("div");
    str.innerHTML = '&#10022;';
    str.className = 'star';
    str.style.top = `${y + rand(-20,20)}px`;
    str.style.left = `${x}px`;
    str.style.color = selRand(colors);
    str.style.fontSize = selRand(fsize);
    document.body.appendChild(str);
    const fs = 10 + 5 * parseFloat(getComputedStyle(str).fontSize);
    str.animate({
      translate: `0 ${(y+fs)>vh?vh-y:fs}px`,
      opacity: 0,
      transform: `rotateX(${rand(1, 500)}deg) rotateY(${rand(1, 500)}deg)`
    }, {
      duration: delay,
      fill: 'forwards',

    });
    setTimeout(() => {
        str.remove();
      }, delay);
  }

addEventListener("mousemove", (e) => {
  const {clientX, clientY} = e;
  if(shouldDraw(clientX, clientY)){
    addStr(clientX, clientY);
    x1 = clientX;
    y1 = clientY;
  }
});

function CancelLobby() {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "none";
}

/*
function CancelLobby() {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "none";
}function checkOverflow() {
  var lobbies = document.querySelectorAll('.lobby');

  lobbies.forEach(function(lobby) {
    if (lobby.scrollHeight > lobby.clientHeight) {
      lobby.style.overflowY = 'scroll';
    } else {
      lobby.style.overflowY = 'hidden';
    }
  });
}

*/

const createLobbyButton = document.getElementById('create-lobby');
const lobbyCreator = document.getElementById('lobbyCreator');
const lobbyName = document.getElementById('text'); 
const isPrivate = document.querySelector("#privacyCheckbox");
const lobbyPass = document.getElementById('password-input');

createLobbyButton.addEventListener('click', async e => {
  try {
    let requestBody = {
      lobbyName: lobbyName.value,
      isPrivate: isPrivate.checked,
      lobbyPass: lobbyPass.value,
      lobbyStatus: 'waiting',
      player1: lobbyCreator.value
    };

    const res = await fetch(config.host + "/lobby/createLobby", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }); 

    if (res.ok) {
      const responseData = await res.json();
      window.location.href = "../game/index.html?lobbyId=" + responseData.lobbyId + "&playerId=" + responseData.player1;
    } else {
      console.error("Failed to create lobby");
    }
    const data = await response.json();
    console.log(data); 
    createLobbyFromDatabase(data);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
});

 async function getAllLobbies() {
  try {
    const response = await fetch(config.host + '/lobby');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
    createLobbyFromDatabase(data);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const checkbox = document.getElementById('privacyCheckbox');
  const label = document.getElementById('privacyLabel');
  checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
      label.textContent = 'Private';
    } else {
      label.textContent = 'Public';
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  getAllLobbies();
});
