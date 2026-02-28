// Importamos Firebase (versión web modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCftXlHZliRxT9cSFwZHfxHfJPfl3N8jbg",
  authDomain: "impostor-3ro-2026.firebaseapp.com",
  databaseURL: "https://impostor-3ro-2026-default-rtdb.firebaseio.com",
  projectId: "impostor-3ro-2026",
  storageBucket: "impostor-3ro-2026.firebasestorage.app",
  messagingSenderId: "391509409814",
  appId: "1:391509409814:web:9b32c74ef07afaa3a43537",
  measurementId: "G-Z2ZY1Q76WZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 🚨 ÚNICA LISTA DE VARIABLES DEL COLEGIO 🚨
// ==========================================
const personajesColegio = [
    "Antonia", "Antonella", "Dariana", "Delfina", "Juana", 
    "Julia", "Justina", "Luciana", "Keila", "Juani", 
    "Kiara", "Seba", "Nico", "Nacho", "Matias",
    "Silvina (Mates)", "Marcos (Geografía)", "Mati Milia (PDL)", 
    "Adriana (F.Q)", "Agus (Biología)", "Lucía (Inglés)", 
    "Rena (Historia)", "(Computación)", "Sere (Ed. Física)", 
    "Lucía (Ciudadanía)", "Lucía (Artes combinadas)", "(Programación)"
];
// ==========================================

// Variables locales
let myPlayerId = `jugador_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Referencias HTML
const loginScreen = document.getElementById("login-screen");
const lobbyScreen = document.getElementById("lobby-screen");
const gameScreen = document.getElementById("game-screen");
const joinBtn = document.getElementById("join-btn");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const playerNameInput = document.getElementById("player-name");
const playerList = document.getElementById("player-list");
const playerCount = document.getElementById("player-count");
const waitingMsg = document.getElementById("waiting-msg");
const roleDisplay = document.getElementById("role-display");

// Referencias a la Base de Datos
const playersRef = ref(db, 'sala_1/jugadores');
const gameStateRef = ref(db, 'sala_1/estado_juego');

// Lógica de Ingreso
joinBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name === "") return alert("¡Poné un nombre!");

    const myRef = ref(db, `sala_1/jugadores/${myPlayerId}`);
    set(myRef, { nombre: name });
    onDisconnect(myRef).remove();

    loginScreen.classList.add("hidden");
    lobbyScreen.classList.remove("hidden");
});

// Escuchar cuántos jugadores hay
onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    const ids = Object.keys(players);
    const count = ids.length;
    
    playerCount.innerText = count;
    playerList.innerHTML = "";
    
    ids.forEach(id => {
        const li = document.createElement("li");
        li.innerText = players[id].nombre;
        playerList.appendChild(li);
    });

    if (count >= 3) {
        waitingMsg.classList.add("hidden");
        startBtn.classList.remove("hidden");
    } else {
        waitingMsg.classList.remove("hidden");
        startBtn.classList.add("hidden");
    }
});

// Lógica para empezar el juego
startBtn.addEventListener("click", () => {
    onValue(playersRef, (snapshot) => {
        const players = snapshot.val() || {};
        const ids = Object.keys(players);
        
        if (ids.length < 3) return;

        // 1 impostor y 1 palabra para el resto
        const randomImpostorId = ids[Math.floor(Math.random() * ids.length)];
        const randomWord = personajesColegio[Math.floor(Math.random() * personajesColegio.length)];

        set(gameStateRef, {
            jugando: true,
            impostorId: randomImpostorId,
            palabraSecreta: randomWord
        });
    }, { onlyOnce: true });
});

// Mostrar los roles a cada jugador
onValue(gameStateRef, (snapshot) => {
    const estado = snapshot.val();
    
    if (estado && estado.jugando) {
        lobbyScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        if (estado.impostorId === myPlayerId) {
            roleDisplay.innerHTML = `<span class="impostor-text">¡SOS EL IMPOSTOR! 🤫</span><br><br><small>Hacete el tonto y adiviná de quién están hablando.</small>`;
        } else {
            roleDisplay.innerHTML = `<span class="crewmate-text">La persona secreta es:</span><br><br><strong>${estado.palabraSecreta}</strong><br><br><small>Encontrá al impostor que no sabe quién es.</small>`;
        }
    } else {
        gameScreen.classList.add("hidden");
        if (!loginScreen.classList.contains("hidden") === false) {
             lobbyScreen.classList.remove("hidden");
        }
    }
});

// Reiniciar juego
resetBtn.addEventListener("click", () => {
    set(gameStateRef, { jugando: false });
});
