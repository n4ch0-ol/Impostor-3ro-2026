@ -1,10 +1,17 @@
// Importamos Firebase (versión web modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// ⚠️ ACÁ VAN TUS CREDENCIALES DE FIREBASE
// Tus credenciales de Firebase
const firebaseConfig = {
  // Tus datos irán acá
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
@ -13,46 +20,45 @@
// ==========================================
// 🚨 ÚNICA LISTA DE VARIABLES DEL COLEGIO 🚨
// ==========================================
// Están todos mezclados: nadie sabe si tocará profe o alumno
const personajesColegio = [
    "Antonia", "Antonella", "Ana", "Delfina", "Juana Cattoni", 
    "Julia", "Justina", "Luciana", "Keila", "Juani", 
    "Kiara", "Seba", "Nico", "Nacho", "Mati", "Maura",
    "Silvina (Mates)", "Marcos (Geografía)", "Mati Milia (PDL)", 
    "Adriana (F.Q)", "Agus (Biología)", "Lucía (Inglés)", 
    "Rena (Historia)", "Alejandra(Computación)", "Sere (Ed. Física)", 
    "Camila (creo) (Ciudadanía)", "Jorgelina(Artes combinadas)", "Alejandra(Programación)"
];
// ==========================================
Dariana
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
    onDisconnect(myRef).remove(); // Si cierra la pestaña, se resta 1 jugador automáticamente
    onDisconnect(myRef).remove();

    loginScreen.classList.add("hidden");
    lobbyScreen.classList.remove("hidden");
@ -62,27 +68,27 @@
onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    const ids = Object.keys(players);
    const count = ids.length; // Esto es el total de conectados
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

// Lógica estricta de asignación: 1 impostor y (Conectados - 1) normales
// Lógica para empezar el juego
startBtn.addEventListener("click", () => {
    onValue(playersRef, (snapshot) => {
        const players = snapshot.val() || {};
@ -90,47 +96,41 @@
        
        if (ids.length < 3) return;

        // 1. Elegimos exactamente 1 ID para que sea el impostor
        // 1 impostor y 1 palabra para el resto
        const randomImpostorId = ids[Math.floor(Math.random() * ids.length)];
        
        // 2. Elegimos exactamente 1 palabra de la lista unificada
        const randomWord = personajesColegio[Math.floor(Math.random() * personajesColegio.length)];

        // 3. Subimos esto a la base de datos para que todos lo vean al mismo tiempo
        set(gameStateRef, {
            jugando: true,
            impostorId: randomImpostorId, // Solo este ID será el impostor (1)
            palabraSecreta: randomWord    // El resto (N-1) verá esta palabra
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

        // Si mi ID coincide con el del impostor sorteado (1 persona)
        if (estado.impostorId === myPlayerId) {
            roleDisplay.innerHTML = `<span class="impostor-text">¡SOS EL IMPOSTOR! 🤫</span><br><br><small>Hacete el tonto y adiviná de quién están hablando.</small>`;
        } 
        // Si mi ID NO coincide, soy parte de los N-1 conectados y veo la variable
        else {
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
