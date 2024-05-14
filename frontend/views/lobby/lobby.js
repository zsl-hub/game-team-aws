document.addEventListener('DOMContentLoaded', function() {
  checkOverflow();

  window.addEventListener('resize', function() {
      checkOverflow();
  });

  var switchInput = document.querySelector('.switch input');
  switchInput.addEventListener('change', togglePasswordInput);

  switchInput.addEventListener('change', function() {
      var iconSpan = document.querySelector('.material-symbols-outlined');
      if (this.checked) {
          iconSpan.textContent = 'lock';
      } else {
          iconSpan.textContent = 'lock_open';
      }
  });
});




function openModal() {
  var modal = document.getElementById("ModalID");
  modal.style.display = "block";
}

function openJoinModal() {
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "block";
}

function closeModal() {
  var modal = document.getElementById("ModalID");
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

        var lobbyTemplate = document.getElementById("lobbyTemplate");
        var newLobbyContainer = lobbyTemplate.cloneNode(true);
        newLobbyContainer.removeAttribute("id");
        newLobbyContainer.style.display = "block";

        var lobbyNameSpan = newLobbyContainer.querySelector(".text123");
        lobbyNameSpan.textContent = lobbyName;

        var iconSpan = newLobbyContainer.querySelector(".material-symbols-outlined");
        iconSpan.textContent = switchChecked ? "lock" : "lock_open";

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
  var joinModal = document.getElementById("JoinModal");
  joinModal.style.display = "none";
}


function openJoinModal() {
  var joinModal = document.getElementById("JoinModal");
  var switchInput = document.querySelector('.switch input');
  var passwordInputContainer = document.querySelector('.password-input-container');

  var iconSpan = document.querySelector('.material-symbols-outlined');
  var iconType = iconSpan.textContent;

  if (iconType === 'lock') {
      passwordInputContainer.style.display = "block";
  } else {
      passwordInputContainer.style.display = "none";
  }

  joinModal.style.display = "block";
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