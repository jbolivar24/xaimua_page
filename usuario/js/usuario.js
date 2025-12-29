// /usuario/js/usuario.js
import { logout, getRole } from "../../js/auth.js";

const usernameEl = document.getElementById("usernameValue");
const statusEl = document.getElementById("statusValue");
const logoutBtn = document.getElementById("logoutBtn");

// Si aún no guardas username, muestro algo básico:
usernameEl.textContent = localStorage.getItem("xaUser") || "—";
statusEl.textContent = "Activo";

logoutBtn.addEventListener("click", logout);
localStorage.setItem("xaUser", username);
