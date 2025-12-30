import { API_BASE, buildPath } from "../../js/config.js";

// elementos
const usernameEl = document.getElementById("usernameValue");
const statusEl   = document.getElementById("statusValue");
const logoutBtn  = document.getElementById("logoutBtn");
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos
let inactivityTimer = null;

// datos desde localStorage
const token = localStorage.getItem("userToken") || localStorage.getItem("xaToken");
const role  = localStorage.getItem("xaRole");
const user  = localStorage.getItem("xaUser");

document.addEventListener("DOMContentLoaded", () => {
  setupInactivityWatcher();
});

// pintar datos (defensivo)
if (usernameEl) {
    usernameEl.textContent = user || "Usuario";
}

if (statusEl) {
    statusEl.textContent = "Activo";
}

// cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            if (token) {
                clearInactivityTimer();
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": token
                    }
                });
            }
        } catch (e) {
            console.warn("Error cerrando sesión", e);
        }

        // limpiar todo
        localStorage.clear();

        // volver a login
        window.location.href = buildPath("/html/login.html");
    });
}

async function logout() {

  clearInactivityTimer();
  const token = localStorage.getItem("adminToken");

  if (token) {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { "Authorization": token }
    });
  }

  localStorage.clear();
  window.location.href = buildPath("/html/login.html");
}

function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    console.warn("Sesión cerrada por inactividad");
    logout();
  }, SESSION_TIMEOUT);
}

function setupInactivityWatcher() {
  const events = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart"
  ];

  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  // arranca el conteo apenas entra
  resetInactivityTimer();
}

function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}
