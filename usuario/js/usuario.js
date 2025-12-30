import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

// ================= LOGOUT =================
async function logout() {
  try {
    const token = localStorage.getItem("adminToken");

    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });
    }
  } catch (e) {
    console.warn("Error cerrando sesión", e);
  } finally {
    localStorage.clear();
    window.location.href = buildPath("/html/login.html");
  }
}

// ================= INACTIVIDAD =================
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos
let inactivityTimer = null;

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

  resetInactivityTimer();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // botón logout del header
  const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");
  if (logoutHeaderBtn) {
    logoutHeaderBtn.addEventListener("click", logout);
  }

  // botón logout interno (si lo dejas)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  setupInactivityWatcher();
});

// ================= PREFERENCES (TEMP) =================

const prefs = {
  sound: false,
  darkTheme: true,
  autoPrint: false
};

function loadPreferences() {
  document.getElementById("prefSound").checked = prefs.sound;
  document.getElementById("prefDarkTheme").checked = prefs.darkTheme;
  document.getElementById("prefAutoPrint").checked = prefs.autoPrint;
}

function bindPreferences() {
  document.getElementById("prefSound")
    .addEventListener("change", e => prefs.sound = e.target.checked);

  document.getElementById("prefDarkTheme")
    .addEventListener("change", e => prefs.darkTheme = e.target.checked);

  document.getElementById("prefAutoPrint")
    .addEventListener("change", e => prefs.autoPrint = e.target.checked);
}

document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();
  bindPreferences();
});
