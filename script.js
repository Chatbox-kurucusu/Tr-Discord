// script.js - Final Modifiye

const firebaseConfig = {
    apiKey: "AIzaSyCRIUfi1DcRor7dXhFKFlae4dk7xd-nmhU",
    authDomain: "tr-discord-8c617.firebaseapp.com",
    projectId: "tr-discord-8c617",
    databaseURL: "https://tr-discord-8c617-default-rtdb.firebaseio.com",
    storageBucket: "tr-discord-8c617.firebasestorage.app",
    messagingSenderId: "359429496919",
    appId: "1:359429496919:web:003c80f3bdfc7e70c5c312",
    measurementId: "G-7VEM8HVXXD"
};

// Başlatma (Sadece bir kez)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let currentUser = "";
let currentRoomId = null;
let isOwner = false;

// Giriş Yap Butonu Mantığı
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.onclick = function() {
            const userInput = document.getElementById('username');
            if (!userInput.value.trim()) {
                alert("İsim girin.");
                return;
            }
            currentUser = userInput.value.trim();
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('display-name').innerText = "Kullanıcı: " + currentUser;
            listenRooms();
        };
    }
});

// GRUP KURMA (SENİN TAKILDIĞIN YER)
function createRoom() {
    const rName = prompt("Grup ismi belirleyin:");
    if (!rName) return;

    const newRoomRef = db.ref('rooms').push();
    const roomId = newRoomRef.key; // Oda ID'sini önceden alalım

    newRoomRef.set({
        name: rName,
        owner: currentUser,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log("Grup kuruldu, giriş yapılıyor...");
        joinRoom(roomId, rName, true); // Başarıyla kurulunca odaya sok
    }).catch((error) => {
        console.error("Grup kurulurken hata oluştu:", error);
    });
}

// Odaya Giriş (Chat Ekranını Açan Fonksiyon)
function joinRoom(roomId, rName, ownerStatus) {
    currentRoomId = roomId;
    isOwner = ownerStatus;
    
    // UI Değişiklikleri
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('active-room-name').innerText = rName;
    
    // Mesajları dinlemeye başla
    db.ref(`messages/${roomId}`).off(); // Varsa eski dinleyiciyi kapat
    db.ref(`messages/${roomId}`).on('value', (snap) => {
        const area = document.getElementById('messageArea');
        area.innerHTML = "";
        snap.forEach((m) => {
            const data = m.val();
            const div = document.createElement('div');
            div.className = `msg ${data.user === currentUser ? 'me' : 'other'}`;
            div.innerText = data.user + ": " + data.text;
            area.appendChild(div);
        });
        area.scrollTop = area.scrollHeight;
    });

    // Eğer sahipse istekleri dinle
    if (isOwner) {
        db.ref(`requests/${roomId}`).on('child_added', (snap) => {
            if (snap.val().status === 'pending') {
                window.lastRequester = snap.key;
                document.getElementById('request-text').innerText = snap.key + " katılmak istiyor.";
                document.getElementById('request-modal').style.display = 'block';
            }
        });
    }
}

// Odaları Listeleme (Arama ve Seçme)
function listenRooms() {
    db.ref('rooms').on('value', (snap) => {
        const list = document.getElementById('roomList');
        list.innerHTML = "";
        snap.forEach((child) => {
            const room = child.val();
            const div = document.createElement('div');
            div.className = 'room-item';
            div.innerHTML = `<strong>${room.name}</strong><br><small>Kurucu: ${room.owner}</small>`;
            div.onclick = function() { requestToJoin(child.key, room.name, room.owner); };
            list.appendChild(div);
        });
    });
}

// Diğer fonksiyonlar (sendMessage, leaveRoom, answerRequest) aynı kalsın...